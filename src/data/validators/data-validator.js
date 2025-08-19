const schemas = require('./schema');
const { CrawlerError, ErrorType } = require('../../utils/errors');
const createLogger = require('../../utils/logger');

const logger = createLogger('validator');

/**
 * 數據驗證器類
 * 用於驗證爬取的數據是否符合預定義的模式
 */
class DataValidator {
  /**
   * 驗證文章數據
   * @param {Object} article - 文章數據
   * @returns {Object} - 驗證後的數據
   * @throws {CrawlerError} - 驗證失敗時拋出錯誤
   */
  static validateArticle(article) {
    try {
      const result = schemas.articleSchema.safeParse(article);
      
      if (!result.success) {
        const errorMessage = this._formatZodError(result.error);
        throw new CrawlerError(
          `文章數據驗證失敗: ${errorMessage}`,
          ErrorType.VALIDATION_ERROR,
          result.error
        );
      }
      
      logger.debug('文章數據驗證成功');
      return result.data;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `文章數據驗證時發生錯誤: ${error.message}`,
          ErrorType.VALIDATION_ERROR,
          error
        );
      }
      
      logger.error(error.message);
      throw error;
    }
  }

  /**
   * 驗證開源項目數據
   * @param {Object} repository - 開源項目數據
   * @returns {Object} - 驗證後的數據
   * @throws {CrawlerError} - 驗證失敗時拋出錯誤
   */
  static validateRepository(repository) {
    try {
      const result = schemas.repositorySchema.safeParse(repository);
      
      if (!result.success) {
        const errorMessage = this._formatZodError(result.error);
        throw new CrawlerError(
          `開源項目數據驗證失敗: ${errorMessage}`,
          ErrorType.VALIDATION_ERROR,
          result.error
        );
      }
      
      logger.debug('開源項目數據驗證成功');
      return result.data;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `開源項目數據驗證時發生錯誤: ${error.message}`,
          ErrorType.VALIDATION_ERROR,
          error
        );
      }
      
      logger.error(error.message);
      throw error;
    }
  }

  /**
   * 驗證學習資源數據
   * @param {Object} resource - 學習資源數據
   * @returns {Object} - 驗證後的數據
   * @throws {CrawlerError} - 驗證失敗時拋出錯誤
   */
  static validateLearningResource(resource) {
    try {
      const result = schemas.learningResourceSchema.safeParse(resource);
      
      if (!result.success) {
        const errorMessage = this._formatZodError(result.error);
        throw new CrawlerError(
          `學習資源數據驗證失敗: ${errorMessage}`,
          ErrorType.VALIDATION_ERROR,
          result.error
        );
      }
      
      logger.debug('學習資源數據驗證成功');
      return result.data;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `學習資源數據驗證時發生錯誤: ${error.message}`,
          ErrorType.VALIDATION_ERROR,
          error
        );
      }
      
      logger.error(error.message);
      throw error;
    }
  }

  /**
   * 驗證排名數據
   * @param {Object} ranking - 排名數據
   * @returns {Object} - 驗證後的數據
   * @throws {CrawlerError} - 驗證失敗時拋出錯誤
   */
  static validateRanking(ranking) {
    try {
      const result = schemas.rankingSchema.safeParse(ranking);
      
      if (!result.success) {
        const errorMessage = this._formatZodError(result.error);
        throw new CrawlerError(
          `排名數據驗證失敗: ${errorMessage}`,
          ErrorType.VALIDATION_ERROR,
          result.error
        );
      }
      
      logger.debug('排名數據驗證成功');
      return result.data;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `排名數據驗證時發生錯誤: ${error.message}`,
          ErrorType.VALIDATION_ERROR,
          error
        );
      }
      
      logger.error(error.message);
      throw error;
    }
  }

  /**
   * 驗證爬蟲日誌數據
   * @param {Object} log - 爬蟲日誌數據
   * @returns {Object} - 驗證後的數據
   * @throws {CrawlerError} - 驗證失敗時拋出錯誤
   */
  static validateCrawlerLog(log) {
    try {
      const result = schemas.crawlerLogSchema.safeParse(log);
      
      if (!result.success) {
        const errorMessage = this._formatZodError(result.error);
        throw new CrawlerError(
          `爬蟲日誌數據驗證失敗: ${errorMessage}`,
          ErrorType.VALIDATION_ERROR,
          result.error
        );
      }
      
      return result.data;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `爬蟲日誌數據驗證時發生錯誤: ${error.message}`,
          ErrorType.VALIDATION_ERROR,
          error
        );
      }
      
      logger.error(error.message);
      throw error;
    }
  }

  /**
   * 格式化Zod錯誤信息
   * @param {Object} error - Zod錯誤對象
   * @returns {string} - 格式化後的錯誤信息
   * @private
   */
  static _formatZodError(error) {
    if (!error || !error.errors) {
      return '未知驗證錯誤';
    }
    
    return error.errors.map(err => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    }).join('; ');
  }
}

module.exports = DataValidator;