const Owner = require('../models/Owner');
const SearchService = require('../services/SearchService');
const { validationResult } = require('express-validator');

class OwnerController {
  /**
   * 獲取擁有者列表
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwners(req, res) {
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
        sort = 'followers',
        order = 'desc',
        type,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        type
      };

      let result;
      if (search) {
        result = await SearchService.searchOwners(search, options);
      } else {
        result = await Owner.getOwners(options);
      }

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        ...(search && { search_query: search })
      });
    } catch (error) {
      console.error('Error getting owners:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 根據ID獲取擁有者詳情
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwnerById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid owner ID'
        });
      }

      const owner = await Owner.getOwnerById(parseInt(id));

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Owner not found'
        });
      }

      res.json({
        success: true,
        data: owner
      });
    } catch (error) {
      console.error('Error getting owner by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 根據登錄名獲取擁有者
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwnerByLogin(req, res) {
    try {
      const { login } = req.params;

      if (!login) {
        return res.status(400).json({
          success: false,
          message: 'Login is required'
        });
      }

      const owner = await Owner.getOwnerByLogin(login);

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Owner not found'
        });
      }

      res.json({
        success: true,
        data: owner
      });
    } catch (error) {
      console.error('Error getting owner by login:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取擁有者的倉庫
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwnerRepositories(req, res) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 20,
        sort = 'stars',
        order = 'desc',
        language
      } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid owner ID'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        language
      };

      const result = await Owner.getOwnerRepositories(parseInt(id), options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting owner repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner repositories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取頂級擁有者
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopOwners(req, res) {
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
        metric = 'followers',
        type,
        limit = 50
      } = req.query;

      const options = {
        metric,
        type,
        limit: parseInt(limit)
      };

      const owners = await Owner.getTopOwners(options);

      res.json({
        success: true,
        data: owners,
        metric,
        type: type || 'all'
      });
    } catch (error) {
      console.error('Error getting top owners:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top owners',
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
   * 獲取擁有者類型統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwnerTypeStats(req, res) {
    try {
      const stats = await Owner.getOwnerTypeStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting owner type stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner type statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取擁有者建議
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwnerSuggestions(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const suggestions = await SearchService.getSearchSuggestions(query, {
        type: 'owners',
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: suggestions,
        query
      });
    } catch (error) {
      console.error('Error getting owner suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取擁有者語言分佈
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getOwnerLanguageDistribution(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid owner ID'
        });
      }

      // 獲取擁有者詳情（包含語言分佈）
      const owner = await Owner.getOwnerById(parseInt(id));

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Owner not found'
        });
      }

      // 限制返回的語言數量
      const languages = owner.language_distribution
        ? owner.language_distribution.slice(0, parseInt(limit))
        : [];

      res.json({
        success: true,
        data: {
          owner_id: owner.id,
          owner_login: owner.login,
          languages
        }
      });
    } catch (error) {
      console.error('Error getting owner language distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner language distribution',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取相似擁有者
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getSimilarOwners(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid owner ID'
        });
      }

      // 獲取當前擁有者信息
      const owner = await Owner.getOwnerById(parseInt(id));
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Owner not found'
        });
      }

      // 基於類型查找相似擁有者
      const options = {
        limit: parseInt(limit),
        type: owner.type,
        exclude_id: parseInt(id)
      };

      const similarOwners = await Owner.getOwners(options);

      res.json({
        success: true,
        data: similarOwners.data,
        based_on: {
          type: owner.type,
          followers_range: {
            min: Math.max(0, owner.followers - 1000),
            max: owner.followers + 1000
          }
        }
      });
    } catch (error) {
      console.error('Error getting similar owners:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get similar owners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = OwnerController;