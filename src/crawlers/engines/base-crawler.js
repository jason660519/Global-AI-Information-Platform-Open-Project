/**
 * 基礎爬蟲類
 * 所有特定爬蟲實現都應該繼承這個基礎類
 */
class BaseCrawler {
  /**
   * 建構子
   * @param {Object} config - 爬蟲配置
   * @param {Object} logger - 日誌記錄器
   */
  constructor(config, logger) {
    if (new.target === BaseCrawler) {
      throw new Error('BaseCrawler是抽象類，不能直接實例化');
    }
    
    this.config = config;
    this.logger = logger;
    this.retryCount = 0;
    this.maxRetries = config.crawler.maxRetries;
  }

  /**
   * 執行爬蟲任務的主方法
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      this.logger.info(`開始執行爬蟲任務: ${this.constructor.name}`);
      
      // 爬取原始數據
      const rawData = await this.crawl();
      
      // 處理數據
      const processedData = await this.process(rawData);
      
      // 驗證數據
      const validData = await this.validate(processedData);
      
      // 儲存數據
      await this.save(validData);
      
      this.logger.info(`爬蟲任務完成: ${this.constructor.name}`);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * 爬取數據的抽象方法，子類必須實現
   * @returns {Promise<any>}
   */
  async crawl() {
    throw new Error('子類必須實現crawl方法');
  }

  /**
   * 處理數據的抽象方法，子類必須實現
   * @param {any} rawData - 爬取的原始數據
   * @returns {Promise<any>}
   */
  async process(rawData) {
    throw new Error('子類必須實現process方法');
  }

  /**
   * 驗證數據的抽象方法，子類必須實現
   * @param {any} processedData - 處理後的數據
   * @returns {Promise<any>}
   */
  async validate(processedData) {
    throw new Error('子類必須實現validate方法');
  }

  /**
   * 儲存數據的抽象方法，子類必須實現
   * @param {any} validData - 驗證後的有效數據
   * @returns {Promise<void>}
   */
  async save(validData) {
    throw new Error('子類必須實現save方法');
  }

  /**
   * 處理錯誤的方法
   * @param {Error} error - 捕獲的錯誤
   * @returns {Promise<void>}
   */
  async handleError(error) {
    this.logger.error(`爬蟲執行錯誤: ${error.message}`, {
      crawler: this.constructor.name,
      stack: error.stack
    });
    
    // 實現重試邏輯
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = this.config.crawler.retryDelay * Math.pow(2, this.retryCount - 1);
      
      this.logger.info(`嘗試重試 (${this.retryCount}/${this.maxRetries}) 在 ${delay}ms 後`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.execute();
    }
    
    this.logger.error(`爬蟲任務失敗，已達到最大重試次數: ${this.maxRetries}`);
  }
}

module.exports = BaseCrawler;