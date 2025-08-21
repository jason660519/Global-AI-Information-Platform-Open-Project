const knex = require('../config/database');

class Owner {
  static get tableName() {
    return 'owners';
  }

  /**
   * 獲取擁有者列表
   * @param {Object} options - 查詢選項
   * @param {number} options.page - 頁碼
   * @param {number} options.limit - 每頁數量
   * @param {string} options.sort - 排序字段
   * @param {string} options.order - 排序方向
   * @param {string} options.type - 擁有者類型
   * @param {string} options.search - 搜索關鍵字
   * @returns {Promise<Object>} 擁有者列表和分頁信息
   */
  static async getOwners(options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'followers',
      order = 'desc',
      type,
      search
    } = options;

    const offset = (page - 1) * limit;
    const validSortFields = ['followers', 'public_repos', 'created_at', 'login'];
    const sortField = validSortFields.includes(sort) ? sort : 'followers';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    let query = knex(this.tableName)
      .select('*');

    // 應用篩選條件
    if (type) {
      query = query.where('type', type);
    }

    if (search) {
      query = query.where(function() {
        this.where('login', 'ilike', `%${search}%`)
          .orWhere('name', 'ilike', `%${search}%`)
          .orWhere('bio', 'ilike', `%${search}%`);
      });
    }

    // 獲取總數
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // 獲取數據
    const owners = await query
      .orderBy(sortField, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data: owners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根據 ID 獲取擁有者詳情
   * @param {number} id - 擁有者 ID
   * @returns {Promise<Object|null>} 擁有者詳情
   */
  static async getOwnerById(id) {
    const owner = await knex(this.tableName)
      .where('id', id)
      .first();

    if (!owner) {
      return null;
    }

    // 獲取擁有者的倉庫統計
    const [repoStats] = await knex('repositories')
      .count('* as total_repositories')
      .sum('stars_count as total_stars')
      .sum('forks_count as total_forks')
      .where('owner_id', id)
      .where('is_private', false)
      .where('is_archived', false);

    // 獲取語言分佈
    const languageStats = await knex('repositories')
      .select('primary_language as language')
      .count('* as count')
      .sum('stars_count as stars')
      .where('owner_id', id)
      .where('primary_language', 'is not', null)
      .where('is_private', false)
      .where('is_archived', false)
      .groupBy('primary_language')
      .orderBy('count', 'desc')
      .limit(10);

    return {
      ...owner,
      repository_stats: {
        total_repositories: parseInt(repoStats.total_repositories),
        total_stars: parseInt(repoStats.total_stars || 0),
        total_forks: parseInt(repoStats.total_forks || 0)
      },
      language_stats: languageStats
    };
  }

  /**
   * 獲取擁有者的倉庫列表
   * @param {number} ownerId - 擁有者 ID
   * @param {Object} options - 查詢選項
   * @returns {Promise<Object>} 倉庫列表和分頁信息
   */
  static async getOwnerRepositories(ownerId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'stars_count',
      order = 'desc'
    } = options;

    const offset = (page - 1) * limit;
    const validSortFields = ['stars_count', 'forks_count', 'updated_at', 'created_at', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'stars_count';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    let query = knex('repositories')
      .select('*')
      .where('owner_id', ownerId)
      .where('is_private', false)
      .where('is_archived', false);

    // 獲取總數
    const countQuery = query.clone().count('* as total');
    const [{ total }] = await countQuery;

    // 獲取數據
    const repositories = await query
      .orderBy(sortField, sortOrder)
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
   * 獲取頂級擁有者
   * @param {Object} options - 查詢選項
   * @param {string} options.sort_by - 排序依據 (followers, repositories, stars)
   * @param {string} options.type - 擁有者類型
   * @param {number} options.limit - 數量限制
   * @returns {Promise<Array>} 頂級擁有者列表
   */
  static async getTopOwners(options = {}) {
    const {
      sort_by = 'followers',
      type,
      limit = 50
    } = options;

    let query = knex(this.tableName)
      .select(
        'owners.*',
        knex.raw('COUNT(repositories.id) as repository_count'),
        knex.raw('COALESCE(SUM(repositories.stars_count), 0) as total_stars')
      )
      .leftJoin('repositories', function() {
        this.on('owners.id', '=', 'repositories.owner_id')
          .andOn('repositories.is_private', '=', knex.raw('false'))
          .andOn('repositories.is_archived', '=', knex.raw('false'));
      })
      .groupBy('owners.id');

    if (type) {
      query = query.where('owners.type', type);
    }

    // 根據排序依據選擇排序字段
    let sortField;
    switch (sort_by) {
      case 'repositories':
        sortField = 'repository_count';
        break;
      case 'stars':
        sortField = 'total_stars';
        break;
      default:
        sortField = 'owners.followers';
    }

    const owners = await query
      .orderBy(sortField, 'desc')
      .limit(limit);

    return owners;
  }

  /**
   * 搜索擁有者
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 搜索選項
   * @returns {Promise<Object>} 搜索結果
   */
  static async searchOwners(query, options = {}) {
    return this.getOwners({
      ...options,
      search: query
    });
  }

  /**
   * 獲取擁有者類型統計
   * @returns {Promise<Array>} 類型統計數據
   */
  static async getTypeStats() {
    const stats = await knex(this.tableName)
      .select('type')
      .count('* as count')
      .sum('followers as total_followers')
      .sum('public_repos as total_repositories')
      .groupBy('type')
      .orderBy('count', 'desc');

    return stats;
  }

  /**
   * 根據 login 獲取擁有者
   * @param {string} login - 擁有者登錄名
   * @returns {Promise<Object|null>} 擁有者信息
   */
  static async getOwnerByLogin(login) {
    const owner = await knex(this.tableName)
      .where('login', login)
      .first();

    return owner;
  }

  /**
   * 創建或更新擁有者
   * @param {Object} ownerData - 擁有者數據
   * @returns {Promise<Object>} 創建或更新的擁有者
   */
  static async upsertOwner(ownerData) {
    const existingOwner = await this.getOwnerByLogin(ownerData.login);

    if (existingOwner) {
      // 更新現有擁有者
      await knex(this.tableName)
        .where('id', existingOwner.id)
        .update({
          ...ownerData,
          updated_at: knex.fn.now()
        });
      
      return { ...existingOwner, ...ownerData };
    } else {
      // 創建新擁有者
      const [newOwner] = await knex(this.tableName)
        .insert({
          ...ownerData,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        })
        .returning('*');
      
      return newOwner;
    }
  }
}

module.exports = Owner;