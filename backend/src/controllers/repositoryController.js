const Repository = require('../models/Repository');
const SearchService = require('../services/SearchService');
const { validationResult } = require('express-validator');

class RepositoryController {
  /**
   * 獲取倉庫列表
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getRepositories(req, res) {
    try {
      // 驗證請求參數
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 20,
        sort = 'stars',
        order = 'desc',
        language,
        min_stars,
        max_stars,
        owner_type,
        search
      } = req.query;

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

      let result;
      if (search) {
        result = await SearchService.searchRepositories(search, options);
      } else {
        result = await Repository.getRepositories(options);
      }

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        ...(search && { search_query: search })
      });
    } catch (error) {
      console.error('Error getting repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get repositories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 根據ID獲取倉庫詳情
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getRepositoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID'
        });
      }

      const repository = await Repository.getRepositoryById(parseInt(id));

      if (!repository) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found'
        });
      }

      res.json({
        success: true,
        data: repository
      });
    } catch (error) {
      console.error('Error getting repository by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get repository',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取趨勢倉庫
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTrendingRepositories(req, res) {
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
        language,
        limit = 25
      } = req.query;

      const options = {
        period,
        language,
        limit: parseInt(limit)
      };

      const repositories = await Repository.getTrendingRepositories(options);

      res.json({
        success: true,
        data: repositories,
        period,
        language: language || 'all'
      });
    } catch (error) {
      console.error('Error getting trending repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending repositories',
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
   * 獲取語言統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getLanguageStats(req, res) {
    try {
      const {
        limit = 20,
        min_repos = 1
      } = req.query;

      const options = {
        limit: parseInt(limit),
        min_repos: parseInt(min_repos)
      };

      const stats = await Repository.getLanguageStats(options);

      res.json({
        success: true,
        data: stats
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
   * 獲取倉庫統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getRepositoryStats(req, res) {
    try {
      const stats = await Repository.getOverallStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting repository stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get repository statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取倉庫建議
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getRepositorySuggestions(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const suggestions = await SearchService.getSearchSuggestions(query, {
        type: 'repositories',
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: suggestions,
        query
      });
    } catch (error) {
      console.error('Error getting repository suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get repository suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取相關倉庫
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getRelatedRepositories(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid repository ID'
        });
      }

      // 獲取當前倉庫信息
      const repository = await Repository.getRepositoryById(parseInt(id));
      if (!repository) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found'
        });
      }

      // 基於語言和主題查找相關倉庫
      const options = {
        limit: parseInt(limit),
        language: repository.primary_language,
        exclude_id: parseInt(id)
      };

      const relatedRepos = await Repository.getRepositories(options);

      res.json({
        success: true,
        data: relatedRepos.data,
        based_on: {
          language: repository.primary_language,
          topics: repository.topics
        }
      });
    } catch (error) {
      console.error('Error getting related repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get related repositories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = RepositoryController;