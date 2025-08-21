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

// GET /api/stats/overview - 獲取總體統計
router.get('/overview', async (req, res) => {
  try {
    // 基本統計
    const [repositoryStats] = await db('repositories')
      .select(
        db.raw('COUNT(*) as total_repositories'),
        db.raw('SUM(stargazers_count) as total_stars'),
        db.raw('SUM(forks_count) as total_forks'),
        db.raw('SUM(watchers_count) as total_watchers'),
        db.raw('AVG(stargazers_count) as avg_stars'),
        db.raw('MAX(stargazers_count) as max_stars')
      );

    const [ownerStats] = await db('owners')
      .select(
        db.raw('COUNT(*) as total_owners'),
        db.raw('COUNT(CASE WHEN type = \'User\' THEN 1 END) as total_users'),
        db.raw('COUNT(CASE WHEN type = \'Organization\' THEN 1 END) as total_organizations')
      );

    // 最近活動統計
    const recentActivity = await db('repositories')
      .select(
        db.raw('COUNT(CASE WHEN created_at >= NOW() - INTERVAL \'7 days\' THEN 1 END) as repos_last_week'),
        db.raw('COUNT(CASE WHEN updated_at >= NOW() - INTERVAL \'7 days\' THEN 1 END) as updated_last_week')
      )
      .first();

    res.json({
      repositories: {
        total: parseInt(repositoryStats.total_repositories),
        total_stars: parseInt(repositoryStats.total_stars || 0),
        total_forks: parseInt(repositoryStats.total_forks || 0),
        total_watchers: parseInt(repositoryStats.total_watchers || 0),
        avg_stars: parseFloat(repositoryStats.avg_stars || 0).toFixed(1),
        max_stars: parseInt(repositoryStats.max_stars || 0)
      },
      owners: {
        total: parseInt(ownerStats.total_owners),
        users: parseInt(ownerStats.total_users),
        organizations: parseInt(ownerStats.total_organizations)
      },
      activity: {
        repos_created_last_week: parseInt(recentActivity.repos_last_week || 0),
        repos_updated_last_week: parseInt(recentActivity.updated_last_week || 0)
      }
    });

  } catch (error) {
    logger.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Failed to fetch overview statistics' });
  }
});

// GET /api/stats/languages - 獲取語言統計
router.get('/languages', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], handleValidationErrors, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const languages = await db('repository_languages')
      .select(
        'language',
        db.raw('COUNT(DISTINCT repository_id) as repository_count'),
        db.raw('SUM(bytes) as total_bytes'),
        db.raw('AVG(bytes) as avg_bytes')
      )
      .whereNotNull('language')
      .groupBy('language')
      .orderBy('repository_count', 'desc')
      .limit(limit);

    // 計算百分比
    const [{ total_repos }] = await db('repositories')
      .count('id as total_repos');

    const languagesWithPercentage = languages.map(lang => ({
      ...lang,
      repository_count: parseInt(lang.repository_count),
      total_bytes: parseInt(lang.total_bytes),
      avg_bytes: parseInt(lang.avg_bytes),
      percentage: ((lang.repository_count / total_repos) * 100).toFixed(2)
    }));

    res.json({
      data: languagesWithPercentage,
      total_repositories: parseInt(total_repos),
      limit: parseInt(limit)
    });

  } catch (error) {
    logger.error('Error fetching language stats:', error);
    res.status(500).json({ error: 'Failed to fetch language statistics' });
  }
});

// GET /api/stats/topics - 獲取主題統計
router.get('/topics', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], handleValidationErrors, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const topics = await db('topics as t')
      .join('repository_topics as rt', 't.id', 'rt.topic_id')
      .select(
        't.name',
        db.raw('COUNT(rt.repository_id) as repository_count')
      )
      .groupBy('t.id', 't.name')
      .orderBy('repository_count', 'desc')
      .limit(limit);

    // 計算百分比
    const [{ total_repos }] = await db('repositories')
      .count('id as total_repos');

    const topicsWithPercentage = topics.map(topic => ({
      ...topic,
      repository_count: parseInt(topic.repository_count),
      percentage: ((topic.repository_count / total_repos) * 100).toFixed(2)
    }));

    res.json({
      data: topicsWithPercentage,
      total_repositories: parseInt(total_repos),
      limit: parseInt(limit)
    });

  } catch (error) {
    logger.error('Error fetching topic stats:', error);
    res.status(500).json({ error: 'Failed to fetch topic statistics' });
  }
});

// GET /api/stats/trends - 獲取趨勢統計
router.get('/trends', [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year'),
  query('metric').optional().isIn(['repositories', 'stars', 'forks']).withMessage('Metric must be repositories, stars, or forks')
], handleValidationErrors, async (req, res) => {
  try {
    const { period = 'month', metric = 'repositories' } = req.query;

    // 計算時間間隔
    let dateFormat, intervalDays;
    switch (period) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        intervalDays = 30; // 顯示最近30天
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        intervalDays = 84; // 顯示最近12週
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        intervalDays = 365; // 顯示最近12個月
        break;
      case 'year':
        dateFormat = 'YYYY';
        intervalDays = 1825; // 顯示最近5年
        break;
    }

    let query;
    if (metric === 'repositories') {
      query = db('repositories')
        .select(
          db.raw(`TO_CHAR(created_at, '${dateFormat}') as period`),
          db.raw('COUNT(*) as count')
        )
        .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${intervalDays} days'`))
        .groupBy(db.raw(`TO_CHAR(created_at, '${dateFormat}')`))
        .orderBy('period');
    } else {
      // stars 或 forks 的累積趨勢
      const field = metric === 'stars' ? 'stargazers_count' : 'forks_count';
      query = db('repositories')
        .select(
          db.raw(`TO_CHAR(created_at, '${dateFormat}') as period`),
          db.raw(`SUM(${field}) as count`)
        )
        .where('created_at', '>=', db.raw(`NOW() - INTERVAL '${intervalDays} days'`))
        .groupBy(db.raw(`TO_CHAR(created_at, '${dateFormat}')`))
        .orderBy('period');
    }

    const trends = await query;

    res.json({
      data: trends.map(item => ({
        period: item.period,
        count: parseInt(item.count)
      })),
      period,
      metric,
      interval_days: intervalDays
    });

  } catch (error) {
    logger.error('Error fetching trend stats:', error);
    res.status(500).json({ error: 'Failed to fetch trend statistics' });
  }
});

// GET /api/stats/distribution - 獲取分佈統計
router.get('/distribution', [
  query('metric').optional().isIn(['stars', 'forks', 'size']).withMessage('Metric must be stars, forks, or size')
], handleValidationErrors, async (req, res) => {
  try {
    const { metric = 'stars' } = req.query;

    const field = metric === 'stars' ? 'stargazers_count' :
                 metric === 'forks' ? 'forks_count' : 'size';

    // 定義分佈區間
    let ranges;
    if (metric === 'stars') {
      ranges = [
        { min: 0, max: 10, label: '0-10' },
        { min: 11, max: 50, label: '11-50' },
        { min: 51, max: 100, label: '51-100' },
        { min: 101, max: 500, label: '101-500' },
        { min: 501, max: 1000, label: '501-1K' },
        { min: 1001, max: 5000, label: '1K-5K' },
        { min: 5001, max: 10000, label: '5K-10K' },
        { min: 10001, max: null, label: '10K+' }
      ];
    } else if (metric === 'forks') {
      ranges = [
        { min: 0, max: 5, label: '0-5' },
        { min: 6, max: 20, label: '6-20' },
        { min: 21, max: 50, label: '21-50' },
        { min: 51, max: 100, label: '51-100' },
        { min: 101, max: 500, label: '101-500' },
        { min: 501, max: null, label: '500+' }
      ];
    } else {
      ranges = [
        { min: 0, max: 1000, label: '0-1MB' },
        { min: 1001, max: 10000, label: '1-10MB' },
        { min: 10001, max: 50000, label: '10-50MB' },
        { min: 50001, max: 100000, label: '50-100MB' },
        { min: 100001, max: null, label: '100MB+' }
      ];
    }

    const distribution = [];
    for (const range of ranges) {
      let query = db('repositories')
        .count('id as count')
        .where(field, '>=', range.min);
      
      if (range.max !== null) {
        query = query.where(field, '<=', range.max);
      }
      
      const [{ count }] = await query;
      distribution.push({
        range: range.label,
        count: parseInt(count),
        min: range.min,
        max: range.max
      });
    }

    // 計算總數和百分比
    const [{ total }] = await db('repositories').count('id as total');
    const distributionWithPercentage = distribution.map(item => ({
      ...item,
      percentage: ((item.count / total) * 100).toFixed(2)
    }));

    res.json({
      data: distributionWithPercentage,
      metric,
      total_repositories: parseInt(total)
    });

  } catch (error) {
    logger.error('Error fetching distribution stats:', error);
    res.status(500).json({ error: 'Failed to fetch distribution statistics' });
  }
});

export default router;