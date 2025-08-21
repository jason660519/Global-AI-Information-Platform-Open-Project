const knex = require('../config/database');
const Repository = require('../models/Repository');
const Owner = require('../models/Owner');
const Topic = require('../models/Topic');

class StatsService {
  /**
   * 獲取總體統計數據
   * @returns {Promise<Object>} 總體統計
   */
  static async getOverviewStats() {
    try {
      const repositoryStats = await Repository.getOverviewStats();
      const ownerTypeStats = await Owner.getTypeStats();
      const topicStats = await Topic.getTopicStats();

      // 獲取最近更新的倉庫數量
      const [recentUpdates] = await knex('repositories')
        .count('* as recent_updates')
        .where('updated_at', '>=', knex.raw("NOW() - INTERVAL '7 days'"))
        .where('is_private', false)
        .where('is_archived', false);

      return {
        ...repositoryStats,
        owner_type_distribution: ownerTypeStats,
        topic_stats: topicStats,
        recent_updates: parseInt(recentUpdates.recent_updates),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get overview stats: ${error.message}`);
    }
  }

  /**
   * 獲取語言統計數據
   * @param {Object} options - 查詢選項
   * @param {number} options.limit - 數量限制
   * @param {boolean} options.include_bytes - 是否包含字節數統計
   * @returns {Promise<Array>} 語言統計
   */
  static async getLanguageStats(options = {}) {
    const { limit = 20, include_bytes = false } = options;

    try {
      // 基於倉庫數量的語言統計
      const repositoryLanguageStats = await Repository.getLanguageStats();

      if (!include_bytes) {
        return repositoryLanguageStats.slice(0, limit);
      }

      // 包含字節數的詳細語言統計
      const detailedStats = await knex('languages')
        .select('language')
        .count('* as repository_count')
        .sum('bytes as total_bytes')
        .avg('percentage as avg_percentage')
        .join('repositories', 'languages.repository_id', 'repositories.id')
        .where('repositories.is_private', false)
        .where('repositories.is_archived', false)
        .groupBy('language')
        .orderBy('repository_count', 'desc')
        .limit(limit);

      return detailedStats.map(stat => ({
        ...stat,
        repository_count: parseInt(stat.repository_count),
        total_bytes: parseInt(stat.total_bytes || 0),
        avg_percentage: parseFloat(stat.avg_percentage || 0)
      }));
    } catch (error) {
      throw new Error(`Failed to get language stats: ${error.message}`);
    }
  }

  /**
   * 獲取趨勢統計數據
   * @param {Object} options - 查詢選項
   * @param {string} options.period - 時間週期 (daily, weekly, monthly)
   * @param {string} options.metric - 指標 (stars, forks, repositories)
   * @param {string} options.language - 語言篩選
   * @returns {Promise<Object>} 趨勢統計
   */
  static async getTrendStats(options = {}) {
    const { period = 'daily', metric = 'stars', language } = options;

    try {
      let dateFormat, dateInterval;
      switch (period) {
        case 'weekly':
          dateFormat = 'YYYY-"W"WW';
          dateInterval = '7 days';
          break;
        case 'monthly':
          dateFormat = 'YYYY-MM';
          dateInterval = '30 days';
          break;
        default: // daily
          dateFormat = 'YYYY-MM-DD';
          dateInterval = '1 day';
      }

      let query = knex('repositories')
        .select(
          knex.raw(`TO_CHAR(created_at, '${dateFormat}') as period`),
          knex.raw('COUNT(*) as new_repositories')
        )
        .where('created_at', '>=', knex.raw(`NOW() - INTERVAL '30 ${dateInterval}'`))
        .where('is_private', false)
        .where('is_archived', false)
        .groupBy(knex.raw(`TO_CHAR(created_at, '${dateFormat}')`))
        .orderBy('period');

      if (language) {
        query = query.where('primary_language', language);
      }

      const trendData = await query;

      // 根據指標類型獲取額外數據
      if (metric === 'stars' || metric === 'forks') {
        const metricField = metric === 'stars' ? 'stars_count' : 'forks_count';
        
        let metricQuery = knex('repositories')
          .select(
            knex.raw(`TO_CHAR(created_at, '${dateFormat}') as period`),
            knex.raw(`SUM(${metricField}) as total_${metric}`),
            knex.raw(`AVG(${metricField}) as avg_${metric}`)
          )
          .where('created_at', '>=', knex.raw(`NOW() - INTERVAL '30 ${dateInterval}'`))
          .where('is_private', false)
          .where('is_archived', false)
          .groupBy(knex.raw(`TO_CHAR(created_at, '${dateFormat}')`))
          .orderBy('period');

        if (language) {
          metricQuery = metricQuery.where('primary_language', language);
        }

        const metricData = await metricQuery;
        
        // 合併數據
        const combinedData = trendData.map(trend => {
          const metricInfo = metricData.find(m => m.period === trend.period) || {};
          return {
            ...trend,
            [`total_${metric}`]: parseInt(metricInfo[`total_${metric}`] || 0),
            [`avg_${metric}`]: parseFloat(metricInfo[`avg_${metric}`] || 0)
          };
        });

        return {
          period,
          metric,
          language,
          data: combinedData
        };
      }

      return {
        period,
        metric,
        language,
        data: trendData
      };
    } catch (error) {
      throw new Error(`Failed to get trend stats: ${error.message}`);
    }
  }

  /**
   * 獲取分佈統計數據
   * @param {Object} options - 查詢選項
   * @param {string} options.type - 分佈類型 (stars, forks, size)
   * @param {string} options.language - 語言篩選
   * @returns {Promise<Array>} 分佈統計
   */
  static async getDistributionStats(options = {}) {
    const { type = 'stars', language } = options;

    try {
      const fieldMap = {
        stars: 'stars_count',
        forks: 'forks_count',
        size: 'size'
      };

      const field = fieldMap[type] || 'stars_count';

      // 定義分佈區間
      let ranges;
      switch (type) {
        case 'forks':
          ranges = [
            { min: 0, max: 10, label: '0-10' },
            { min: 11, max: 50, label: '11-50' },
            { min: 51, max: 100, label: '51-100' },
            { min: 101, max: 500, label: '101-500' },
            { min: 501, max: 1000, label: '501-1K' },
            { min: 1001, max: null, label: '1K+' }
          ];
          break;
        case 'size':
          ranges = [
            { min: 0, max: 1000, label: '0-1MB' },
            { min: 1001, max: 10000, label: '1-10MB' },
            { min: 10001, max: 100000, label: '10-100MB' },
            { min: 100001, max: 1000000, label: '100MB-1GB' },
            { min: 1000001, max: null, label: '1GB+' }
          ];
          break;
        default: // stars
          ranges = [
            { min: 0, max: 10, label: '0-10' },
            { min: 11, max: 100, label: '11-100' },
            { min: 101, max: 1000, label: '101-1K' },
            { min: 1001, max: 10000, label: '1K-10K' },
            { min: 10001, max: 100000, label: '10K-100K' },
            { min: 100001, max: null, label: '100K+' }
          ];
      }

      const distribution = [];

      for (const range of ranges) {
        let query = knex('repositories')
          .count('* as count')
          .where('is_private', false)
          .where('is_archived', false)
          .where(field, '>=', range.min);

        if (range.max !== null) {
          query = query.where(field, '<=', range.max);
        }

        if (language) {
          query = query.where('primary_language', language);
        }

        const [result] = await query;
        
        distribution.push({
          range: range.label,
          min: range.min,
          max: range.max,
          count: parseInt(result.count)
        });
      }

      return {
        type,
        language,
        distribution
      };
    } catch (error) {
      throw new Error(`Failed to get distribution stats: ${error.message}`);
    }
  }

  /**
   * 獲取活躍度統計
   * @param {Object} options - 查詢選項
   * @param {string} options.period - 時間週期 (daily, weekly, monthly)
   * @returns {Promise<Object>} 活躍度統計
   */
  static async getActivityStats(options = {}) {
    const { period = 'daily' } = options;

    try {
      let dateFormat, dateInterval;
      switch (period) {
        case 'weekly':
          dateFormat = 'YYYY-"W"WW';
          dateInterval = '12 weeks';
          break;
        case 'monthly':
          dateFormat = 'YYYY-MM';
          dateInterval = '12 months';
          break;
        default: // daily
          dateFormat = 'YYYY-MM-DD';
          dateInterval = '30 days';
      }

      // 獲取推送活動統計
      const pushActivity = await knex('repositories')
        .select(
          knex.raw(`TO_CHAR(pushed_at, '${dateFormat}') as period`),
          knex.raw('COUNT(*) as active_repositories')
        )
        .where('pushed_at', '>=', knex.raw(`NOW() - INTERVAL '${dateInterval}'`))
        .where('is_private', false)
        .where('is_archived', false)
        .whereNotNull('pushed_at')
        .groupBy(knex.raw(`TO_CHAR(pushed_at, '${dateFormat}')`))
        .orderBy('period');

      // 獲取創建活動統計
      const creationActivity = await knex('repositories')
        .select(
          knex.raw(`TO_CHAR(created_at, '${dateFormat}') as period`),
          knex.raw('COUNT(*) as new_repositories')
        )
        .where('created_at', '>=', knex.raw(`NOW() - INTERVAL '${dateInterval}'`))
        .where('is_private', false)
        .where('is_archived', false)
        .groupBy(knex.raw(`TO_CHAR(created_at, '${dateFormat}')`))
        .orderBy('period');

      return {
        period,
        push_activity: pushActivity,
        creation_activity: creationActivity
      };
    } catch (error) {
      throw new Error(`Failed to get activity stats: ${error.message}`);
    }
  }

  /**
   * 獲取比較統計（語言、擁有者類型等的對比）
   * @param {Object} options - 查詢選項
   * @param {string} options.compare_by - 比較維度 (language, owner_type)
   * @param {Array} options.items - 要比較的項目
   * @returns {Promise<Object>} 比較統計
   */
  static async getComparisonStats(options = {}) {
    const { compare_by = 'language', items = [] } = options;

    if (items.length === 0) {
      throw new Error('No items provided for comparison');
    }

    try {
      const comparison = [];

      for (const item of items) {
        let query = knex('repositories')
          .count('* as repository_count')
          .sum('stars_count as total_stars')
          .sum('forks_count as total_forks')
          .avg('stars_count as avg_stars')
          .where('is_private', false)
          .where('is_archived', false);

        if (compare_by === 'language') {
          query = query.where('primary_language', item);
        } else if (compare_by === 'owner_type') {
          query = query
            .join('owners', 'repositories.owner_id', 'owners.id')
            .where('owners.type', item);
        }

        const [result] = await query;
        
        comparison.push({
          item,
          repository_count: parseInt(result.repository_count),
          total_stars: parseInt(result.total_stars || 0),
          total_forks: parseInt(result.total_forks || 0),
          avg_stars: parseFloat(result.avg_stars || 0)
        });
      }

      return {
        compare_by,
        items,
        comparison
      };
    } catch (error) {
      throw new Error(`Failed to get comparison stats: ${error.message}`);
    }
  }
}

module.exports = StatsService;