import express from 'express';
import { query, validationResult } from 'express-validator';
import db from '../config/database.js';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// 驗證中間件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// GET /api/repositories - 獲取倉庫列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['stars', 'forks', 'updated', 'created', 'name']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('min_stars').optional().isInt({ min: 0 }).withMessage('Min stars must be non-negative'),
  query('owner_type').optional().isIn(['User', 'Organization']).withMessage('Owner type must be User or Organization')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'stars',
      order = 'desc',
      language,
      min_stars = 0,
      owner_type
    } = req.query;

    const offset = (page - 1) * limit;

    // 構建查詢
    let query = db('repositories as r')
      .leftJoin('owners as o', 'r.owner_id', 'o.id')
      .leftJoin('repository_languages as rl', 'r.id', 'rl.repository_id')
      .select(
        'r.*',
        'o.login as owner_login',
        'o.type as owner_type',
        'o.avatar_url as owner_avatar_url'
      )
      .where('r.stargazers_count', '>=', min_stars)
      .groupBy('r.id', 'o.id');

    // 語言篩選
    if (language) {
      query = query.where('rl.language', 'ilike', `%${language}%`);
    }

    // 擁有者類型篩選
    if (owner_type) {
      query = query.where('o.type', owner_type);
    }

    // 排序
    const sortField = sort === 'updated' ? 'r.updated_at' : 
                     sort === 'created' ? 'r.created_at' :
                     sort === 'name' ? 'r.name' :
                     `r.${sort}_count`;
    
    query = query.orderBy(sortField, order);

    // 分頁
    const repositories = await query.limit(limit).offset(offset);

    // 獲取總數
    const totalQuery = db('repositories as r')
      .leftJoin('owners as o', 'r.owner_id', 'o.id')
      .leftJoin('repository_languages as rl', 'r.id', 'rl.repository_id')
      .where('r.stargazers_count', '>=', min_stars);

    if (language) {
      totalQuery.where('rl.language', 'ilike', `%${language}%`);
    }
    if (owner_type) {
      totalQuery.where('o.type', owner_type);
    }

    const [{ count }] = await totalQuery.count('r.id as count');
    const total = parseInt(count);

    res.json({
      data: repositories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        language,
        min_stars: parseInt(min_stars),
        owner_type,
        sort,
        order
      }
    });

  } catch (error) {
    logger.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// GET /api/repositories/:id - 獲取單個倉庫詳情
router.get('/:id', [
  query('id').isInt({ min: 1 }).withMessage('Repository ID must be a positive integer')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;

    const repository = await db('repositories as r')
      .leftJoin('owners as o', 'r.owner_id', 'o.id')
      .select(
        'r.*',
        'o.login as owner_login',
        'o.type as owner_type',
        'o.avatar_url as owner_avatar_url',
        'o.html_url as owner_html_url'
      )
      .where('r.id', id)
      .first();

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // 獲取語言信息
    const languages = await db('repository_languages')
      .where('repository_id', id)
      .orderBy('bytes', 'desc');

    // 獲取主題標籤
    const topics = await db('repository_topics as rt')
      .join('topics as t', 'rt.topic_id', 't.id')
      .select('t.name')
      .where('rt.repository_id', id);

    res.json({
      ...repository,
      languages,
      topics: topics.map(t => t.name)
    });

  } catch (error) {
    logger.error('Error fetching repository:', error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

// GET /api/repositories/trending - 獲取趨勢倉庫
router.get('/trending', [
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
  try {
    const { period = 'week', language, limit = 10 } = req.query;

    // 計算時間範圍
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    let query = db('repositories as r')
      .leftJoin('owners as o', 'r.owner_id', 'o.id')
      .leftJoin('repository_languages as rl', 'r.id', 'rl.repository_id')
      .select(
        'r.*',
        'o.login as owner_login',
        'o.type as owner_type',
        'o.avatar_url as owner_avatar_url'
      )
      .where('r.created_at', '>=', since)
      .groupBy('r.id', 'o.id')
      .orderBy('r.stargazers_count', 'desc')
      .limit(limit);

    if (language) {
      query = query.where('rl.language', 'ilike', `%${language}%`);
    }

    const repositories = await query;

    res.json({
      data: repositories,
      period,
      language,
      since: since.toISOString()
    });

  } catch (error) {
    logger.error('Error fetching trending repositories:', error);
    res.status(500).json({ error: 'Failed to fetch trending repositories' });
  }
});

export default router;