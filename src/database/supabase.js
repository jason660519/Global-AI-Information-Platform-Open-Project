const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const createLogger = require('../utils/logger');
const { CrawlerError, ErrorType } = require('../utils/errors');

const logger = createLogger('supabase');

/**
 * Supabase客戶端類
 * 用於與Supabase進行交互
 */
class SupabaseClient {
  /**
   * 建構子
   */
  constructor() {
    if (!config.supabase.url || !config.supabase.key) {
      throw new CrawlerError(
        'Supabase URL和Key必須在環境變數中設置',
        ErrorType.DATABASE_ERROR
      );
    }
    
    this.client = createClient(config.supabase.url, config.supabase.key);
    this.tables = config.supabase.tables;
    this.storage = config.supabase.storage;
    
    logger.info('Supabase客戶端初始化完成');
  }

  /**
   * 獲取Supabase客戶端實例
   * @returns {Object} - Supabase客戶端
   */
  getClient() {
    return this.client;
  }

  /**
   * 插入數據到指定表
   * @param {string} table - 表名
   * @param {Object|Array} data - 要插入的數據
   * @param {Object} options - 選項
   * @returns {Promise<Object>} - 插入結果
   */
  async insert(table, data, options = {}) {
    try {
      const { upsert = false } = options;
      
      const query = this.client
        .from(table)
        .insert(data, { returning: 'minimal', ...options });
      
      if (upsert) {
        query.upsert();
      }
      
      const { error } = await query;
      
      if (error) {
        throw new CrawlerError(
          `插入數據到表 ${table} 失敗: ${error.message}`,
          ErrorType.DATABASE_ERROR,
          error
        );
      }
      
      const count = Array.isArray(data) ? data.length : 1;
      logger.info(`成功插入 ${count} 條數據到表 ${table}`);
      
      return { success: true, count };
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `插入數據到表 ${table} 時發生錯誤: ${error.message}`,
          ErrorType.DATABASE_ERROR,
          error
        );
      }
      
      logger.error(error.message, { stack: error.stack });
      throw error;
    }
  }

  /**
   * 上傳原始數據到Storage
   * @param {string} path - 存儲路徑
   * @param {string|Buffer} data - 要上傳的數據
   * @param {Object} options - 上傳選項
   * @returns {Promise<Object>} - 上傳結果
   */
  async uploadRawData(path, data, options = {}) {
    try {
      const { contentType = 'application/json' } = options;
      
      const { error } = await this.client
        .storage
        .from(this.storage.rawDataBucket)
        .upload(path, data, {
          contentType,
          upsert: true,
          ...options
        });
      
      if (error) {
        throw new CrawlerError(
          `上傳原始數據到 ${path} 失敗: ${error.message}`,
          ErrorType.DATABASE_ERROR,
          error
        );
      }
      
      logger.info(`成功上傳原始數據到 ${path}`);
      
      return {
        success: true,
        path,
        url: this.client.storage.from(this.storage.rawDataBucket).getPublicUrl(path).data.publicUrl
      };
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `上傳原始數據到 ${path} 時發生錯誤: ${error.message}`,
          ErrorType.DATABASE_ERROR,
          error
        );
      }
      
      logger.error(error.message, { stack: error.stack });
      throw error;
    }
  }

  /**
   * 記錄爬蟲日誌
   * @param {Object} logData - 日誌數據
   * @returns {Promise<Object>} - 插入結果
   */
  async logCrawlerActivity(logData) {
    const log = {
      crawler_name: logData.crawlerName,
      status: logData.status,
      message: logData.message,
      details: logData.details || {},
      created_at: new Date().toISOString()
    };
    
    return this.insert(this.tables.crawlerLogs, log);
  }

  /**
   * 檢查數據是否已存在
   * @param {string} table - 表名
   * @param {Object} conditions - 查詢條件
   * @returns {Promise<boolean>} - 是否存在
   */
  async exists(table, conditions) {
    try {
      let query = this.client.from(table).select('id', { count: 'exact' });
      
      // 添加所有條件
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { count, error } = await query;
      
      if (error) {
        throw new CrawlerError(
          `檢查表 ${table} 中數據是否存在時發生錯誤: ${error.message}`,
          ErrorType.DATABASE_ERROR,
          error
        );
      }
      
      return count > 0;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `檢查表 ${table} 中數據是否存在時發生錯誤: ${error.message}`,
          ErrorType.DATABASE_ERROR,
          error
        );
      }
      
      logger.error(error.message, { stack: error.stack });
      throw error;
    }
  }
}

// 創建單例實例
let instance = null;

/**
 * 獲取Supabase客戶端實例
 * @returns {SupabaseClient} - Supabase客戶端實例
 */
function getSupabaseClient() {
  if (!instance) {
    instance = new SupabaseClient();
  }
  return instance;
}

module.exports = {
  getSupabaseClient
};