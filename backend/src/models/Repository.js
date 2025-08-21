const knex = require('../config/database');

class Repository {
  static get tableName() {
    return 'repositories';
  }

  /**
   * 獲取倉庫列表
   * @param {Object} options - 查詢選項
   * @param {number} options.page - 頁碼
   * @param {number} options.limit - 每頁數量
   * @param {string} options.sort - 排序字段
   * @param {string} options.order - 排序方向
   * @param {string} options.language - 語言篩選
   * @param {number} options.min_stars - 最小星數
   * @param {string} options.owner_type - 擁有者類型
   * @param {string} options.search - 搜索關鍵字
   * @returns {Promise<Object>} 倉庫列表和分頁信息
   */
  static async getRepositories(options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'stars_count',
      order = 'desc',
      language,
      min_stars,
      owner_type,
      search
    } = options;

    const offset = (page - 1) * limit;
    const validSortFields = ['stars_count', 'forks_count', 'updated_at', 'created_at', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'stars_count';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    let query = knex(this.tableName)
      .select(
        'repositories.*',
        'owners.login as owner_login',
        'owners.type as owner_type',
        'owners.avatar_url as owner_avatar_url'
      )
      .leftJoin('owners', 'repositories.owner_id', 'owners.id')
      .where('repositories.is_private', false)
      .where('repositories.is_archived', false);

    // 應用篩選條件
    if (language) {
      query = query.where('repositories.primary_language', language);
    }

    if (min_stars) {
      query = query.where('repositories.stars_count', '>=', min_stars);
    }

    if (owner_type) {
      query = query.where('owners.type', owner_type);
    }

    if (search) {
      query = query.where(function() {
        this.where('repositories.name', 'ilike', `%${search}%`)
          .orWhere('repositories.description', 'ilike', `%${search}%`)
          .orWhere('repositories.full_name', 'ilike', `%${search}%`);
      });
    }

    // 獲取總數
    const countQuery = query.clone().clearSelect().count('* as total');
    const [{ total }] = await countQuery;

    // 獲取數據
    const repositories = await query
      .orderBy(`repositories.${sortField}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data: repositories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根據 ID 獲取倉庫詳情
   * @param {number} id - 倉庫 ID
   * @returns {Promise<Object|null>} 倉庫詳情
   */
  static async getRepositoryById(id) {
    const repository = await knex(this.tableName)
      .select(
        'repositories.*',
        'owners.login as owner_login',
        'owners.type as owner_type',
        'owners.name as owner_name',
        'owners.avatar_url as owner_avatar_url',
        'owners.html_url as owner_html_url'
      )
      .leftJoin('owners', 'repositories.owner_id', 'owners.id')
      .where('repositories.id', id)
      .first();

    if (!repository) {
      return null;
    }

    // 獲取語言信息
    const languages = await knex('languages')
      .select('language', 'bytes', 'percentage')
      .where('repository_id', id)
      .orderBy('percentage', 'desc');

    // 獲取主題標籤
    const topics = await knex('topics')
      .select('topics.name', 'topics.description')
      .join('repository_topics', 'topics.id', 'repository_topics.topic_id')
      .where('repository_topics.repository_id', id)
      .orderBy('topics.name');

    return {
      ...repository,
      languages,
      topics
    };
  }

  /**
   * 獲取趨勢倉庫
   * @param {Object} options - 查詢選項
   * @param {string} options.period - 時間週期 (daily, weekly, monthly)
   * @param {string} options.language - 語言篩選
   * @param {number} options.limit - 數量限制
   * @returns {Promise<Array>} 趨勢倉庫列表
   */
  static async getTrendingRepositories(options = {}) {
    const { period = 'daily', language, limit = 25 } = options;

    // 根據時間週期計算日期範圍
    let dateThreshold;
    switch (period) {
      case 'weekly':
        dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // daily
        dateThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    let query = knex(this.tableName)
      .select(
        'repositories.*',
        'owners.login as owner_login',
        'owners.type as owner_type',
        'owners.avatar_url as owner_avatar_url'
      )
      .leftJoin('owners', 'repositories.owner_id', 'owners.id')
      .where('repositories.is_private', false)
      .where('repositories.is_archived', false)
      .where('repositories.updated_at', '>=', dateThreshold);

    if (language) {
      query = query.where('repositories.primary_language', language);
    }

    const repositories = await query
      .orderBy('repositories.stars_count', 'desc')
      .limit(limit);

    return repositories;
  }

  /**
   * 搜索倉庫
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 搜索選項
   * @returns {Promise<Object>} 搜索結果
   */
  static async searchRepositories(query, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'stars_count',
      order = 'desc',
      language,
      min_stars
    } = options;

    return this.getRepositories({
      ...options,
      search: query
    });
  }

  /**
   * 獲取語言統計
   * @returns {Promise<Array>} 語言統計數據
   */
  static async getLanguageStats() {
    const stats = await knex('repositories')
      .select('primary_language as language')
      .count('* as count')
      .sum('stars_count as total_stars')
      .where('primary_language', 'is not', null)
      .where('is_private', false)
      .where('is_archived', false)
      .groupBy('primary_language')
      .orderBy('count', 'desc')
      .limit(20);

    return stats;
  }

  /**
   * 獲取總體統計
   * @returns {Promise<Object>} 總體統計數據
   */
  static async getOverviewStats() {
    const [repositoryStats] = await knex('repositories')
      .count('* as total_repositories')
      .sum('stars_count as total_stars')
      .sum('forks_count as total_forks')
      .where('is_private', false)
      .where('is_archived', false);

    const [ownerStats] = await knex('owners')
      .count('* as total_owners')
      .sum('followers as total_followers');

    const [languageCount] = await knex('repositories')
      .countDistinct('primary_language as unique_languages')
      .where('primary_language', 'is not', null)
      .where('is_private', false)
      .where('is_archived', false);

    const [topicCount] = await knex('topics')
      .count('* as total_topics');

    return {
      total_repositories: parseInt(repositoryStats.total_repositories),
      total_stars: parseInt(repositoryStats.total_stars || 0),
      total_forks: parseInt(repositoryStats.total_forks || 0),
      total_owners: parseInt(ownerStats.total_owners),
      total_followers: parseInt(ownerStats.total_followers || 0),
      unique_languages: parseInt(languageCount.unique_languages),
      total_topics: parseInt(topicCount.total_topics)
    };
  }
}

module.exports = Repository;