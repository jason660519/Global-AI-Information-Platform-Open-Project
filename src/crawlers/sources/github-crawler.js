import APICrawler from '../engines/api-crawler.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { validateRepositoryData } from '../../data/validators/repository-validator.js';
import { cleanRepositoryData } from '../../data/processors/data-cleaner.js';
import supabaseClient from '../../database/supabase.js';
import CSVExporter from '../../exporters/csv-exporter.js';
import SupabaseUploader from '../../uploaders/supabase-uploader.js';
import { CrawlerError, ErrorType } from '../../utils/errors/index.js';

/**
 * GitHub API爬蟲類
 * 用於爬取GitHub上的開源項目信息
 */
class GitHubCrawler extends APICrawler {
  /**
   * 建構子
   */
  constructor() {
    super(config, logger, {
      baseUrl: config.sources.github.apiBaseUrl,
      headers: {
        Authorization: `token ${config.sources.github.token}`,
        'User-Agent': config.crawler.userAgent,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    this.supabase = supabaseClient;
    this.topics = config.sources.github.topics;
    this.perPage = 100; // GitHub API每頁最大數量
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
    this.csvExporter = new CSVExporter();
    this.supabaseUploader = new SupabaseUploader();

    logger.info('GitHub爬蟲初始化完成');
  }

  /**
   * 構建GitHub搜索查詢字符串
   * @param {Object} options - 搜索選項
   * @returns {string} - 搜索查詢字符串
   */
  buildSearchQuery({ language, timeRange, minStars }) {
    const parts = [];

    // 添加星數條件
    if (minStars > 0) {
      parts.push(`stars:>=${minStars}`);
    }

    // 添加語言條件
    if (language && language !== 'all') {
      parts.push(`language:${language}`);
    }

    // 添加時間範圍條件
    const now = new Date();
    let dateThreshold;

    switch (timeRange) {
      case 'daily':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    parts.push(`created:>=${dateThreshold.toISOString().split('T')[0]}`);

    return parts.join(' ');
  }

  /**
   * 搜索GitHub倉庫
   * @param {string} query - 搜索查詢
   * @param {number} maxResults - 最大結果數
   * @returns {Promise<Array>} - 搜索結果
   */
  async searchRepositories(query, maxResults = 100) {
    try {
      const params = new URLSearchParams({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: Math.min(maxResults, 100),
      });

      const response = await this.get(`/search/repositories?${params.toString()}`);

      return response.items || [];
    } catch (error) {
      logger.error('搜索GitHub倉庫時出錯:', error);
      throw error;
    }
  }

  /**
   * 爬取GitHub上的熱門項目
   * @param {Object} options - 爬取選項
   * @returns {Promise<Array>} - 爬取結果
   */
  async crawlTrendingRepositories(options = {}) {
    const {
      language = '',
      timeRange = 'daily', // daily, weekly, monthly
      minStars = 10,
      maxResults = 100,
      exportCSV = true,
      uploadToSupabase = true,
    } = options;

    try {
      logger.info(`開始爬取GitHub趨勢倉庫 - 語言: ${language || '全部'}, 時間範圍: ${timeRange}`);

      // 構建搜索查詢
      const query = this.buildSearchQuery({ language, timeRange, minStars });

      // 執行搜索
      const searchResults = await this.searchRepositories(query, maxResults);

      // 處理和驗證數據
      const processedRepositories = [];

      for (const repo of searchResults) {
        try {
          // 清理數據
          const cleanedData = cleanRepositoryData(repo);

          // 暫時跳過驗證，直接使用清理後的數據
          processedRepositories.push(cleanedData);
          logger.info(`倉庫數據處理成功: ${repo.full_name}`);

          // // 驗證數據
          // const validationResult = validateRepositoryData(cleanedData);
          // if (validationResult.isValid) {
          //   processedRepositories.push(cleanedData);
          //   logger.info(`倉庫數據驗證成功: ${repo.full_name}`);
          // } else {
          //   logger.warn(`倉庫數據驗證失敗: ${repo.full_name}`, validationResult.errors);
          // }
        } catch (error) {
          logger.error(`處理倉庫數據時出錯: ${repo.full_name}`, error);
        }
      }

      let csvFilePath = null;
      let uploadResults = null;

      logger.info(`處理後的倉庫數量: ${processedRepositories.length}`);
      logger.info(`exportCSV參數: ${exportCSV}`);

      if (processedRepositories.length > 0) {
        logger.info('開始處理導出和上傳邏輯');
        // 導出為CSV
        if (exportCSV) {
          logger.info('開始CSV導出');
          try {
            csvFilePath = await this.csvExporter.exportRepositories(
              processedRepositories,
              `github-trending-${language || 'all'}-${timeRange}-${Date.now()}.csv`
            );
            logger.info(`數據已導出為CSV: ${csvFilePath}`);
          } catch (error) {
            logger.error('CSV導出失敗:', error);
          }
        } else {
          logger.info('跳過CSV導出');
        }

        // 上傳到Supabase
        if (uploadToSupabase) {
          logger.info('開始Supabase上傳');
          try {
            uploadResults = await this.supabaseUploader.uploadRepositories(processedRepositories);
            logger.info(
              `數據已上傳到Supabase: 成功 ${uploadResults.successful}, 失敗 ${uploadResults.failed}`
            );
          } catch (error) {
            logger.error('Supabase上傳失敗:', error);
          }
        } else {
          logger.info('跳過Supabase上傳');
        }

        // 保存到數據庫（向後兼容）- 暫時禁用
        // await this.saveRepositories(processedRepositories);
      }

      logger.info(`成功爬取並處理了 ${processedRepositories.length} 個倉庫`);

      return {
        repositories: processedRepositories,
        csvFilePath,
        uploadResults,
        summary: {
          total: processedRepositories.length,
          language: language || 'all',
          timeRange,
          minStars,
        },
      };
    } catch (error) {
      logger.error('爬取GitHub趨勢倉庫時出錯:', error);
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
          per_page: Math.min(limit, this.perPage),
        },
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
          per_page: Math.min(limit, this.perPage),
        },
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
          url: repository.owner.html_url,
        },
        created_at: repository.created_at,
        updated_at: repository.updated_at,
        license: repository.license,
        metadata: {
          api_url: repository.url,
          open_issues: repository.open_issues_count,
          watchers: repository.watchers_count,
          default_branch: repository.default_branch,
          is_fork: repository.fork,
        },
      };

      // 清理數據
      const cleanedData = cleanRepositoryData(processedRepo);

      // 驗證數據
      const validationResult = validateRepositoryData(cleanedData);
      if (!validationResult.isValid) {
        throw new Error(`數據驗證失敗: ${validationResult.errors.join(', ')}`);
      }

      const validatedRepo = cleanedData;

      // 保存到數據庫
      await this.saveRepository(validatedRepo);

      return validatedRepo;
    } catch (error) {
      logger.error(`處理倉庫數據時發生錯誤: ${error.message}`);
      throw error;
    }
  }

  /**
   * 保存多個倉庫數據到數據庫
   * @param {Array} repositories - 處理後的倉庫數據數組
   * @returns {Promise<void>}
   */
  async saveRepositories(repositories) {
    for (const repository of repositories) {
      await this.saveRepository(repository);
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
      const exists = await this.supabase.exists(this.supabase.tables.repositories, {
        full_name: repository.full_name,
      });

      // 保存原始數據到Storage (暫時禁用)
      const rawDataPath = `repositories/${repository.full_name.replace('/', '_')}_${Date.now()}.json`;
      // await this.supabase.uploadRawData(rawDataPath, JSON.stringify(repository));

      // 保存處理後的數據到數據庫 (暫時禁用)
      // await this.supabase.insert(
      //   this.supabase.tables.repositories,
      //   {
      //     ...repository,
      //     raw_data_path: rawDataPath,
      //     crawled_at: new Date().toISOString()
      //   },
      //   { upsert: exists }
      // );

      logger.info(`成功處理倉庫: ${repository.full_name}`);

      // 記錄爬蟲活動 (暫時禁用)
      // await this.supabase.logCrawlerActivity({
      //   crawlerName: 'github',
      //   status: 'success',
      //   message: `成功爬取倉庫 ${repository.full_name}`,
      //   details: {
      //     repository_name: repository.full_name,
      //     stars: repository.stars,
      //     language: repository.language
      //   }
      // });
    } catch (error) {
      logger.error(`保存倉庫 ${repository.full_name} 時發生錯誤: ${error.message}`);

      // 記錄爬蟲活動 (暫時禁用)
      // await this.supabase.logCrawlerActivity({
      //   crawlerName: 'github',
      //   status: 'error',
      //   message: `保存倉庫 ${repository.full_name} 時發生錯誤`,
      //   details: {
      //     repository_name: repository.full_name,
      //     error: error.message
      //   }
      // });

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
        topics: await this.crawlAllTopics(),
      };

      logger.info('GitHub爬蟲執行完成');

      return results;
    } catch (error) {
      logger.error(`GitHub爬蟲執行失敗: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

export default GitHubCrawler;

// 如果直接運行此文件，執行示例爬取
if (import.meta.url === `file://${process.argv[1]}`) {
  const crawler = new GitHubCrawler();

  async function runCrawler() {
    try {
      console.log('開始GitHub爬蟲測試...');

      const options = {
        language: process.argv[2] || 'javascript',
        timeRange: process.argv[3] || 'daily',
        minStars: parseInt(process.argv[4]) || 10,
        maxResults: parseInt(process.argv[5]) || 50,
        exportCSV: true,
        uploadToSupabase: true,
      };

      console.log('爬取選項:', options);

      const results = await crawler.crawlTrendingRepositories(options);

      console.log('\n=== 爬取結果 ===');
      console.log(`總共爬取: ${results.summary.total} 個倉庫`);
      console.log(`語言: ${results.summary.language}`);
      console.log(`時間範圍: ${results.summary.timeRange}`);
      console.log(`最小星數: ${results.summary.minStars}`);

      if (results.csvFilePath) {
        console.log(`CSV文件: ${results.csvFilePath}`);
      }

      if (results.uploadResults) {
        console.log(
          `Supabase上傳: 成功 ${results.uploadResults.successful}, 失敗 ${results.uploadResults.failed}`
        );
      }

      console.log('\n爬蟲測試完成！');
    } catch (error) {
      console.error('爬蟲測試失敗:', error);
      process.exit(1);
    }
  }

  runCrawler();
}