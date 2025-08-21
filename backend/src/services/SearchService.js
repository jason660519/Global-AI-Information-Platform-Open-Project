const knex = require('../config/database');
const Repository = require('../models/Repository');
const Owner = require('../models/Owner');
const Topic = require('../models/Topic');

class SearchService {
  /**
   * 搜索倉庫
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 搜索選項
   * @returns {Promise<Object>} 搜索結果
   */
  static async searchRepositories(query, options = {}) {
    try {
      if (!query || query.trim().length === 0) {
        return Repository.getRepositories(options);
      }

      const searchQuery = query.trim();
      const result = await Repository.searchRepositories(searchQuery, options);

      // 添加搜索相關性評分
      const scoredResults = result.data.map(repo => {
        let score = 0;
        const lowerQuery = searchQuery.toLowerCase();
        const lowerName = (repo.name || '').toLowerCase();
        const lowerDescription = (repo.description || '').toLowerCase();
        const lowerFullName = (repo.full_name || '').toLowerCase();

        // 名稱完全匹配
        if (lowerName === lowerQuery) score += 100;
        // 名稱開頭匹配
        else if (lowerName.startsWith(lowerQuery)) score += 50;
        // 名稱包含
        else if (lowerName.includes(lowerQuery)) score += 25;

        // 全名匹配
        if (lowerFullName.includes(lowerQuery)) score += 20;

        // 描述匹配
        if (lowerDescription.includes(lowerQuery)) score += 10;

        // 星數加權
        score += Math.log10(repo.stars_count + 1) * 2;

        return {
          ...repo,
          search_score: score
        };
      });

      // 按相關性排序
      scoredResults.sort((a, b) => b.search_score - a.search_score);

      return {
        ...result,
        data: scoredResults,
        search_query: searchQuery
      };
    } catch (error) {
      throw new Error(`Failed to search repositories: ${error.message}`);
    }
  }

  /**
   * 搜索擁有者
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 搜索選項
   * @returns {Promise<Object>} 搜索結果
   */
  static async searchOwners(query, options = {}) {
    try {
      if (!query || query.trim().length === 0) {
        return Owner.getOwners(options);
      }

      const searchQuery = query.trim();
      const result = await Owner.searchOwners(searchQuery, options);

      // 添加搜索相關性評分
      const scoredResults = result.data.map(owner => {
        let score = 0;
        const lowerQuery = searchQuery.toLowerCase();
        const lowerLogin = (owner.login || '').toLowerCase();
        const lowerName = (owner.name || '').toLowerCase();
        const lowerBio = (owner.bio || '').toLowerCase();

        // 登錄名完全匹配
        if (lowerLogin === lowerQuery) score += 100;
        // 登錄名開頭匹配
        else if (lowerLogin.startsWith(lowerQuery)) score += 50;
        // 登錄名包含
        else if (lowerLogin.includes(lowerQuery)) score += 25;

        // 名稱匹配
        if (lowerName.includes(lowerQuery)) score += 30;

        // 簡介匹配
        if (lowerBio.includes(lowerQuery)) score += 10;

        // 關注者數加權
        score += Math.log10(owner.followers + 1) * 2;

        // 倉庫數加權
        score += Math.log10(owner.public_repos + 1);

        return {
          ...owner,
          search_score: score
        };
      });

      // 按相關性排序
      scoredResults.sort((a, b) => b.search_score - a.search_score);

      return {
        ...result,
        data: scoredResults,
        search_query: searchQuery
      };
    } catch (error) {
      throw new Error(`Failed to search owners: ${error.message}`);
    }
  }

  /**
   * 獲取搜索建議
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 選項
   * @param {string} options.type - 建議類型 (repositories, owners, languages, topics)
   * @param {number} options.limit - 數量限制
   * @returns {Promise<Array>} 搜索建議
   */
  static async getSearchSuggestions(query, options = {}) {
    const { type = 'repositories', limit = 10 } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const searchQuery = query.trim();
      let suggestions = [];

      switch (type) {
        case 'repositories':
          suggestions = await knex('repositories')
            .select('name', 'full_name', 'stars_count')
            .where('name', 'ilike', `%${searchQuery}%`)
            .orWhere('full_name', 'ilike', `%${searchQuery}%`)
            .where('is_private', false)
            .where('is_archived', false)
            .orderBy('stars_count', 'desc')
            .limit(limit);
          break;

        case 'owners':
          suggestions = await knex('owners')
            .select('login', 'name', 'type', 'followers')
            .where('login', 'ilike', `%${searchQuery}%`)
            .orWhere('name', 'ilike', `%${searchQuery}%`)
            .orderBy('followers', 'desc')
            .limit(limit);
          break;

        case 'languages':
          suggestions = await knex('repositories')
            .select('primary_language as name')
            .count('* as repository_count')
            .where('primary_language', 'ilike', `%${searchQuery}%`)
            .whereNotNull('primary_language')
            .where('is_private', false)
            .where('is_archived', false)
            .groupBy('primary_language')
            .orderBy('repository_count', 'desc')
            .limit(limit);
          break;

        case 'topics':
          suggestions = await Topic.getTopicSuggestions(searchQuery, limit);
          break;

        default:
          throw new Error(`Invalid suggestion type: ${type}`);
      }

      return suggestions.map(item => ({
        ...item,
        type
      }));
    } catch (error) {
      throw new Error(`Failed to get search suggestions: ${error.message}`);
    }
  }

  /**
   * 自動完成搜索
   * @param {string} query - 搜索關鍵字
   * @param {Object} options - 選項
   * @param {number} options.limit - 每種類型的數量限制
   * @returns {Promise<Object>} 自動完成結果
   */
  static async getAutocomplete(query, options = {}) {
    const { limit = 5 } = options;

    if (!query || query.trim().length < 2) {
      return {
        repositories: [],
        owners: [],
        languages: [],
        topics: []
      };
    }

    try {
      const [repositories, owners, languages, topics] = await Promise.all([
        this.getSearchSuggestions(query, { type: 'repositories', limit }),
        this.getSearchSuggestions(query, { type: 'owners', limit }),
        this.getSearchSuggestions(query, { type: 'languages', limit }),
        this.getSearchSuggestions(query, { type: 'topics', limit })
      ]);

      return {
        query: query.trim(),
        repositories,
        owners,
        languages,
        topics
      };
    } catch (error) {
      throw new Error(`Failed to get autocomplete results: ${error.message}`);
    }
  }

  /**
   * 高級搜索
   * @param {Object} criteria - 搜索條件
   * @param {string} criteria.query - 關鍵字
   * @param {string} criteria.type - 搜索類型 (repositories, owners)
   * @param {Object} criteria.filters - 篩選條件
   * @param {Object} options - 選項
   * @returns {Promise<Object>} 搜索結果
   */
  static async advancedSearch(criteria, options = {}) {
    const { query, type = 'repositories', filters = {} } = criteria;

    try {
      let result;

      switch (type) {
        case 'repositories':
          result = await this.searchRepositories(query, {
            ...options,
            ...filters
          });
          break;

        case 'owners':
          result = await this.searchOwners(query, {
            ...options,
            ...filters
          });
          break;

        default:
          throw new Error(`Invalid search type: ${type}`);
      }

      return {
        ...result,
        search_criteria: criteria
      };
    } catch (error) {
      throw new Error(`Failed to perform advanced search: ${error.message}`);
    }
  }

  /**
   * 獲取熱門搜索關鍵字
   * @param {Object} options - 選項
   * @param {string} options.type - 類型 (repositories, owners, languages, topics)
   * @param {number} options.limit - 數量限制
   * @returns {Promise<Array>} 熱門搜索關鍵字
   */
  static async getPopularSearchTerms(options = {}) {
    const { type = 'repositories', limit = 10 } = options;

    try {
      let popularTerms = [];

      switch (type) {
        case 'repositories':
          // 基於星數獲取熱門倉庫名稱
          popularTerms = await knex('repositories')
            .select('name as term', 'stars_count as popularity')
            .where('is_private', false)
            .where('is_archived', false)
            .orderBy('stars_count', 'desc')
            .limit(limit);
          break;

        case 'owners':
          // 基於關注者數獲取熱門擁有者
          popularTerms = await knex('owners')
            .select('login as term', 'followers as popularity')
            .orderBy('followers', 'desc')
            .limit(limit);
          break;

        case 'languages':
          // 基於倉庫數量獲取熱門語言
          popularTerms = await knex('repositories')
            .select('primary_language as term')
            .count('* as popularity')
            .where('primary_language', 'is not', null)
            .where('is_private', false)
            .where('is_archived', false)
            .groupBy('primary_language')
            .orderBy('popularity', 'desc')
            .limit(limit);
          break;

        case 'topics':
          // 基於倉庫數量獲取熱門主題
          popularTerms = await knex('topics')
            .select('name as term', 'repositories_count as popularity')
            .orderBy('repositories_count', 'desc')
            .limit(limit);
          break;

        default:
          throw new Error(`Invalid type: ${type}`);
      }

      return popularTerms.map(term => ({
        ...term,
        type,
        popularity: parseInt(term.popularity)
      }));
    } catch (error) {
      throw new Error(`Failed to get popular search terms: ${error.message}`);
    }
  }

  /**
   * 搜索統計
   * @param {string} query - 搜索關鍵字
   * @returns {Promise<Object>} 搜索統計
   */
  static async getSearchStats(query) {
    if (!query || query.trim().length === 0) {
      return {
        repositories: 0,
        owners: 0,
        languages: 0,
        topics: 0
      };
    }

    try {
      const searchQuery = query.trim();

      const [repositoryCount] = await knex('repositories')
        .count('* as count')
        .where(function() {
          this.where('name', 'ilike', `%${searchQuery}%`)
            .orWhere('description', 'ilike', `%${searchQuery}%`)
            .orWhere('full_name', 'ilike', `%${searchQuery}%`);
        })
        .where('is_private', false)
        .where('is_archived', false);

      const [ownerCount] = await knex('owners')
        .count('* as count')
        .where(function() {
          this.where('login', 'ilike', `%${searchQuery}%`)
            .orWhere('name', 'ilike', `%${searchQuery}%`)
            .orWhere('bio', 'ilike', `%${searchQuery}%`);
        });

      const [languageCount] = await knex('repositories')
        .countDistinct('primary_language as count')
        .where('primary_language', 'ilike', `%${searchQuery}%`)
        .where('is_private', false)
        .where('is_archived', false);

      const [topicCount] = await knex('topics')
        .count('* as count')
        .where(function() {
          this.where('name', 'ilike', `%${searchQuery}%`)
            .orWhere('description', 'ilike', `%${searchQuery}%`);
        });

      return {
        query: searchQuery,
        repositories: parseInt(repositoryCount.count),
        owners: parseInt(ownerCount.count),
        languages: parseInt(languageCount.count),
        topics: parseInt(topicCount.count)
      };
    } catch (error) {
      throw new Error(`Failed to get search stats: ${error.message}`);
    }
  }
}

module.exports = SearchService;