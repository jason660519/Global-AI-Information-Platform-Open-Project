require('dotenv').config();
const GitHubCrawler = require('./crawlers/sources/github-crawler');
const createLogger = require('./utils/logger');

const logger = createLogger('main');

/**
 * 執行GitHub爬蟲
 */
async function runGitHubCrawler() {
  try {
    logger.info('開始執行GitHub爬蟲任務');
    
    const crawler = new GitHubCrawler();
    const results = await crawler.crawl();
    
    logger.info('GitHub爬蟲任務完成', {
      trendingCount: results.trending.length,
      topicsCount: Object.keys(results.topics).length
    });
    
    return results;
  } catch (error) {
    logger.error(`GitHub爬蟲任務失敗: ${error.message}`, { stack: error.stack });
    throw error;
  }
}

/**
 * 主函數
 */
async function main() {
  try {
    logger.info('開始執行爬蟲任務');
    
    // 根據命令行參數決定執行哪個爬蟲
    const args = process.argv.slice(2);
    const crawlerType = args[0] || 'all';
    
    if (crawlerType === 'github' || crawlerType === 'all') {
      await runGitHubCrawler();
    }
    
    // 可以在這裡添加其他爬蟲的執行邏輯
    
    logger.info('所有爬蟲任務完成');
    process.exit(0);
  } catch (error) {
    logger.error(`爬蟲任務失敗: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
}

// 執行主函數
main();