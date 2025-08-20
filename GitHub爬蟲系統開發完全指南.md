# GitHub爬蟲系統開發完全指南
## 從零開始打造現代化數據爬蟲平台

### 適合對象
- 16歲以上高中生
- 對程式設計有基礎興趣的初學者
- 想學習現代Web開發技術的學生

---

## 目錄

### 第一章：準備工作與環境設置
### 第二章：專案架構設計
### 第三章：依賴管理與現代化升級
### 第四章：組件化重構
### 第五章：GitHub API爬蟲實現
### 第六章：數據處理與驗證
### 第七章：CSV導出功能
### 第八章：數據庫集成（Supabase）
### 第九章：錯誤處理與日誌系統
### 第十章：代碼品質工具配置
### 第十一章：測試驗證
### 第十二章：版本控制與部署

---

## 第一章：準備工作與環境設置

### 1.1 你需要什麼？

**必備工具：**
- Node.js（建議18.0以上版本）
- Git
- Visual Studio Code（或其他代碼編輯器）
- GitHub帳號
- Supabase帳號（免費）

**基礎知識：**
- JavaScript基礎語法
- 對API概念的基本了解
- 命令行基本操作

### 1.2 創建GitHub Token

1. 登入GitHub
2. 進入 Settings → Developer settings → Personal access tokens
3. 點擊 "Generate new token"
4. 選擇權限：`public_repo`, `read:user`
5. 複製並保存token（只會顯示一次！）

### 1.3 註冊Supabase

1. 前往 [supabase.com](https://supabase.com)
2. 註冊免費帳號
3. 創建新專案
4. 記錄專案URL和API Key

---

## 第二章：專案架構設計

### 2.1 現代化專案結構

我們要建立一個組件化、可維護的專案結構：

```
project/
├── src/                    # 主要源代碼
│   ├── config/            # 配置文件
│   ├── crawlers/          # 爬蟲模組
│   │   ├── engines/       # 爬蟲引擎
│   │   └── sources/       # 數據來源
│   ├── data/              # 數據處理
│   │   ├── processors/    # 數據處理器
│   │   └── validators/    # 數據驗證器
│   ├── database/          # 數據庫連接
│   ├── exporters/         # 導出模組
│   ├── uploaders/         # 上傳模組
│   └── utils/             # 工具函數
├── tests/                 # 測試文件
├── exports/               # 導出的CSV文件
├── package.json           # 專案配置
└── README.md             # 專案說明
```

### 2.2 為什麼這樣設計？

**組件化優勢：**
- 每個模組職責單一
- 易於測試和維護
- 可重複使用
- 團隊協作友好

---

## 第三章：依賴管理與現代化升級

### 3.1 package.json 現代化

首先，我們需要更新專案的依賴包到2024年的最新版本：

```json
{
  "name": "github-crawler-system",
  "version": "2.0.0",
  "type": "module",
  "description": "現代化GitHub爬蟲系統",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "format": "prettier --write src/ tests/",
    "format:check": "prettier --check src/ tests/"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "csv-writer": "^1.6.0",
    "winston": "^3.11.0",
    "@supabase/supabase-js": "^2.38.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "@jest/globals": "^29.7.0"
  }
}
```

### 3.2 重要概念解釋

**ES Modules (`"type": "module"`)：**
- 現代JavaScript模組系統
- 使用 `import/export` 語法
- 更好的樹搖優化
- 靜態分析友好

**依賴包說明：**
- `axios`：HTTP請求庫
- `cheerio`：服務器端jQuery（用於HTML解析）
- `csv-writer`：CSV文件生成
- `winston`：專業日誌系統
- `@supabase/supabase-js`：Supabase客戶端
- `dotenv`：環境變數管理

---

## 第四章：組件化重構

### 4.1 配置管理 (src/config/index.js)

```javascript
import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Supabase配置
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    tables: {
      repositories: 'repositories',
      crawlerLogs: 'crawler_logs',
    },
  },

  // 爬蟲配置
  crawler: {
    userAgent: 'SoftHubBot/1.0',
    timeout: 30000,
    maxRetries: 3,
    concurrency: 5,
  },

  // GitHub配置
  sources: {
    github: {
      apiBaseUrl: 'https://api.github.com',
      token: process.env.GITHUB_TOKEN,
      topics: ['javascript', 'python', 'react', 'vue', 'nodejs'],
    },
  },

  // 日誌配置
  logger: {
    level: 'info',
    filePath: 'logs/crawler.log',
  },
};

export default config;
```

### 4.2 環境變數設置 (.env)

在專案根目錄創建 `.env` 文件：

```env
# GitHub配置
GITHUB_TOKEN=your_github_token_here

# Supabase配置
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# 日誌配置
LOG_LEVEL=info
```

**重要提醒：**
- 絕對不要將 `.env` 文件提交到Git！
- 在 `.gitignore` 中添加 `.env`

---

## 第五章：GitHub API爬蟲實現

### 5.1 API爬蟲基礎引擎 (src/crawlers/engines/api-crawler.js)

```javascript
import axios from 'axios';
import { CrawlerError, ErrorType } from '../../utils/errors/index.js';

/**
 * API爬蟲基礎類
 * 提供通用的API請求功能
 */
class APICrawler {
  constructor(config, logger, options = {}) {
    this.config = config;
    this.logger = logger;
    this.client = axios.create({
      baseURL: options.baseUrl,
      timeout: config.crawler.timeout,
      headers: {
        'User-Agent': config.crawler.userAgent,
        ...options.headers,
      },
    });

    // 設置請求攔截器
    this.setupInterceptors();
  }

  setupInterceptors() {
    // 請求攔截器
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`發送請求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('請求配置錯誤:', error);
        return Promise.reject(error);
      }
    );

    // 響應攔截器
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`收到響應: ${response.status} ${response.config.url}`);
        return response.data;
      },
      (error) => {
        this.handleRequestError(error);
        return Promise.reject(error);
      }
    );
  }

  handleRequestError(error) {
    if (error.response) {
      const { status, statusText, data } = error.response;
      this.logger.error(`API請求失敗: ${status} ${statusText}`, data);
      
      if (status === 403) {
        throw new CrawlerError(
          'API速率限制或權限不足',
          ErrorType.RATE_LIMIT,
          { status, data }
        );
      }
    } else if (error.request) {
      this.logger.error('網絡請求失敗:', error.message);
      throw new CrawlerError(
        '網絡連接失敗',
        ErrorType.NETWORK_ERROR,
        { message: error.message }
      );
    }
  }

  async get(url, params = {}) {
    return await this.client.get(url, { params });
  }

  async post(url, data = {}) {
    return await this.client.post(url, data);
  }
}

export default APICrawler;
```

### 5.2 GitHub專用爬蟲 (src/crawlers/sources/github-crawler.js)

```javascript
import APICrawler from '../engines/api-crawler.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { cleanRepositoryData } from '../../data/processors/data-cleaner.js';
import CSVExporter from '../../exporters/csv-exporter.js';
import SupabaseUploader from '../../uploaders/supabase-uploader.js';

/**
 * GitHub API爬蟲類
 * 專門用於爬取GitHub上的開源項目信息
 */
class GitHubCrawler extends APICrawler {
  constructor() {
    super(config, logger, {
      baseUrl: config.sources.github.apiBaseUrl,
      headers: {
        Authorization: `token ${config.sources.github.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    this.csvExporter = new CSVExporter();
    this.supabaseUploader = new SupabaseUploader();
    this.perPage = 100; // GitHub API每頁最大數量

    logger.info('GitHub爬蟲初始化完成');
  }

  /**
   * 構建GitHub搜索查詢字符串
   */
  buildSearchQuery({ language, timeRange, minStars }) {
    const parts = [];
    const now = new Date();

    // 添加星數條件
    if (minStars > 0) {
      parts.push(`stars:>=${minStars}`);
    }

    // 添加語言條件
    if (language) {
      parts.push(`language:${language}`);
    }

    // 添加時間條件
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
   */
  async crawlTrendingRepositories(options = {}) {
    const {
      language = '',
      timeRange = 'daily',
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
      
      // 處理數據
      const processedRepositories = [];
      for (const repo of searchResults) {
        try {
          const cleanedData = cleanRepositoryData(repo);
          processedRepositories.push(cleanedData);
          logger.info(`倉庫數據處理成功: ${repo.full_name}`);
        } catch (error) {
          logger.error(`處理倉庫數據時出錯: ${repo.full_name}`, error);
        }
      }

      let csvFilePath = null;
      let uploadResults = null;

      if (processedRepositories.length > 0) {
        // 導出為CSV
        if (exportCSV) {
          try {
            csvFilePath = await this.csvExporter.exportRepositories(
              processedRepositories,
              `github-trending-${language || 'all'}-${timeRange}-${Date.now()}.csv`
            );
            logger.info(`數據已導出為CSV: ${csvFilePath}`);
          } catch (error) {
            logger.error('CSV導出失敗:', error);
          }
        }

        // 上傳到Supabase
        if (uploadToSupabase) {
          try {
            uploadResults = await this.supabaseUploader.uploadRepositories(processedRepositories);
            logger.info(`數據已上傳到Supabase: 成功 ${uploadResults.successful}, 失敗 ${uploadResults.failed}`);
          } catch (error) {
            logger.error('Supabase上傳失敗:', error);
          }
        }
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
}

export default GitHubCrawler;
```

---

## 第六章：數據處理與驗證

### 6.1 數據清理器 (src/data/processors/data-cleaner.js)

```javascript
/**
 * 清理GitHub倉庫數據
 * 標準化數據格式，處理缺失值
 */
export function cleanRepositoryData(rawRepo) {
  // 安全地獲取嵌套屬性
  const safeGet = (obj, path, defaultValue = null) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  };

  // 清理主題數組
  const cleanTopics = (topics) => {
    if (!Array.isArray(topics)) return [];
    return topics.filter(topic => 
      typeof topic === 'string' && 
      topic.trim().length > 0
    ).map(topic => topic.trim().toLowerCase());
  };

  // 清理描述文本
  const cleanDescription = (description) => {
    if (!description || typeof description !== 'string') return '';
    return description
      .trim()
      .replace(/\s+/g, ' ') // 合併多個空格
      .replace(/[\r\n]+/g, ' ') // 移除換行符
      .substring(0, 500); // 限制長度
  };

  // 計算倉庫大小（KB）
  const calculateSize = (sizeInKB) => {
    const size = parseInt(sizeInKB, 10);
    return isNaN(size) ? 0 : size;
  };

  return {
    id: safeGet(rawRepo, 'id'),
    name: safeGet(rawRepo, 'name', ''),
    fullName: safeGet(rawRepo, 'full_name', ''),
    description: cleanDescription(safeGet(rawRepo, 'description')),
    url: safeGet(rawRepo, 'html_url', ''),
    stars: parseInt(safeGet(rawRepo, 'stargazers_count', 0), 10),
    forks: parseInt(safeGet(rawRepo, 'forks_count', 0), 10),
    watchers: parseInt(safeGet(rawRepo, 'watchers_count', 0), 10),
    language: safeGet(rawRepo, 'language', ''),
    topics: cleanTopics(safeGet(rawRepo, 'topics', [])),
    createdAt: safeGet(rawRepo, 'created_at', ''),
    updatedAt: safeGet(rawRepo, 'updated_at', ''),
    lastPush: safeGet(rawRepo, 'pushed_at', ''),
    size: calculateSize(safeGet(rawRepo, 'size', 0)),
    openIssues: parseInt(safeGet(rawRepo, 'open_issues_count', 0), 10),
    license: safeGet(rawRepo, 'license.name', ''),
    defaultBranch: safeGet(rawRepo, 'default_branch', 'main'),
    archived: Boolean(safeGet(rawRepo, 'archived', false)),
    disabled: Boolean(safeGet(rawRepo, 'disabled', false)),
    private: Boolean(safeGet(rawRepo, 'private', false)),
  };
}
```

### 6.2 數據驗證器 (src/data/validators/repository-validator.js)

```javascript
/**
 * 驗證倉庫數據的完整性和有效性
 */
export function validateRepositoryData(repo) {
  const errors = [];
  const warnings = [];

  // 必填字段驗證
  const requiredFields = ['id', 'name', 'fullName', 'url'];
  for (const field of requiredFields) {
    if (!repo[field]) {
      errors.push(`缺少必填字段: ${field}`);
    }
  }

  // URL格式驗證
  if (repo.url && !isValidUrl(repo.url)) {
    errors.push('URL格式無效');
  }

  // 數值字段驗證
  const numericFields = ['stars', 'forks', 'watchers', 'size', 'openIssues'];
  for (const field of numericFields) {
    if (repo[field] !== undefined && (!Number.isInteger(repo[field]) || repo[field] < 0)) {
      errors.push(`${field} 必須是非負整數`);
    }
  }

  // 日期格式驗證
  const dateFields = ['createdAt', 'updatedAt', 'lastPush'];
  for (const field of dateFields) {
    if (repo[field] && !isValidDate(repo[field])) {
      warnings.push(`${field} 日期格式可能無效`);
    }
  }

  // 描述長度檢查
  if (repo.description && repo.description.length > 500) {
    warnings.push('描述過長，已截斷');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}
```

---

## 第七章：CSV導出功能

### 7.1 CSV導出器 (src/exporters/csv-exporter.js)

```javascript
import createCsvWriter from 'csv-writer';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';

/**
 * CSV導出器類
 * 負責將數據導出為CSV格式
 */
class CSVExporter {
  constructor() {
    this.exportDir = 'exports';
    this.ensureExportDirectory();
  }

  /**
   * 確保導出目錄存在
   */
  async ensureExportDirectory() {
    try {
      await fs.access(this.exportDir);
    } catch (error) {
      await fs.mkdir(this.exportDir, { recursive: true });
      logger.info(`創建導出目錄: ${this.exportDir}`);
    }
  }

  /**
   * 導出倉庫數據為CSV
   */
  async exportRepositories(repositories, filename) {
    if (!repositories || repositories.length === 0) {
      throw new Error('沒有數據可導出');
    }

    const filePath = path.join(this.exportDir, filename);
    
    // 定義CSV列
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'fullName', title: 'Full Name' },
        { id: 'description', title: 'Description' },
        { id: 'url', title: 'URL' },
        { id: 'stars', title: 'Stars' },
        { id: 'forks', title: 'Forks' },
        { id: 'watchers', title: 'Watchers' },
        { id: 'language', title: 'Language' },
        { id: 'topics', title: 'Topics' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' },
        { id: 'lastPush', title: 'Last Push' },
        { id: 'size', title: 'Size (KB)' },
        { id: 'openIssues', title: 'Open Issues' },
        { id: 'license', title: 'License' },
        { id: 'defaultBranch', title: 'Default Branch' },
        { id: 'archived', title: 'Archived' },
        { id: 'disabled', title: 'Disabled' },
        { id: 'private', title: 'Private' },
      ],
    });

    // 處理數據格式
    const processedData = repositories.map(repo => ({
      ...repo,
      topics: Array.isArray(repo.topics) ? repo.topics.join(', ') : '',
      archived: repo.archived ? 'Yes' : 'No',
      disabled: repo.disabled ? 'Yes' : 'No',
      private: repo.private ? 'Yes' : 'No',
    }));

    try {
      await csvWriter.writeRecords(processedData);
      logger.info(`CSV文件導出成功: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('CSV導出失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取所有導出的CSV文件列表
   */
  async getExportedFiles() {
    try {
      const files = await fs.readdir(this.exportDir);
      return files
        .filter(file => file.endsWith('.csv'))
        .map(file => path.join(this.exportDir, file));
    } catch (error) {
      logger.error('讀取導出目錄失敗:', error);
      return [];
    }
  }
}

export default CSVExporter;
```

---

## 第八章：數據庫集成（Supabase）

### 8.1 Supabase連接 (src/database/supabase.js)

```javascript
import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// 創建Supabase客戶端
const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.key
);

// 測試連接
supabaseClient
  .from('repositories')
  .select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      logger.warn('Supabase連接測試失敗:', error.message);
    } else {
      logger.info('Supabase連接成功');
    }
  })
  .catch((error) => {
    logger.error('Supabase連接錯誤:', error);
  });

export default supabaseClient;
```

### 8.2 Supabase上傳器 (src/uploaders/supabase-uploader.js)

```javascript
import supabaseClient from '../database/supabase.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Supabase上傳器類
 * 負責將數據上傳到Supabase數據庫
 */
class SupabaseUploader {
  constructor() {
    this.supabase = supabaseClient;
    this.tableName = config.supabase.tables.repositories;
  }

  /**
   * 上傳倉庫數據到Supabase
   */
  async uploadRepositories(repositories) {
    if (!repositories || repositories.length === 0) {
      throw new Error('沒有數據可上傳');
    }

    logger.info(`開始上傳 ${repositories.length} 個倉庫到Supabase`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // 批量上傳，每次最多1000條記錄
    const batchSize = 1000;
    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize);
      
      try {
        const { data, error } = await this.supabase
          .from(this.tableName)
          .upsert(batch, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (error) {
          logger.error(`批次上傳失敗 (${i}-${i + batch.length}):`, error);
          results.failed += batch.length;
          results.errors.push({
            batch: `${i}-${i + batch.length}`,
            error: error.message,
          });
        } else {
          logger.info(`批次上傳成功 (${i}-${i + batch.length})`);
          results.successful += batch.length;
        }
      } catch (error) {
        logger.error(`批次上傳異常 (${i}-${i + batch.length}):`, error);
        results.failed += batch.length;
        results.errors.push({
          batch: `${i}-${i + batch.length}`,
          error: error.message,
        });
      }
    }

    logger.info(`Supabase上傳完成: 成功 ${results.successful}, 失敗 ${results.failed}`);
    return results;
  }

  /**
   * 檢查倉庫是否已存在
   */
  async checkRepositoryExists(repositoryId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('id', repositoryId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = 沒有找到記錄
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('檢查倉庫存在性時出錯:', error);
      return false;
    }
  }

  /**
   * 獲取數據庫統計信息
   */
  async getStatistics() {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return {
        totalRepositories: count,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('獲取統計信息時出錯:', error);
      return {
        totalRepositories: 0,
        lastUpdated: null,
        error: error.message,
      };
    }
  }
}

export default SupabaseUploader;
```

---

## 第九章：錯誤處理與日誌系統

### 9.1 自定義錯誤類 (src/utils/errors/index.js)

```javascript
/**
 * 錯誤類型枚舉
 */
export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_SYSTEM_ERROR: 'FILE_SYSTEM_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
};

/**
 * 自定義爬蟲錯誤類
 */
export class CrawlerError extends Error {
  constructor(message, type = ErrorType.NETWORK_ERROR, details = {}) {
    super(message);
    this.name = 'CrawlerError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // 保持堆棧跟蹤
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CrawlerError);
    }
  }

  /**
   * 轉換為JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * 錯誤處理工具函數
 */
export class ErrorHandler {
  static handle(error, logger) {
    if (error instanceof CrawlerError) {
      logger.error(`爬蟲錯誤 [${error.type}]: ${error.message}`, error.details);
    } else {
      logger.error('未知錯誤:', error);
    }
  }

  static isRetryable(error) {
    if (error instanceof CrawlerError) {
      return error.type === ErrorType.NETWORK_ERROR || error.type === ErrorType.RATE_LIMIT;
    }
    return false;
  }
}
```

### 9.2 日誌系統 (src/utils/logger.js)

```javascript
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';

// 確保日誌目錄存在
const logDir = path.dirname(config.logger.filePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 控制台輸出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // 如果有額外的元數據，添加到日誌中
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// 創建logger實例
const logger = winston.createLogger({
  level: config.logger.level,
  format: logFormat,
  transports: [
    // 文件輸出
    new winston.transports.File({
      filename: config.logger.filePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 錯誤日誌單獨文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 開發環境添加控制台輸出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// 添加便利方法
logger.success = (message, meta = {}) => {
  logger.info(`✅ ${message}`, meta);
};

logger.warning = (message, meta = {}) => {
  logger.warn(`⚠️ ${message}`, meta);
};

logger.failure = (message, meta = {}) => {
  logger.error(`❌ ${message}`, meta);
};

export default logger;
```

---

## 第十章：代碼品質工具配置

### 10.1 ESLint配置 (eslint.config.js)

```javascript
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      // 基本規則
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // 代碼風格
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      
      // ES6+
      'arrow-spacing': 'error',
      'template-curly-spacing': 'error',
      'object-shorthand': 'error',
      
      // 最佳實踐
      'eqeqeq': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
];
```

### 10.2 Prettier配置 (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### 10.3 Prettier忽略文件 (.prettierignore)

```
node_modules/
exports/
logs/
*.log
*.csv
package-lock.json
```

---

## 第十一章：測試驗證

### 11.1 Jest配置 (jest.config.cjs)

```javascript
module.exports = {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/*.js',
  ],
  setupFilesAfterEnv: [],
  testTimeout: 30000,
};
```

### 11.2 集成測試 (tests/integration.test.js)

```javascript
import { describe, it, expect } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

describe('專案集成測試', () => {
  it('應該存在所有必要的文件', async () => {
    const requiredFiles = [
      'package.json',
      'src/index.js',
      'src/config/index.js',
      'src/crawlers/sources/github-crawler.js',
      'src/exporters/csv-exporter.js',
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
      } catch (error) {
        throw new Error(`缺少必要文件: ${file}`);
      }
    }
  });

  it('應該存在exports目錄', async () => {
    try {
      const stats = await fs.stat('exports');
      expect(stats.isDirectory()).toBe(true);
    } catch (error) {
      throw new Error('exports目錄不存在');
    }
  });

  it('package.json應該包含正確的配置', async () => {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    
    expect(packageJson.name).toBeDefined();
    expect(packageJson.version).toBeDefined();
    expect(packageJson.type).toBe('module');
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.dependencies).toBeDefined();
    
    // 檢查必要的依賴
    const requiredDeps = ['axios', 'cheerio', 'csv-writer', 'winston'];
    for (const dep of requiredDeps) {
      expect(packageJson.dependencies[dep]).toBeDefined();
    }
  });

  it('應該能夠導入主要模組', async () => {
    // 測試ES模組導入
    const { default: config } = await import('../src/config/index.js');
    expect(config).toBeDefined();
    expect(config.sources).toBeDefined();
    expect(config.sources.github).toBeDefined();
  });
});
```

### 11.3 GitHub爬蟲測試 (tests/github-crawler.test.js)

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';
import GitHubCrawler from '../src/crawlers/sources/github-crawler.js';

describe('GitHub爬蟲測試', () => {
  let crawler;

  beforeEach(() => {
    crawler = new GitHubCrawler();
  });

  it('應該能夠初始化', () => {
    expect(crawler).toBeDefined();
    expect(crawler.csvExporter).toBeDefined();
    expect(crawler.supabaseUploader).toBeDefined();
  });

  it('應該能夠構建搜索查詢', () => {
    const query = crawler.buildSearchQuery({
      language: 'javascript',
      timeRange: 'daily',
      minStars: 10,
    });
    
    expect(query).toContain('stars:>=10');
    expect(query).toContain('language:javascript');
    expect(query).toContain('created:>=');
  });

  it('應該處理不同的時間範圍', () => {
    const dailyQuery = crawler.buildSearchQuery({ timeRange: 'daily' });
    const weeklyQuery = crawler.buildSearchQuery({ timeRange: 'weekly' });
    const monthlyQuery = crawler.buildSearchQuery({ timeRange: 'monthly' });
    
    expect(dailyQuery).toContain('created:>=');
    expect(weeklyQuery).toContain('created:>=');
    expect(monthlyQuery).toContain('created:>=');
  });
});
```

---

## 第十二章：版本控制與部署

### 12.1 Git配置

**創建 .gitignore 文件：**

```gitignore
# 依賴
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 環境變數
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日誌
logs/
*.log

# 導出文件
exports/*.csv

# 測試覆蓋率
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# 操作系統
.DS_Store
Thumbs.db

# 臨時文件
*.tmp
*.temp
```

### 12.2 主程序入口 (src/index.js)

```javascript
import GitHubCrawler from './crawlers/sources/github-crawler.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { ErrorHandler } from './utils/errors/index.js';

/**
 * 主程序入口
 * 執行GitHub爬蟲任務
 */
async function main() {
  logger.info('🚀 GitHub爬蟲系統啟動');
  
  try {
    const crawler = new GitHubCrawler();
    
    // 爬取不同語言的趨勢項目
    const languages = config.sources.github.topics;
    
    for (const language of languages) {
      try {
        logger.info(`開始爬取 ${language} 項目`);
        
        const result = await crawler.crawlTrendingRepositories({
          language,
          timeRange: 'daily',
          minStars: 10,
          maxResults: 100,
          exportCSV: true,
          uploadToSupabase: false, // 根據需要啟用
        });
        
        logger.success(`${language} 爬取完成`, {
          count: result.repositories.length,
          csvFile: result.csvFilePath,
        });
        
        // 避免API速率限制
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        ErrorHandler.handle(error, logger);
        logger.warning(`跳過 ${language} 語言的爬取`);
      }
    }
    
    logger.success('🎉 所有爬蟲任務完成');
    
  } catch (error) {
    ErrorHandler.handle(error, logger);
    logger.failure('爬蟲系統執行失敗');
    process.exit(1);
  }
}

// 處理未捕獲的異常
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未處理的Promise拒絕:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('未捕獲的異常:', error);
  process.exit(1);
});

// 優雅關閉
process.on('SIGINT', () => {
  logger.info('收到SIGINT信號，正在關閉...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信號，正在關閉...');
  process.exit(0);
});

// 執行主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;
```

### 12.3 GitHub Actions自動化配置

#### 12.3.1 權限設置

在使用GitHub Actions自動提交文件之前，需要確保工作流程有適當的權限：

1. **倉庫設置**
   - 進入你的GitHub倉庫
   - 點擊 Settings → Actions → General
   - 在 "Workflow permissions" 部分選擇 "Read and write permissions"
   - 勾選 "Allow GitHub Actions to create and approve pull requests"

2. **Secrets配置**
   - 進入 Settings → Secrets and variables → Actions
   - 添加以下secrets：
     - `GITHUB_TOKEN`：你的GitHub Personal Access Token
     - `SUPABASE_URL`：你的Supabase項目URL
     - `SUPABASE_KEY`：你的Supabase API密鑰

#### 12.3.2 工作流程文件 (.github/workflows/crawler.yml)

```yaml
name: GitHub爬蟲定時任務

on:
  schedule:
    # 每天UTC時間6點執行（台灣時間下午2點）
    - cron: '0 6 * * *'
  workflow_dispatch: # 允許手動觸發

jobs:
  crawl:
    runs-on: ubuntu-latest
    
    steps:
    - name: 檢出代碼
      uses: actions/checkout@v4
      
    - name: 設置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: 安裝依賴
      run: npm ci
      
    - name: 運行代碼檢查
      run: |
        npm run lint
        npm run format:check
        
    - name: 運行測試
      run: npm test
      
    - name: 執行爬蟲
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
      run: npm start
      
    - name: 提交CSV文件到倉庫
      run: |
        # 配置Git用戶信息
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        
        # 檢查是否有新的CSV文件
        if [ -n "$(git status --porcelain exports/)" ]; then
          # 添加所有exports目錄下的文件
          git add exports/
          
          # 提交變更
          git commit -m "🤖 自動更新GitHub趨勢數據 $(date +'%Y-%m-%d %H:%M:%S')"
          
          # 推送到倉庫
          git push
          
          echo "✅ CSV文件已成功提交到倉庫"
        else
          echo "ℹ️ 沒有新的CSV文件需要提交"
        fi
        
    - name: 上傳CSV文件作為備份
      uses: actions/upload-artifact@v4
      with:
        name: github-trending-data-backup
        path: exports/*.csv
        retention-days: 7
      if: always()

#### 12.3.3 故障排除

**常見問題與解決方案：**

1. **權限被拒絕錯誤**
   ```
   remote: Permission to user/repo.git denied
   ```
   **解決方案：**
   - 確保在倉庫設置中啟用了 "Read and write permissions"
   - 檢查GITHUB_TOKEN是否正確配置

2. **Git推送失敗**
   ```
   ! [rejected] main -> main (fetch first)
   ```
   **解決方案：**
   - 在推送前添加git pull步驟
   - 使用force push（謹慎使用）

3. **CSV文件未生成**
   **解決方案：**
   - 檢查爬蟲執行日誌
   - 確認API token有效
   - 檢查網路連接

4. **工作流程未觸發**
   **解決方案：**
   - 檢查cron表達式語法
   - 確認工作流程文件路徑正確
   - 手動觸發測試

**調試技巧：**

```yaml
# 添加調試步驟
- name: 調試信息
  run: |
    echo "當前目錄：$(pwd)"
    echo "文件列表："
    ls -la exports/
    echo "Git狀態："
    git status
```
```

---

## 總結與學習要點

### 🎯 你學到了什麼？

1. **現代JavaScript開發**
   - ES模組系統
   - async/await異步編程
   - 類和繼承
   - 錯誤處理

2. **API集成**
   - RESTful API調用
   - 認證和授權
   - 速率限制處理
   - 數據解析和處理

3. **數據處理**
   - 數據清理和驗證
   - CSV文件生成
   - 數據庫操作

4. **軟件工程實踐**
   - 組件化架構
   - 錯誤處理和日誌
   - 測試驅動開發
   - 代碼品質工具

5. **DevOps基礎**
   - 版本控制
   - CI/CD流程
   - 自動化部署

### 🚀 下一步學習建議

1. **深入學習**
   - TypeScript
   - 更多設計模式
   - 微服務架構
   - 容器化部署

2. **擴展功能**
   - 添加更多數據源
   - 實現實時數據處理
   - 構建Web界面
   - 添加數據分析功能

3. **性能優化**
   - 並發處理
   - 緩存策略
   - 數據庫優化
   - 監控和告警

### 💡 關鍵成功因素

1. **循序漸進**：從簡單開始，逐步增加複雜性
2. **實踐為主**：多寫代碼，多做項目
3. **持續學習**：技術更新快，保持學習熱忱
4. **社區參與**：參與開源項目，學習最佳實踐
5. **文檔習慣**：養成寫文檔和註釋的好習慣

---

## 附錄

### A. 常見問題解決

**Q: GitHub API速率限制怎麼辦？**
A: 使用認證token，合理設置請求間隔，實現重試機制。

**Q: 如何處理大量數據？**
A: 實現分批處理，使用流式處理，考慮數據庫分頁。

**Q: 部署到生產環境需要注意什麼？**
A: 環境變數管理，錯誤監控，日誌收集，性能監控。

### B. 推薦資源

- [Node.js官方文檔](https://nodejs.org/docs/)
- [GitHub API文檔](https://docs.github.com/en/rest)
- [Supabase文檔](https://supabase.com/docs)
- [Jest測試框架](https://jestjs.io/docs/getting-started)

---

**作者：AI助理**  
**版本：1.0**  
**更新日期：2024年**

*這本書記錄了從零開始構建現代化GitHub爬蟲系統的完整過程，希望能幫助更多年輕開發者踏上程式設計的旅程。*