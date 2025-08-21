const SearchService = require('../services/SearchService');
const { validationResult } = require('express-validator');

class SearchController {
  /**
   * 通用搜索
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async search(req, res) {
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
        q: query,
        type = 'repositories',
        page = 1,
        limit = 20,
        sort = 'relevance',
        order = 'desc',
        ...filters
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        ...filters
      };

      let result;
      switch (type) {
        case 'repositories':
          result = await SearchService.searchRepositories(query, options);
          break;
        case 'owners':
          result = await SearchService.searchOwners(query, options);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Invalid search type: ${type}`
          });
      }

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        search_query: query,
        search_type: type,
        total_count: result.pagination.total
      });
    } catch (error) {
      console.error('Error performing search:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform search',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取搜索建議
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getSuggestions(req, res) {
    try {
      const {
        q: query,
        type = 'repositories',
        limit = 10
      } = req.query;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          data: [],
          query: query || ''
        });
      }

      const suggestions = await SearchService.getSearchSuggestions(query, {
        type,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: suggestions,
        query,
        type
      });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取自動完成結果
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getAutocomplete(req, res) {
    try {
      const {
        q: query,
        limit = 5
      } = req.query;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          data: {
            repositories: [],
            owners: [],
            languages: [],
            topics: []
          },
          query: query || ''
        });
      }

      const autocomplete = await SearchService.getAutocomplete(query, {
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: autocomplete
      });
    } catch (error) {
      console.error('Error getting autocomplete:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get autocomplete results',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 高級搜索
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async advancedSearch(req, res) {
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
        query,
        type = 'repositories',
        filters = {},
        page = 1,
        limit = 20,
        sort = 'relevance',
        order = 'desc'
      } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const criteria = {
        query,
        type,
        filters
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order
      };

      const result = await SearchService.advancedSearch(criteria, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        search_criteria: result.search_criteria,
        total_count: result.pagination.total
      });
    } catch (error) {
      console.error('Error performing advanced search:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform advanced search',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取熱門搜索關鍵字
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getPopularSearchTerms(req, res) {
    try {
      const {
        type = 'repositories',
        limit = 10
      } = req.query;

      const popularTerms = await SearchService.getPopularSearchTerms({
        type,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: popularTerms,
        type
      });
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popular search terms',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取搜索統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getSearchStats(req, res) {
    try {
      const { q: query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const stats = await SearchService.getSearchStats(query);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting search stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 搜索倉庫
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async searchRepositories(req, res) {
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
        q: query,
        page = 1,
        limit = 20,
        sort = 'relevance',
        order = 'desc',
        language,
        min_stars,
        max_stars,
        owner_type
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        language,
        min_stars: min_stars ? parseInt(min_stars) : undefined,
        max_stars: max_stars ? parseInt(max_stars) : undefined,
        owner_type
      };

      const result = await SearchService.searchRepositories(query, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        search_query: query,
        total_count: result.pagination.total
      });
    } catch (error) {
      console.error('Error searching repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search repositories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 搜索擁有者
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async searchOwners(req, res) {
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
        q: query,
        page = 1,
        limit = 20,
        sort = 'relevance',
        order = 'desc',
        type
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        type
      };

      const result = await SearchService.searchOwners(query, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        search_query: query,
        total_count: result.pagination.total
      });
    } catch (error) {
      console.error('Error searching owners:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search owners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取搜索歷史
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getSearchHistory(req, res) {
    try {
      const {
        limit = 20,
        type
      } = req.query;

      // 這裡需要實現搜索歷史功能
      // 暫時返回空數組
      const history = [];

      res.json({
        success: true,
        data: history,
        total: history.length
      });
    } catch (error) {
      console.error('Error getting search history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 清除搜索歷史
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async clearSearchHistory(req, res) {
    try {
      // 這裡需要實現清除搜索歷史功能
      // 暫時返回成功響應
      res.json({
        success: true,
        message: 'Search history cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing search history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear search history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SearchController;