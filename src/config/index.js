import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Supabase配置
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    storage: {
      rawDataBucket: 'raw-data',
      processingBucket: 'processing-data',
    },
    tables: {
      repositories: 'GITHUB REPO API',
      news: 'news',
      resources: 'learning_resources',
      rankings: 'rankings',
      videos: 'videos',
      crawlerLogs: 'crawler_logs',
    },
  },

  // 爬蟲配置
  crawler: {
    userAgent: process.env.CRAWLER_USER_AGENT || 'SoftHubBot/1.0',
    timeout: parseInt(process.env.CRAWLER_REQUEST_TIMEOUT || '30000', 10),
    maxRetries: parseInt(process.env.CRAWLER_MAX_RETRIES || '3', 10),
    retryDelay: 1000, // 重試延遲的基本毫秒數
    concurrency: 5, // 並發爬蟲數量
    maxRequests: parseInt(process.env.MAX_REQUESTS || '4500', 10), // 每次執行的最大請求數
    rateLimits: {
      github: {
        requestsPerHour: 5000, // GitHub API 認證用戶的限制
        requestsPerExecution: parseInt(process.env.MAX_REQUESTS || '4500', 10), // 每次執行限制
      },
    },
  },

  // 日誌配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || 'logs/crawler.log',
  },

  // 資料來源配置
  sources: {
    github: {
      apiBaseUrl: 'https://api.github.com',
      token: process.env.GITHUB_TOKEN,
      crawlFrequency: '0 */2 * * *', // 每2小時執行一次 (cron格式)
      topics: [
        'javascript',
        'typescript',
        'python',
        'java',
        'go',
        'rust',
        'cpp',
        'csharp',
        'php',
        'ruby',
      ],
    },
    // 其他資料來源配置可以在這裡添加
  },
};

export default config;
