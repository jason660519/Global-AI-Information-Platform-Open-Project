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

// GET /api/search/repositories - 搜索倉庫
router.get('/repositories', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'stars', 'forks', 'updated']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('min_stars').optional().isInt({ min: 0 }).withMessage('Min stars must be non-negative')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      sort = 'relevance',
      order = 'desc',
      language,
      min_stars = 0
    } = req.query;

    const offset = (page - 1) * limit;
    const searchTerm = `%${q.toLowerCase()}%`;

    // 構建基本查詢
    let query = db('repositories as r')
      .leftJoin('owners as o', 'r.owner_id', 'o.id')
      .leftJoin('repository_languages as rl', 'r.id', 'rl.repository_id')
      .select(
        'r.*',
        'o.login as owner_login',
        'o.type as owner_type',
        'o.avatar_url as owner_avatar_url'
      )
      .where(function() {
        this.where(db.raw('LOWER(r.name)'), 'like', searchTerm)
            .orWhere(db.raw('LOWER(r.description)'), 'like', searchTerm)
            .orWhere(db.raw('LOWER(o.login)'), 'like', searchTerm);
      })
      .where('r.stargazers_count', '>=', min_stars)
      .groupBy('r.id', 'o.id');

    // 語言篩選
    if (language) {
      query = query.where('rl.language', 'ilike', `%${language}%`);
    }

    // 排序
    if (sort === 'relevance') {
      // 相關性排序：名稱匹配 > 描述匹配 > 星數
      query = query.orderByRaw(`
        CASE 
          WHEN LOWER(r.name) LIKE ? THEN 1
          WHEN LOWER(r.description) LIKE ? THEN 2
          ELSE 3
        END,
        r.stargazers_count DESC
      `, [searchTerm, searchTerm]);
    } else {
      const sortField = sort === 'updated' ? 'r.updated_at' :
                       sort === 'stars' ? 'r.stargazers_count' :
                       'r.forks_count';
      query = query.orderBy(sortField, order);
    }

    // 分頁
    const repositories = await query.limit(limit).offset(offset);

    // 獲取總數
    const totalQuery = db('repositories as r')
      .leftJoin('owners as o', 'r.owner_id', 'o.id')
      .leftJoin('repository_languages as rl', 'r.id', 'rl.repository_id')
      .where(function() {
        this.where(db.raw('LOWER(r.name)'), 'like', searchTerm)
            .orWhere(db.raw('LOWER(r.description)'), 'like', searchTerm)
            .orWhere(db.raw('LOWER(o.login)'), 'like', searchTerm);
      })
      .where('r.stargazers_count', '>=', min_stars);

    if (language) {
      totalQuery.where('rl.language', 'ilike', `%${language}%`);
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
      search: {
        query: q,
        language,
        min_stars: parseInt(min_stars),
        sort,
        order
      }
    });

  } catch (error) {
    logger.error('Error searching repositories:', error);
    res.status(500).json({ error: 'Failed to search repositories' });
  }
});

// GET /api/search/owners - 搜索擁有者
router.get('/owners', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['User', 'Organization']).withMessage('Type must be User or Organization'),
  query('sort').optional().isIn(['relevance', 'followers', 'repositories']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      type,
      sort = 'relevance',
      order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const searchTerm = `%${q.toLowerCase()}%`;

    // 構建查詢
    let query = db('owners as o')
      .leftJoin('repositories as r', 'o.id', 'r.owner_id')
      .select(
        'o.*',
        db.raw('COUNT(r.id) as repository_count'),
        db.raw('COALESCE(SUM(r.stargazers_count), 0) as total_stars')
      )
      .where(function() {
        this.where(db.raw('LOWER(o.login)'), 'like', searchTerm)
            .orWhere(db.raw('LOWER(o.name)'), 'like', searchTerm);
      })
      .groupBy('o.id');

    // 類型篩選
    if (type) {
      query = query.where('o.type', type);
    }

    // 排序
    if (sort === 'relevance') {
      query = query.orderByRaw(`
        CASE 
          WHEN LOWER(o.login) LIKE ? THEN 1
          WHEN LOWER(o.name) LIKE ? THEN 2
          ELSE 3
        END,
        o.followers_count DESC
      `, [searchTerm, searchTerm]);
    } else if (sort === 'repositories') {
      query = query.orderBy('repository_count', order);
    } else {
      query = query.orderBy('o.followers_count', order);
    }

    // 分頁
    const owners = await query.limit(limit).offset(offset);

    // 獲取總數
    const totalQuery = db('owners')
      .where(function() {
        this.where(db.raw('LOWER(login)'), 'like', searchTerm)
            .orWhere(db.raw('LOWER(name)'), 'like', searchTerm);
      });

    if (type) {
      totalQuery.where('type', type);
    }

    const [{ count }] = await totalQuery.count('id as count');
    const total = parseInt(count);

    res.json({
      data: owners.map(owner => ({
        ...owner,
        repository_count: parseInt(owner.repository_count),
        total_stars: parseInt(owner.total_stars)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      search: {
        query: q,
        type,
        sort,
        order
      }
    });

  } catch (error) {
    logger.error('Error searching owners:', error);
    res.status(500).json({ error: 'Failed to search owners' });
  }
});

// GET /api/search/suggestions - 獲取搜索建議
router.get('/suggestions', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('type').optional().isIn(['repositories', 'owners', 'languages', 'topics']).withMessage('Invalid suggestion type'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      q,
      type = 'repositories',
      limit = 10
    } = req.query;

    const searchTerm = `%${q.toLowerCase()}%`;
    let suggestions = [];

    switch (type) {
      case 'repositories':
        suggestions = await db('repositories')
          .select('name', 'stargazers_count')
          .where(db.raw('LOWER(name)'), 'like', searchTerm)
          .orderBy('stargazers_count', 'desc')
          .limit(limit);
        break;

      case 'owners':
        suggestions = await db('owners')
          .select('login', 'followers_count')
          .where(db.raw('LOWER(login)'), 'like', searchTerm)
          .orderBy('followers_count', 'desc')
          .limit(limit);
        break;

      case 'languages':
        suggestions = await db('repository_languages')
          .select('language', db.raw('COUNT(DISTINCT repository_id) as count'))
          .where(db.raw('LOWER(language)'), 'like', searchTerm)
          .whereNotNull('language')
          .groupBy('language')
          .orderBy('count', 'desc')
          .limit(limit);
        break;

      case 'topics':
        suggestions = await db('topics')
          .join('repository_topics', 'topics.id', 'repository_topics.topic_id')
          .select('topics.name', db.raw('COUNT(repository_topics.repository_id) as count'))
          .where(db.raw('LOWER(topics.name)'), 'like', searchTerm)
          .groupBy('topics.id', 'topics.name')
          .orderBy('count', 'desc')
          .limit(limit);
        break;
    }

    res.json({
      data: suggestions,
      query: q,
      type,
      limit: parseInt(limit)
    });

  } catch (error) {
    logger.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
});

// GET /api/search/autocomplete - 自動完成
router.get('/autocomplete', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10')
], handleValidationErrors, async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    const searchTerm = `${q.toLowerCase()}%`; // 前綴匹配

    // 並行查詢多個類型的建議
    const [repositories, owners, languages] = await Promise.all([
      db('repositories')
        .select('name as value', db.raw('\'repository\' as type'))
        .where(db.raw('LOWER(name)'), 'like', searchTerm)
        .orderBy('stargazers_count', 'desc')
        .limit(limit),
      
      db('owners')
        .select('login as value', db.raw('\'owner\' as type'))
        .where(db.raw('LOWER(login)'), 'like', searchTerm)
        .orderBy('followers_count', 'desc')
        .limit(limit),
      
      db('repository_languages')
        .select('language as value', db.raw('\'language\' as type'))
        .where(db.raw('LOWER(language)'), 'like', searchTerm)
        .whereNotNull('language')
        .groupBy('language')
        .orderBy(db.raw('COUNT(DISTINCT repository_id)'), 'desc')
        .limit(limit)
    ]);

    // 合併並排序結果
    const allSuggestions = [...repositories, ...owners, ...languages]
      .slice(0, limit * 2); // 限制總數

    res.json({
      data: allSuggestions,
      query: q,
      limit: parseInt(limit)
    });

  } catch (error) {
    logger.error('Error fetching autocomplete suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch autocomplete suggestions' });
  }
});

export default router;