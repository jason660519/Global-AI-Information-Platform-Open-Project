const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

// 導入控制器
const RepositoryController = require('../controllers/repositoryController');
const OwnerController = require('../controllers/ownerController');
const StatsController = require('../controllers/statsController');
const SearchController = require('../controllers/searchController');
const TopicController = require('../controllers/topicController');

// 中間件
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 安全中間件
router.use(helmet());

// 速率限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 1000, // 每個 IP 最多 1000 次請求
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分鐘
  max: 60, // 每個 IP 最多 60 次搜索請求
  message: {
    success: false,
    message: 'Too many search requests, please try again later.'
  }
});

router.use(apiLimiter);

// API 根路由
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GitHub Repository Information Platform API',
    version: '1.0.0',
    endpoints: {
      repositories: '/api/repositories',
      owners: '/api/owners',
      topics: '/api/topics',
      stats: '/api/stats',
      search: '/api/search'
    },
    documentation: '/api/docs'
  });
});

// ==================== 倉庫相關路由 ====================

// 獲取倉庫列表
router.get('/repositories', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['stars', 'forks', 'updated', 'created', 'name']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('min_stars').optional().isInt({ min: 0 }).withMessage('Min stars must be a non-negative integer'),
  query('max_stars').optional().isInt({ min: 0 }).withMessage('Max stars must be a non-negative integer'),
  query('owner_type').optional().isIn(['User', 'Organization']).withMessage('Owner type must be User or Organization')
], RepositoryController.getRepositories);

// 搜索倉庫
router.get('/repositories/search', [
  searchLimiter,
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'stars', 'forks', 'updated']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], RepositoryController.searchRepositories);

// 獲取趨勢倉庫
router.get('/repositories/trending', [
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], RepositoryController.getTrendingRepositories);

// 獲取語言統計
router.get('/repositories/languages', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('min_repos').optional().isInt({ min: 1 }).withMessage('Min repos must be a positive integer')
], RepositoryController.getLanguageStats);

// 獲取倉庫統計
router.get('/repositories/stats', RepositoryController.getRepositoryStats);

// 獲取倉庫建議
router.get('/repositories/suggestions', [
  searchLimiter,
  query('q').notEmpty().withMessage('Query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], RepositoryController.getRepositorySuggestions);

// 根據ID獲取倉庫詳情
router.get('/repositories/:id', [
  param('id').isInt({ min: 1 }).withMessage('Repository ID must be a positive integer')
], RepositoryController.getRepositoryById);

// 獲取相關倉庫
router.get('/repositories/:id/related', [
  param('id').isInt({ min: 1 }).withMessage('Repository ID must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], RepositoryController.getRelatedRepositories);

// ==================== 擁有者相關路由 ====================

// 獲取擁有者列表
router.get('/owners', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['followers', 'public_repos', 'created', 'name']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('type').optional().isIn(['User', 'Organization']).withMessage('Type must be User or Organization')
], OwnerController.getOwners);

// 搜索擁有者
router.get('/owners/search', [
  searchLimiter,
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'followers', 'repositories', 'joined']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], OwnerController.searchOwners);

// 獲取頂級擁有者
router.get('/owners/top', [
  query('metric').optional().isIn(['followers', 'repositories', 'stars']).withMessage('Metric must be followers, repositories, or stars'),
  query('type').optional().isIn(['User', 'Organization']).withMessage('Type must be User or Organization'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], OwnerController.getTopOwners);

// 獲取擁有者類型統計
router.get('/owners/stats', OwnerController.getOwnerTypeStats);

// 獲取擁有者建議
router.get('/owners/suggestions', [
  searchLimiter,
  query('q').notEmpty().withMessage('Query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], OwnerController.getOwnerSuggestions);

// 根據ID獲取擁有者詳情
router.get('/owners/:id', [
  param('id').isInt({ min: 1 }).withMessage('Owner ID must be a positive integer')
], OwnerController.getOwnerById);

// 根據登錄名獲取擁有者
router.get('/owners/login/:login', [
  param('login').isString().isLength({ min: 1 }).withMessage('Login must be a non-empty string')
], OwnerController.getOwnerByLogin);

// 獲取擁有者的倉庫
router.get('/owners/:id/repositories', [
  param('id').isInt({ min: 1 }).withMessage('Owner ID must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['stars', 'forks', 'updated', 'created', 'name']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], OwnerController.getOwnerRepositories);

// 獲取擁有者語言分佈
router.get('/owners/:id/languages', [
  param('id').isInt({ min: 1 }).withMessage('Owner ID must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], OwnerController.getOwnerLanguageDistribution);

// 獲取相似擁有者
router.get('/owners/:id/similar', [
  param('id').isInt({ min: 1 }).withMessage('Owner ID must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], OwnerController.getSimilarOwners);

// ==================== 主題相關路由 ====================

// 獲取主題列表
router.get('/topics', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['repositories_count', 'name', 'created']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], TopicController.getTopics);

// 搜索主題
router.get('/topics/search', [
  searchLimiter,
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'repositories_count', 'name']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], TopicController.searchTopics);

// 獲取熱門主題
router.get('/topics/popular', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('min_repos').optional().isInt({ min: 1 }).withMessage('Min repos must be a positive integer')
], TopicController.getPopularTopics);

// 獲取主題統計
router.get('/topics/stats', TopicController.getTopicStats);

// 獲取主題建議
router.get('/topics/suggestions', [
  searchLimiter,
  query('q').notEmpty().withMessage('Query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], TopicController.getTopicSuggestions);

// 創建主題
router.post('/topics', [
  body('name').notEmpty().isString().withMessage('Topic name is required and must be a string'),
  body('description').optional().isString().withMessage('Description must be a string')
], TopicController.createTopic);

// 根據ID獲取主題詳情
router.get('/topics/:id', [
  param('id').isInt({ min: 1 }).withMessage('Topic ID must be a positive integer')
], TopicController.getTopicById);

// 根據名稱獲取主題
router.get('/topics/name/:name', [
  param('name').isString().isLength({ min: 1 }).withMessage('Topic name must be a non-empty string')
], TopicController.getTopicByName);

// 獲取主題的倉庫
router.get('/topics/:id/repositories', [
  param('id').isInt({ min: 1 }).withMessage('Topic ID must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['stars', 'forks', 'updated', 'created']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], TopicController.getTopicRepositories);

// 獲取相關主題
router.get('/topics/:id/related', [
  param('id').isInt({ min: 1 }).withMessage('Topic ID must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], TopicController.getRelatedTopics);

// 更新主題倉庫計數
router.put('/topics/:id/update-count', [
  param('id').isInt({ min: 1 }).withMessage('Topic ID must be a positive integer')
], TopicController.updateTopicRepositoryCount);

// 更新所有主題倉庫計數
router.put('/topics/update-all-counts', TopicController.updateAllTopicRepositoryCounts);

// ==================== 統計相關路由 ====================

// 獲取總體統計
router.get('/stats', StatsController.getOverallStats);

// 獲取統計摘要
router.get('/stats/summary', [
  query('include_trending').optional().isBoolean().withMessage('Include trending must be a boolean'),
  query('include_languages').optional().isBoolean().withMessage('Include languages must be a boolean'),
  query('include_activity').optional().isBoolean().withMessage('Include activity must be a boolean')
], StatsController.getStatsSummary);

// 獲取語言統計
router.get('/stats/languages', [
  query('metric').optional().isIn(['repositories', 'bytes']).withMessage('Metric must be repositories or bytes'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('min_repos').optional().isInt({ min: 1 }).withMessage('Min repos must be a positive integer')
], StatsController.getLanguageStats);

// 獲取趨勢統計
router.get('/stats/trending', [
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  query('metric').optional().isIn(['stars', 'forks', 'repositories']).withMessage('Invalid metric'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], StatsController.getTrendingStats);

// 獲取分佈統計
router.get('/stats/distribution', [
  query('metric').optional().isIn(['stars', 'forks', 'size']).withMessage('Metric must be stars, forks, or size'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('owner_type').optional().isIn(['User', 'Organization']).withMessage('Owner type must be User or Organization')
], StatsController.getDistributionStats);

// 獲取活躍度統計
router.get('/stats/activity', [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('owner_type').optional().isIn(['User', 'Organization']).withMessage('Owner type must be User or Organization')
], StatsController.getActivityStats);

// 獲取比較統計
router.get('/stats/comparison', [
  query('type').optional().isIn(['language', 'owner_type']).withMessage('Type must be language or owner_type'),
  query('metric').optional().isIn(['repositories', 'stars', 'forks']).withMessage('Invalid metric'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], StatsController.getComparisonStats);

// 獲取時間序列統計
router.get('/stats/timeseries', [
  query('metric').optional().isIn(['repositories', 'stars', 'forks']).withMessage('Invalid metric'),
  query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month'),
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('owner_type').optional().isIn(['User', 'Organization']).withMessage('Owner type must be User or Organization')
], StatsController.getTimeSeriesStats);

// 自定義統計
router.post('/stats/custom', [
  body('metrics').isArray({ min: 1 }).withMessage('Metrics must be a non-empty array'),
  body('metrics.*').isIn(['repositories', 'stars', 'forks', 'owners', 'languages', 'topics']).withMessage('Invalid metric'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('group_by').optional().isString().withMessage('Group by must be a string'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], StatsController.getCustomStats);

// ==================== 搜索相關路由 ====================

// 通用搜索
router.get('/search', [
  searchLimiter,
  query('q').notEmpty().withMessage('Search query is required'),
  query('type').optional().isIn(['repositories', 'owners']).withMessage('Type must be repositories or owners'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'stars', 'forks', 'updated', 'followers']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], SearchController.search);

// 獲取搜索建議
router.get('/search/suggestions', [
  searchLimiter,
  query('q').notEmpty().withMessage('Query is required'),
  query('type').optional().isIn(['repositories', 'owners', 'languages', 'topics']).withMessage('Invalid type'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], SearchController.getSuggestions);

// 獲取自動完成
router.get('/search/autocomplete', [
  searchLimiter,
  query('q').notEmpty().withMessage('Query is required'),
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10')
], SearchController.getAutocomplete);

// 高級搜索
router.post('/search/advanced', [
  searchLimiter,
  body('query').notEmpty().withMessage('Search query is required'),
  body('type').optional().isIn(['repositories', 'owners']).withMessage('Type must be repositories or owners'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  body('sort').optional().isString().withMessage('Sort must be a string'),
  body('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], SearchController.advancedSearch);

// 獲取熱門搜索關鍵字
router.get('/search/popular', [
  query('type').optional().isIn(['repositories', 'owners', 'languages', 'topics']).withMessage('Invalid type'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], SearchController.getPopularSearchTerms);

// 獲取搜索統計
router.get('/search/stats', [
  searchLimiter,
  query('q').notEmpty().withMessage('Query is required')
], SearchController.getSearchStats);

// 搜索倉庫
router.get('/search/repositories', [
  searchLimiter,
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'stars', 'forks', 'updated']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], SearchController.searchRepositories);

// 搜索擁有者
router.get('/search/owners', [
  searchLimiter,
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['relevance', 'followers', 'repositories', 'joined']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], SearchController.searchOwners);

// 獲取搜索歷史
router.get('/search/history', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['repositories', 'owners']).withMessage('Type must be repositories or owners')
], SearchController.getSearchHistory);

// 清除搜索歷史
router.delete('/search/history', SearchController.clearSearchHistory);

// ==================== 健康檢查和文檔 ====================

// 健康檢查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API 文檔
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    base_url: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      repositories: {
        list: 'GET /repositories',
        search: 'GET /repositories/search',
        trending: 'GET /repositories/trending',
        languages: 'GET /repositories/languages',
        stats: 'GET /repositories/stats',
        suggestions: 'GET /repositories/suggestions',
        detail: 'GET /repositories/:id',
        related: 'GET /repositories/:id/related'
      },
      owners: {
        list: 'GET /owners',
        search: 'GET /owners/search',
        top: 'GET /owners/top',
        stats: 'GET /owners/stats',
        suggestions: 'GET /owners/suggestions',
        detail: 'GET /owners/:id',
        by_login: 'GET /owners/login/:login',
        repositories: 'GET /owners/:id/repositories',
        languages: 'GET /owners/:id/languages',
        similar: 'GET /owners/:id/similar'
      },
      topics: {
        list: 'GET /topics',
        search: 'GET /topics/search',
        popular: 'GET /topics/popular',
        stats: 'GET /topics/stats',
        suggestions: 'GET /topics/suggestions',
        create: 'POST /topics',
        detail: 'GET /topics/:id',
        by_name: 'GET /topics/name/:name',
        repositories: 'GET /topics/:id/repositories',
        related: 'GET /topics/:id/related'
      },
      stats: {
        overall: 'GET /stats',
        summary: 'GET /stats/summary',
        languages: 'GET /stats/languages',
        trending: 'GET /stats/trending',
        distribution: 'GET /stats/distribution',
        activity: 'GET /stats/activity',
        comparison: 'GET /stats/comparison',
        timeseries: 'GET /stats/timeseries',
        custom: 'POST /stats/custom'
      },
      search: {
        general: 'GET /search',
        suggestions: 'GET /search/suggestions',
        autocomplete: 'GET /search/autocomplete',
        advanced: 'POST /search/advanced',
        popular: 'GET /search/popular',
        stats: 'GET /search/stats',
        repositories: 'GET /search/repositories',
        owners: 'GET /search/owners',
        history: 'GET /search/history'
      }
    },
    rate_limits: {
      general: '1000 requests per 15 minutes',
      search: '60 requests per minute'
    }
  });
});

// 404 處理
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: '/api/docs'
  });
});

// 錯誤處理中間件
router.use((error, req, res, next) => {
  console.error('API Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      details: error
    } : undefined
  });
});

module.exports = router;