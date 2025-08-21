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

// GET /api/owners - 獲取擁有者列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['User', 'Organization']).withMessage('Type must be User or Organization'),
  query('sort').optional().isIn(['followers', 'public_repos', 'login']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      sort = 'followers',
      order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // 構建查詢
    let query = db('owners')
      .select('*');

    // 類型篩選
    if (type) {
      query = query.where('type', type);
    }

    // 排序
    const sortField = sort === 'login' ? 'login' : `${sort}_count`;
    query = query.orderBy(sortField, order);

    // 分頁
    const owners = await query.limit(limit).offset(offset);

    // 獲取總數
    const totalQuery = db('owners');
    if (type) {
      totalQuery.where('type', type);
    }
    const [{ count }] = await totalQuery.count('id as count');
    const total = parseInt(count);

    res.json({
      data: owners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        type,
        sort,
        order
      }
    });

  } catch (error) {
    logger.error('Error fetching owners:', error);
    res.status(500).json({ error: 'Failed to fetch owners' });
  }
});

// GET /api/owners/:id - 獲取單個擁有者詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const owner = await db('owners')
      .where('id', id)
      .first();

    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // 獲取該擁有者的倉庫
    const repositories = await db('repositories')
      .where('owner_id', id)
      .orderBy('stargazers_count', 'desc')
      .limit(10);

    // 計算統計信息
    const stats = await db('repositories')
      .where('owner_id', id)
      .select(
        db.raw('COUNT(*) as total_repositories'),
        db.raw('SUM(stargazers_count) as total_stars'),
        db.raw('SUM(forks_count) as total_forks'),
        db.raw('AVG(stargazers_count) as avg_stars')
      )
      .first();

    res.json({
      ...owner,
      repositories,
      stats: {
        total_repositories: parseInt(stats.total_repositories),
        total_stars: parseInt(stats.total_stars || 0),
        total_forks: parseInt(stats.total_forks || 0),
        avg_stars: parseFloat(stats.avg_stars || 0).toFixed(1)
      }
    });

  } catch (error) {
    logger.error('Error fetching owner:', error);
    res.status(500).json({ error: 'Failed to fetch owner' });
  }
});

// GET /api/owners/:id/repositories - 獲取擁有者的所有倉庫
router.get('/:id/repositories', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['stars', 'forks', 'updated', 'created', 'name']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sort = 'stars',
      order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // 檢查擁有者是否存在
    const owner = await db('owners').where('id', id).first();
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // 構建查詢
    let query = db('repositories')
      .where('owner_id', id);

    // 排序
    const sortField = sort === 'updated' ? 'updated_at' : 
                     sort === 'created' ? 'created_at' :
                     sort === 'name' ? 'name' :
                     `${sort}_count`;
    
    query = query.orderBy(sortField, order);

    // 分頁
    const repositories = await query.limit(limit).offset(offset);

    // 獲取總數
    const [{ count }] = await db('repositories')
      .where('owner_id', id)
      .count('id as count');
    const total = parseInt(count);

    res.json({
      data: repositories,
      owner: {
        id: owner.id,
        login: owner.login,
        type: owner.type
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        sort,
        order
      }
    });

  } catch (error) {
    logger.error('Error fetching owner repositories:', error);
    res.status(500).json({ error: 'Failed to fetch owner repositories' });
  }
});

// GET /api/owners/top - 獲取頂級擁有者
router.get('/top', [
  query('metric').optional().isIn(['followers', 'repositories', 'stars']).withMessage('Metric must be followers, repositories, or stars'),
  query('type').optional().isIn(['User', 'Organization']).withMessage('Type must be User or Organization'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      metric = 'followers',
      type,
      limit = 10
    } = req.query;

    let query;

    if (metric === 'stars') {
      // 按總星數排序
      query = db('owners as o')
        .leftJoin('repositories as r', 'o.id', 'r.owner_id')
        .select(
          'o.*',
          db.raw('COALESCE(SUM(r.stargazers_count), 0) as total_stars'),
          db.raw('COUNT(r.id) as repository_count')
        )
        .groupBy('o.id')
        .orderBy('total_stars', 'desc');
    } else if (metric === 'repositories') {
      // 按倉庫數量排序
      query = db('owners as o')
        .leftJoin('repositories as r', 'o.id', 'r.owner_id')
        .select(
          'o.*',
          db.raw('COUNT(r.id) as repository_count'),
          db.raw('COALESCE(SUM(r.stargazers_count), 0) as total_stars')
        )
        .groupBy('o.id')
        .orderBy('repository_count', 'desc');
    } else {
      // 按關注者數量排序
      query = db('owners as o')
        .leftJoin('repositories as r', 'o.id', 'r.owner_id')
        .select(
          'o.*',
          db.raw('COUNT(r.id) as repository_count'),
          db.raw('COALESCE(SUM(r.stargazers_count), 0) as total_stars')
        )
        .groupBy('o.id')
        .orderBy('o.followers_count', 'desc');
    }

    // 類型篩選
    if (type) {
      query = query.where('o.type', type);
    }

    const owners = await query.limit(limit);

    res.json({
      data: owners,
      metric,
      type,
      limit: parseInt(limit)
    });

  } catch (error) {
    logger.error('Error fetching top owners:', error);
    res.status(500).json({ error: 'Failed to fetch top owners' });
  }
});

export default router;