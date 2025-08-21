const Topic = require('../models/Topic');
const { validationResult } = require('express-validator');

class TopicController {
  /**
   * 獲取主題列表
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopics(req, res) {
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
        page = 1,
        limit = 20,
        sort = 'repositories_count',
        order = 'desc',
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        search
      };

      const result = await Topic.getTopics(options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        ...(search && { search_query: search })
      });
    } catch (error) {
      console.error('Error getting topics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 根據ID獲取主題詳情
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopicById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic ID'
        });
      }

      const topic = await Topic.getTopicById(parseInt(id));

      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
      }

      res.json({
        success: true,
        data: topic
      });
    } catch (error) {
      console.error('Error getting topic by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topic',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 根據名稱獲取主題
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopicByName(req, res) {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Topic name is required'
        });
      }

      const topic = await Topic.getTopicByName(name);

      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
      }

      res.json({
        success: true,
        data: topic
      });
    } catch (error) {
      console.error('Error getting topic by name:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topic',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取熱門主題
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getPopularTopics(req, res) {
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
        limit = 50,
        min_repos = 10
      } = req.query;

      const options = {
        limit: parseInt(limit),
        min_repos: parseInt(min_repos)
      };

      const topics = await Topic.getPopularTopics(options);

      res.json({
        success: true,
        data: topics,
        criteria: {
          min_repositories: min_repos
        }
      });
    } catch (error) {
      console.error('Error getting popular topics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popular topics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 搜索主題
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async searchTopics(req, res) {
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
        sort = 'repositories_count',
        order = 'desc'
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
        order
      };

      const result = await Topic.searchTopics(query, options);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        search_query: query,
        total_count: result.pagination.total
      });
    } catch (error) {
      console.error('Error searching topics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search topics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取主題統計
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopicStats(req, res) {
    try {
      const stats = await Topic.getTopicStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting topic stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topic statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取主題建議
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopicSuggestions(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.trim().length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const suggestions = await Topic.getTopicSuggestions(query, parseInt(limit));

      res.json({
        success: true,
        data: suggestions,
        query
      });
    } catch (error) {
      console.error('Error getting topic suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topic suggestions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取主題的倉庫
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getTopicRepositories(req, res) {
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
          message: 'Invalid topic ID'
        });
      }

      // 首先檢查主題是否存在
      const topic = await Topic.getTopicById(parseInt(id));
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
      }

      // 獲取主題的倉庫（從主題詳情中已包含熱門倉庫）
      const repositories = topic.popular_repositories || [];

      // 簡單的分頁處理
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedRepos = repositories.slice(startIndex, endIndex);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: repositories.length,
        pages: Math.ceil(repositories.length / parseInt(limit))
      };

      res.json({
        success: true,
        data: paginatedRepos,
        pagination,
        topic: {
          id: topic.id,
          name: topic.name,
          description: topic.description
        }
      });
    } catch (error) {
      console.error('Error getting topic repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get topic repositories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 獲取相關主題
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async getRelatedTopics(req, res) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic ID'
        });
      }

      // 獲取當前主題
      const topic = await Topic.getTopicById(parseInt(id));
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
      }

      // 基於倉庫數量相似度查找相關主題
      const options = {
        limit: parseInt(limit),
        exclude_id: parseInt(id),
        sort: 'repositories_count',
        order: 'desc'
      };

      const relatedTopics = await Topic.getTopics(options);

      res.json({
        success: true,
        data: relatedTopics.data,
        based_on: {
          topic_name: topic.name,
          repositories_count: topic.repositories_count
        }
      });
    } catch (error) {
      console.error('Error getting related topics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get related topics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 創建主題
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async createTopic(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: errors.array()
        });
      }

      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Topic name is required'
        });
      }

      // 檢查主題是否已存在
      const existingTopic = await Topic.getTopicByName(name);
      if (existingTopic) {
        return res.status(409).json({
          success: false,
          message: 'Topic already exists'
        });
      }

      const topicData = {
        name: name.toLowerCase().trim(),
        description: description || null,
        repositories_count: 0
      };

      const topic = await Topic.createOrUpdateTopic(topicData);

      res.status(201).json({
        success: true,
        data: topic,
        message: 'Topic created successfully'
      });
    } catch (error) {
      console.error('Error creating topic:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create topic',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 更新主題倉庫計數
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async updateTopicRepositoryCount(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic ID'
        });
      }

      await Topic.updateTopicRepositoryCount(parseInt(id));

      res.json({
        success: true,
        message: 'Topic repository count updated successfully'
      });
    } catch (error) {
      console.error('Error updating topic repository count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update topic repository count',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * 更新所有主題倉庫計數
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  static async updateAllTopicRepositoryCounts(req, res) {
    try {
      await Topic.updateAllTopicRepositoryCounts();

      res.json({
        success: true,
        message: 'All topic repository counts updated successfully'
      });
    } catch (error) {
      console.error('Error updating all topic repository counts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update all topic repository counts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = TopicController;