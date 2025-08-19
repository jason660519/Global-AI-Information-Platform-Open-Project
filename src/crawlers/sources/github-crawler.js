const { APICrawler } = require('../engines/api-crawler');
const DataValidator = require('../../data/validators/data-validator');
const DataCleaner = require('../../data/processors/data-cleaner');
const { getSupabaseClient } = require('../../database/supabase');
const config = require('../../config');
const createLogger = require('../../utils/logger');
const { CrawlerError, ErrorType } = require('../../utils/errors');

const logger = createLogger('github-crawler');

/**
 * GitHub API爬蟲類
 * 用於爬取GitHub上的開源項目信息
 */
class GitHubCrawler extends APICrawler {
  /**
   * 建構子
   */
  constructor() {
    super({
      baseURL: config.sources.github.baseURL,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${config.sources.github.token}`
      },
      timeout: config.crawler.timeout,
      retries: config.crawler.retries
    });
    
    this.supabase = getSupabaseClient();
    this.topics = config.sources.github.topics;
    this.perPage = 100; // GitHub API每頁最大數量
    
    logger.info('GitHub爬蟲初始化完成');
  }

  /**
   * 爬取GitHub上的熱門項目
   * @param {Object} options - 爬取選項
   * @returns {Promise<Array>} - 爬取結果
   */
  async crawlTrendingRepositories(options = {}) {
    const { language = '', since = 'daily', limit = 50 } = options;
    
    try {
      logger.info(`開始爬取GitHub趨勢項目，語言: ${language || '全部'}, 時間範圍: ${since}`);
      
      // GitHub趨勢API的URL
      const url = '/search/repositories';
      
      // 構建查詢參數
      let query = 'stars:>100';
      
      if (language) {
        query += ` language:${language}`;
      }
      
      // 根據時間範圍設置創建時間
      const date = new Date();
      if (since === 'daily') {
        date.setDate(date.getDate() - 1);
      } else if (since === 'weekly') {
        date.setDate(date.getDate() - 7);
      } else if (since === 'monthly') {
        date.setMonth(date.getMonth() - 1);
      }
      
      const dateString = date.toISOString().split('T')[0];
      query += ` created:>${dateString}`;
      
      // 發送請求
      const response = await this.get(url, {
        params: {
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: Math.min(limit, this.perPage)
        }
      });
      
      const repositories = response.items;
      
      // 處理和保存數據
      const results = [];
      for (const repo of repositories) {
        try {
          const processedRepo = await this.processRepository(repo);
          results.push(processedRepo);
        } catch (error) {
          logger.error(`處理倉庫 ${repo.full_name} 時發生錯誤: ${error.message}`);
        }
      }
      
      logger.info(`成功爬取 ${results.length} 個GitHub趨勢項目`);
      
      return results;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `爬取GitHub趨勢項目時發生錯誤: ${error.message}`,
          ErrorType.UNKNOWN_ERROR,
          error
        );
      }
      
      logger.error(error.message, { stack: error.stack });
      throw error;
    }
  }

  /**
   * 爬取特定主題的項目
   * @param {string} topic - 主題名稱
   * @param {Object} options - 爬取選項
   * @returns {Promise<Array>} - 爬取結果
   */
  async crawlRepositoriesByTopic(topic, options = {}) {
    const { limit = 50, sort = 'stars', order = 'desc' } = options;
    
    try {
      logger.info(`開始爬取主題 ${topic} 的GitHub項目`);
      
      // GitHub搜索API的URL
      const url = '/search/repositories';
      
      // 構建查詢參數
      const query = `topic:${topic}`;
      
      // 發送請求
      const response = await this.get(url, {
        params: {
          q: query,
          sort,
          order,
          per_page: Math.min(limit, this.perPage)
        }
      });
      
      const repositories = response.items;
      
      // 處理和保存數據
      const results = [];
      for (const repo of repositories) {
        try {
          const processedRepo = await this.processRepository(repo);
          results.push(processedRepo);
        } catch (error) {
          logger.error(`處理倉庫 ${repo.full_name} 時發生錯誤: ${error.message}`);
        }
      }
      
      logger.info(`成功爬取 ${results.length} 個主題為 ${topic} 的GitHub項目`);
      
      return results;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `爬取主題 ${topic} 的GitHub項目時發生錯誤: ${error.message}`,
          ErrorType.UNKNOWN_ERROR,
          error
        );
      }
      
      logger.error(error.message, { stack: error.stack });
      throw error;
    }
  }

  /**
   * 爬取特定用戶或組織的項目
   * @param {string} owner - 用戶或組織名稱
   * @param {Object} options - 爬取選項
   * @returns {Promise<Array>} - 爬取結果
   */
  async crawlRepositoriesByOwner(owner, options = {}) {
    const { limit = 50, sort = 'updated', direction = 'desc' } = options;
    
    try {
      logger.info(`開始爬取用戶/組織 ${owner} 的GitHub項目`);
      
      // GitHub API的URL
      const url = `/users/${owner}/repos`;
      
      // 發送請求
      const repositories = await this.get(url, {
        params: {
          sort,
          direction,
          per_page: Math.min(limit, this.perPage)
        }
      });
      
      // 處理和保存數據
      const results = [];
      for (const repo of repositories) {
        try {
          const processedRepo = await this.processRepository(repo);
          results.push(processedRepo);
        } catch (error) {
          logger.error(`處理倉庫 ${repo.full_name} 時發生錯誤: ${error.message}`);
        }
      }
      
      logger.info(`成功爬取 ${results.length} 個用戶/組織 ${owner} 的GitHub項目`);
      
      return results;
    } catch (error) {
      if (!(error instanceof CrawlerError)) {
        error = new CrawlerError(
          `爬取用戶/組織 ${owner} 的GitHub項目時發生錯誤: ${error.message}`,
          ErrorType.UNKNOWN_ERROR,
          error
        );
      }
      
      logger.error(error.message, { stack: error.stack });
      throw error;
    }
  }

  /**
   * 爬取所有配置的主題
   * @returns {Promise<Object>} - 爬取結果
   */
  async crawlAllTopics() {
    const results = {};
    
    for (const topic of this.topics) {
      try {
        const repositories = await this.crawlRepositoriesByTopic(topic, { limit: 20 });
        results[topic] = repositories;
      } catch (error) {
        logger.error(`爬取主題 ${topic} 時發生錯誤: ${error.message}`);
        results[topic] = [];
      }
    }
    
    return results;
  }

  /**
   * 處理倉庫數據
   * @param {Object} repository - 原始倉庫數據
   * @returns {Promise<Object>} - 處理後的倉庫數據
   */
  async processRepository(repository) {
    try {
      // 提取需要的字段
      const processedRepo = {
        name: repository.name,
        full_name: repository.full_name,
        description: repository.description,
        url: repository.html_url,
        homepage: repository.homepage,
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        language: repository.language,
        topics: repository.topics || [],
        owner: {
          login: repository.owner.login,
          type: repository.owner.type,
          url: repository.owner.html_url
        },
        created_at: repository.created_at,
        updated_at: repository.updated_at,
        license: repository.license,
        metadata: {
          api_url: repository.url,
          open_issues: repository.open_issues_count,
          watchers: repository.watchers_count,
          default_branch: repository.default_branch,
          is_fork: repository.fork
        }
      };
      
      // 驗證數據
      const validatedRepo = DataValidator.validateRepository(processedRepo);
      
      // 保存到數據庫
      await this.saveRepository(validatedRepo);
      
      return validatedRepo;
    } catch (error) {
      logger.error(`處理倉庫數據時發生錯誤: ${error.message}`);
      throw error;
    }
  }

  /**
   * 保存倉庫數據到數據庫
   * @param {Object} repository - 處理後的倉庫數據
   * @returns {Promise<void>}
   */
  async saveRepository(repository) {
    try {
      // 檢查是否已存在
      const exists = await this.supabase.exists(
        this.supabase.tables.repositories,
        { full_name: repository.full_name }
      );
      
      // 保存原始數據到Storage
      const rawDataPath = `repositories/${repository.full_name.replace('/', '_')}_${Date.now()}.json`;
      await this.supabase.uploadRawData(rawDataPath, JSON.stringify(repository));
      
      // 保存處理後的數據到數據庫
      await this.supabase.insert(
        this.supabase.tables.repositories,
        {
          ...repository,
          raw_data_path: rawDataPath,
          crawled_at: new Date().toISOString()
        },
        { upsert: exists }
      );
      
      // 記錄爬蟲活動
      await this.supabase.logCrawlerActivity({
        crawlerName: 'github',
        status: 'success',
        message: `成功爬取倉庫 ${repository.full_name}`,
        details: {
          repository_name: repository.full_name,
          stars: repository.stars,
          language: repository.language
        }
      });
    } catch (error) {
      logger.error(`保存倉庫 ${repository.full_name} 時發生錯誤: ${error.message}`);
      
      // 記錄爬蟲活動
      await this.supabase.logCrawlerActivity({
        crawlerName: 'github',
        status: 'error',
        message: `保存倉庫 ${repository.full_name} 時發生錯誤`,
        details: {
          repository_name: repository.full_name,
          error: error.message
        }
      });
      
      throw error;
    }
  }

  /**
   * 執行爬蟲
   * @returns {Promise<Object>} - 爬取結果
   */
  async crawl() {
    try {
      logger.info('開始執行GitHub爬蟲');
      
      const results = {
        trending: await this.crawlTrendingRepositories(),
        topics: await this.crawlAllTopics()
      };
      
      logger.info('GitHub爬蟲執行完成');
      
      return results;
    } catch (error) {
      logger.error(`GitHub爬蟲執行失敗: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

module.exports = GitHubCrawler;