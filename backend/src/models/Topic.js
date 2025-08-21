const knex = require('../config/database');

class Topic {
  static get tableName() {
    return 'topics';
  }

  /**
   * 獲取主題列表
   * @param {Object} options - 查詢選項
   * @param {number} options.page - 頁碼
   * @param {number} options.limit - 每頁數量
   * @param {string} options.sort - 排序字段
   * @param {string} options.order - 排序方向
   * @param {string} options.search - 搜索關鍵字
   * @returns {Promise<Object>} 主題列表和分頁信息
   */
  static async getTopics(options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'repositories_count',
      order = 'desc',
      search
    } = options;

    const offset = (page - 1) * limit;
    const validSortFields = ['repositories_count', 'name', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'repositories_count';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    let query = knex(this.tableName)
      .select('*');

    // 應用搜索條件
    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    // 獲取總數
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // 獲取數據
    const topics = await query
      .orderBy(sortField, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data: topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根據 ID 獲取主題詳情
   * @param {number} id - 主題 ID
   * @returns {Promise<Object|null>} 主題詳情
   */
  static async getTopicById(id) {
    const topic = await knex(this.tableName)
      .where('id', id)
      .first();

    if (!topic) {
      return null;
    }

    // 獲取使用該主題的倉庫統計
    const [repoStats] = await knex('repository_topics')
      .join('repositories', 'repository_topics.repository_id', 'repositories.id')
      .count('* as total_repositories')
      .sum('repositories.stars_count as total_stars')
      .sum('repositories.forks_count as total_forks')
      .where('repository_topics.topic_id', id)
      .where('repositories.is_private', false)
      .where('repositories.is_archived', false);

    // 獲取該主題下的熱門倉庫
    const popularRepositories = await knex('repositories')
      .select(
        'repositories.id',
        'repositories.name',
        'repositories.full_name',
        'repositories.description',
        'repositories.stars_count',
        'repositories.forks_count',
        'repositories.primary_language',
        'owners.login as owner_login',
        'owners.avatar_url as owner_avatar_url'
      )
      .join('repository_topics', 'repositories.id', 'repository_topics.repository_id')
      .join('owners', 'repositories.owner_id', 'owners.id')
      .where('repository_topics.topic_id', id)
      .where('repositories.is_private', false)
      .where('repositories.is_archived', false)
      .orderBy('repositories.stars_count', 'desc')
      .limit(10);

    return {
      ...topic,
      repository_stats: {
        total_repositories: parseInt(repoStats.total_repositories),
        total_stars: parseInt(repoStats.total_stars || 0),
        total_forks: parseInt(repoStats.total_forks || 0)
      },
      popular_repositories: popularRepositories
    };
  }

  /**
   * 根據名稱獲取主題
   * @param {string} name - 主題名稱
   * @returns {Promise<Object|null>} 主題信息
   */
  static async getTopicByName(name) {
    const topic = await knex(this.tableName)
      .where('name', name)
      .first();

    return topic;
  }

  /**
   * 獲取熱門主題
   * @param {number} limit - 數量限制
   * @returns {Promise<Array>} 熱門主題列表
   */
  static async getPopularTopics(limit = 20) {
    const topics = await knex(this.tableName)
      .select('*')
      .orderBy('repositories_count', 'desc')
      .limit(limit);

    return topics;
  }

  /**
   * 獲取主題統計
   * @returns {Promise<Object>} 主題統計數據
   */
  static async getTopicStats() {
    const [totalStats] = await knex(this.tableName)
      .count('* as total_topics')
      .sum('repositories_count as total_topic_usages');

    const topTopics = await knex(this.tableName)
      .select('name', 'repositories_count')
      .orderBy('repositories_count', 'desc')
      .limit(10);

    const [avgUsage] = await knex(this.tableName)
      .avg('repositories_count as avg_repositories_per_topic');

    return {
      total_topics: parseInt(totalStats.total_topics),
      total_topic_usages: parseInt(totalStats.total_topic_usages || 0),
      avg_repositories_per_topic: parseFloat(avgUsage.avg_repositories_per_topic || 0),
      top_topics: topTopics
    };
  }

  /**
   * 搜索主題
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 搜索選項
   * @returns {Promise<Object>} 搜索結果
   */
  static async searchTopics(query, options = {}) {
    return this.getTopics({
      ...options,
      search: query
    });
  }

  /**
   * 獲取主題建議（自動完成）
   * @param {string} query - 搜索關鍵字
   * @param {number} limit - 數量限制
   * @returns {Promise<Array>} 主題建議列表
   */
  static async getTopicSuggestions(query, limit = 10) {
    const suggestions = await knex(this.tableName)
      .select('name', 'repositories_count')
      .where('name', 'ilike', `%${query}%`)
      .orderBy('repositories_count', 'desc')
      .limit(limit);

    return suggestions;
  }

  /**
   * 創建或更新主題
   * @param {Object} topicData - 主題數據
   * @returns {Promise<Object>} 創建或更新的主題
   */
  static async upsertTopic(topicData) {
    const existingTopic = await this.getTopicByName(topicData.name);

    if (existingTopic) {
      // 更新現有主題
      await knex(this.tableName)
        .where('id', existingTopic.id)
        .update({
          ...topicData,
          updated_at: knex.fn.now()
        });
      
      return { ...existingTopic, ...topicData };
    } else {
      // 創建新主題
      const [newTopic] = await knex(this.tableName)
        .insert({
          ...topicData,
          repositories_count: 0,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        })
        .returning('*');
      
      return newTopic;
    }
  }

  /**
   * 更新主題的倉庫計數
   * @param {number} topicId - 主題 ID
   * @returns {Promise<void>}
   */
  static async updateRepositoryCount(topicId) {
    const [{ count }] = await knex('repository_topics')
      .join('repositories', 'repository_topics.repository_id', 'repositories.id')
      .count('* as count')
      .where('repository_topics.topic_id', topicId)
      .where('repositories.is_private', false)
      .where('repositories.is_archived', false);

    await knex(this.tableName)
      .where('id', topicId)
      .update({
        repositories_count: parseInt(count),
        updated_at: knex.fn.now()
      });
  }

  /**
   * 批量更新所有主題的倉庫計數
   * @returns {Promise<void>}
   */
  static async updateAllRepositoryCounts() {
    const topics = await knex(this.tableName).select('id');
    
    for (const topic of topics) {
      await this.updateRepositoryCount(topic.id);
    }
  }
}

module.exports = Topic;