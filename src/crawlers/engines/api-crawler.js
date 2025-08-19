import axios from 'axios';
import BaseCrawler from './base-crawler.js';

/**
 * API爬蟲引擎
 * 用於處理API請求的爬蟲
 */
class APICrawler extends BaseCrawler {
  /**
   * 建構子
   * @param {Object} config - 爬蟲配置
   * @param {Object} logger - 日誌記錄器
   * @param {Object} options - API選項
   * @param {string} options.baseUrl - API基礎URL
   * @param {Object} options.headers - 請求頭
   * @param {Object} options.params - 請求參數
   */
  constructor(config, logger, options = {}) {
    super(config, logger);

    this.baseUrl = options.baseUrl || '';
    this.headers = options.headers || {};
    this.params = options.params || {};

    // 設置axios實例
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'User-Agent': config.crawler.userAgent,
        ...this.headers,
      },
      timeout: config.crawler.timeout,
    });
  }

  /**
   * 發送GET請求
   * @param {string} endpoint - API端點
   * @param {Object} params - 請求參數
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, {
        params: { ...this.params, ...params },
      });

      return response.data;
    } catch (error) {
      this.handleRequestError(error, 'GET', endpoint);
      throw error;
    }
  }

  /**
   * 發送POST請求
   * @param {string} endpoint - API端點
   * @param {Object} data - 請求數據
   * @param {Object} params - 請求參數
   * @returns {Promise<any>}
   */
  async post(endpoint, data = {}, params = {}) {
    try {
      const response = await this.client.post(endpoint, data, {
        params: { ...this.params, ...params },
      });

      return response.data;
    } catch (error) {
      this.handleRequestError(error, 'POST', endpoint);
      throw error;
    }
  }

  /**
   * 處理請求錯誤
   * @param {Error} error - 錯誤對象
   * @param {string} method - 請求方法
   * @param {string} endpoint - API端點
   */
  handleRequestError(error, method, endpoint) {
    if (error.response) {
      // 服務器回應了錯誤狀態碼
      this.logger.error(`API請求錯誤: ${method} ${endpoint} - 狀態碼: ${error.response.status}`, {
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // 請求已發送但沒有收到回應
      this.logger.error(`API請求無回應: ${method} ${endpoint}`, {
        request: error.request,
      });
    } else {
      // 設置請求時發生錯誤
      this.logger.error(`API請求設置錯誤: ${method} ${endpoint} - ${error.message}`);
    }
  }

  /**
   * 檢查是否達到API速率限制
   * @param {Object} response - API回應
   * @returns {boolean}
   */
  isRateLimited(response) {
    // 檢查常見的速率限制標頭
    const remainingRequests = parseInt(response.headers['x-ratelimit-remaining'] || '-1', 10);
    return remainingRequests === 0;
  }

  /**
   * 獲取下一次可請求的時間
   * @param {Object} response - API回應
   * @returns {number} - 毫秒數
   */
  getRetryAfter(response) {
    // 檢查常見的重試標頭
    const retryAfter = response.headers['retry-after'] || response.headers['x-ratelimit-reset'];

    if (retryAfter) {
      // 如果是時間戳，計算等待時間
      if (retryAfter.length > 5) {
        const resetTime = new Date(parseInt(retryAfter, 10) * 1000);
        return Math.max(0, resetTime - new Date());
      }

      // 如果是秒數，轉換為毫秒
      return parseInt(retryAfter, 10) * 1000;
    }

    // 默認等待時間
    return 60000; // 1分鐘
  }
}

export default APICrawler;
