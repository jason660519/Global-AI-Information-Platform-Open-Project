/**
 * 錯誤類型枚舉
 * @enum {string}
 */
const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * 爬蟲錯誤類
 * 用於標準化爬蟲過程中的錯誤
 */
class CrawlerError extends Error {
  /**
   * 建構子
   * @param {string} message - 錯誤訊息
   * @param {ErrorType} type - 錯誤類型
   * @param {Error} originalError - 原始錯誤
   */
  constructor(message, type = ErrorType.UNKNOWN_ERROR, originalError = null) {
    super(message);
    this.name = 'CrawlerError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date();
    
    // 保留原始錯誤的堆疊跟踪
    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}

/**
 * 錯誤分類器
 * 用於將各種錯誤分類為標準錯誤類型
 */
class ErrorClassifier {
  /**
   * 分類錯誤
   * @param {Error} error - 原始錯誤
   * @returns {ErrorType} - 錯誤類型
   */
  static classify(error) {
    // 已經是CrawlerError的情況
    if (error instanceof CrawlerError) {
      return error.type;
    }
    
    // Axios錯誤
    if (error.isAxiosError) {
      if (!error.response) {
        return ErrorType.NETWORK_ERROR;
      }
      
      const status = error.response.status;
      
      if (status === 429) {
        return ErrorType.RATE_LIMIT_ERROR;
      }
      
      if (status >= 400 && status < 500) {
        return ErrorType.HTTP_ERROR;
      }
      
      if (status >= 500) {
        return ErrorType.NETWORK_ERROR;
      }
    }
    
    // 網絡錯誤
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.message.includes('timeout')
    ) {
      return ErrorType.NETWORK_ERROR;
    }
    
    // 解析錯誤
    if (
      error.name === 'SyntaxError' ||
      error.message.includes('parse') ||
      error.message.includes('JSON')
    ) {
      return ErrorType.PARSE_ERROR;
    }
    
    // 驗證錯誤
    if (
      error.name === 'ValidationError' ||
      error.name === 'ZodError'
    ) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    // 資料庫錯誤
    if (error.message.includes('database') || error.message.includes('supabase')) {
      return ErrorType.DATABASE_ERROR;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }
  
  /**
   * 創建標準化的爬蟲錯誤
   * @param {Error} error - 原始錯誤
   * @param {string} customMessage - 自定義錯誤訊息
   * @returns {CrawlerError} - 標準化的爬蟲錯誤
   */
  static createCrawlerError(error, customMessage = '') {
    const type = this.classify(error);
    const message = customMessage || error.message;
    
    return new CrawlerError(message, type, error);
  }
}

module.exports = {
  ErrorType,
  CrawlerError,
  ErrorClassifier
};