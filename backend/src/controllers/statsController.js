const StatsService = require('../services/StatsService');
const { validationResult } = require('express-validator');

class StatsController {
  /**
   * 獲取總體統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOverallStats(req, res) {
    try {
      const stats = await StatsService.getOverallStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting overall stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get overall statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取語言統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getLanguageStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        metric = 'repositories',
        limit = 20,
        min_repos = 1
      } = req.query;

      const options = {
        metric,
        limit: parseInt(limit),
        min_repos: parseInt(min_repos)
      };

      const stats = await StatsService.getLanguageStats(options);

      res.json({
        success: true,
        data: stats,
        metric
      });
    } catch (error) {
      console.error('Error getting language stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get language statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取趨勢統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTrendingStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        period = 'week',
        metric = 'stars',
        language,
        limit = 25
      } = req.query;

      const options = {
        period,
        metric,
        language,
        limit: parseInt(limit)
      };

      const stats = await StatsService.getTrendingStats(options);

      res.json({
        success: true,
        data: stats,
        period,
        metric,
        language: language || 'all'
      });
    } catch (error) {
      console.error('Error getting trending stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取分佈統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getDistributionStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        metric = 'stars',
        language,
        owner_type
      } = req.query;

      const options = {
        metric,
        language,
        owner_type
      };

      const stats = await StatsService.getDistributionStats(options);

      res.json({
        success: true,
        data: stats,
        metric,
        filters: {
          language: language || 'all',
          owner_type: owner_type || 'all'
        }
      });
    } catch (error) {
      console.error('Error getting distribution stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get distribution statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取活躍度統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getActivityStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        period = 'month',
        language,
        owner_type
      } = req.query;

      const options = {
        period,
        language,
        owner_type
      };

      const stats = await StatsService.getActivityStats(options);

      res.json({
        success: true,
        data: stats,
        period,
        filters: {
          language: language || 'all',
          owner_type: owner_type || 'all'
        }
      });
    } catch (error) {
      console.error('Error getting activity stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get activity statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取比較統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getComparisonStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        type = 'language',
        metric = 'repositories',
        limit = 10
      } = req.query;

      const options = {
        type,
        metric,
        limit: parseInt(limit)
      };

      const stats = await StatsService.getComparisonStats(options);

      res.json({
        success: true,
        data: stats,
        comparison_type: type,
        metric
      });
    } catch (error) {
      console.error('Error getting comparison stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get comparison statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取時間序列統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTimeSeriesStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        metric = 'repositories',
        period = 'month',
        start_date,
        end_date,
        language,
        owner_type
      } = req.query;

      // 設置默認時間範圍（過去一年）
      const endDate = end_date ? new Date(end_date) : new Date();
      const startDate = start_date ? new Date(start_date) : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

      const options = {
        metric,
        period,
        start_date: startDate,
        end_date: endDate,
        language,
        owner_type
      };

      // 這裡需要實現時間序列統計方法
      // 暫時返回模擬數據結構
      const stats = {
        time_series: [],
        summary: {
          total_points: 0,
          trend: 'stable',
          growth_rate: 0
        }
      };

      res.json({
        success: true,
        data: stats,
        metric,
        period,
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        filters: {
          language: language || 'all',
          owner_type: owner_type || 'all'
        }
      });
    } catch (error) {
      console.error('Error getting time series stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get time series statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取自定義統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getCustomStats(req, res) {
    try {
      const {
        metrics = ['repositories', 'stars'],
        filters = {},
        group_by,
        limit = 50
      } = req.body;

      if (!Array.isArray(metrics) || metrics.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one metric is required'
        });
      }

      const options = {
        metrics,
        filters,
        group_by,
        limit: parseInt(limit)
      };

      // 這裡需要實現自定義統計方法
      // 暫時返回模擬數據結構
      const stats = {
        results: [],
        summary: {
          total_records: 0,
          metrics_calculated: metrics
        }
      };

      res.json({
        success: true,
        data: stats,
        query: options
      });
    } catch (error) {
      console.error('Error getting custom stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get custom statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取統計摘要
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getStatsSummary(req, res) {
    try {
      const {
        include_trending = true,
        include_languages = true,
        include_activity = true
      } = req.query;

      const summary = {};

      // 總體統計
      summary.overall = await StatsService.getOverallStats();

      // 趨勢統計
      if (include_trending === 'true') {
        summary.trending = await StatsService.getTrendingStats({
          period: 'week',
          limit: 10
        });
      }

      // 語言統計
      if (include_languages === 'true') {
        summary.languages = await StatsService.getLanguageStats({
          limit: 10
        });
      }

      // 活躍度統計
      if (include_activity === 'true') {
        summary.activity = await StatsService.getActivityStats({
          period: 'month'
        });
      }

      res.json({
        success: true,
        data: summary,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting stats summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = StatsController;