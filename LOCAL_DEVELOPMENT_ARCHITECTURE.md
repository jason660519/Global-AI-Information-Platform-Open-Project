# 本地開發架構設計

## 專案概述

本專案採用本地優先的開發策略，使用 PostgreSQL 作為本地資料庫，完整的數據處理流程如下：

```
GitHub API → CSV 原始數據 → 數據清洗 → PostgreSQL → Express API → React 前端
```

## 專案結構

```
project/
├── data/                     # 數據目錄
│   ├── raw/                 # CSV 原始數據
│   ├── processed/           # 清洗後數據
│   └── backups/             # 資料庫備份
├── database/                # 資料庫相關
│   ├── migrations/          # 資料庫遷移腳本
│   ├── seeds/              # 初始數據
│   └── schema.sql          # 資料庫結構
├── scripts/                 # 工具腳本
│   ├── data-cleaner.js     # 數據清洗
│   ├── data-importer.js    # 數據匯入
│   └── backup.js           # 備份腳本
├── backend/                 # 後端 API
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 數據模型
│   │   ├── routes/         # 路由
│   │   └── config/         # 配置
│   └── package.json
├── frontend/                # 前端應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/          # 頁面
│   │   └── services/       # API 服務
│   └── package.json
└── docs/                    # 文檔
```

## 技術棧

### 資料庫
- **PostgreSQL 16+** - 主要資料庫
- **pg** - Node.js PostgreSQL 客戶端
- **Knex.js** - SQL 查詢建構器和遷移工具

### 後端
- **Node.js 18+** - 運行環境
- **Express.js** - Web 框架
- **cors** - 跨域支援
- **helmet** - 安全中間件
- **winston** - 日誌系統

### 前端
- **React 18** - 前端框架
- **Vite** - 建構工具
- **Tailwind CSS** - 樣式框架
- **Axios** - HTTP 客戶端

### 開發工具
- **nodemon** - 開發時自動重啟
- **concurrently** - 同時運行多個命令
- **ESLint** - 代碼檢查
- **Prettier** - 代碼格式化

## 開發流程

### 1. 環境設置
```bash
# 安裝 PostgreSQL
# Windows: 下載官方安裝包
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# 創建資料庫
psql -U postgres
CREATE DATABASE github_repos_dev;
```

### 2. 數據處理流程
```bash
# 1. 爬取數據（已有）
node src/index.js

# 2. 清洗數據
node scripts/data-cleaner.js

# 3. 匯入資料庫
node scripts/data-importer.js
```

### 3. 開發服務
```bash
# 啟動後端 API
cd backend && npm run dev

# 啟動前端開發服務器
cd frontend && npm run dev

# 或同時啟動
npm run dev:all
```

## 資料庫設計

### 主要表格

#### repositories
```sql
CREATE TABLE repositories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    html_url VARCHAR(500) NOT NULL,
    clone_url VARCHAR(500),
    ssh_url VARCHAR(500),
    language VARCHAR(100),
    stargazers_count INTEGER DEFAULT 0,
    watchers_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    open_issues_count INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    default_branch VARCHAR(100),
    is_private BOOLEAN DEFAULT false,
    is_fork BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_disabled BOOLEAN DEFAULT false,
    has_issues BOOLEAN DEFAULT true,
    has_projects BOOLEAN DEFAULT true,
    has_wiki BOOLEAN DEFAULT true,
    has_pages BOOLEAN DEFAULT false,
    has_downloads BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    pushed_at TIMESTAMP,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_language (language),
    INDEX idx_stars (stargazers_count),
    INDEX idx_created (created_at),
    INDEX idx_updated (updated_at)
);
```

#### owners
```sql
CREATE TABLE owners (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    github_id INTEGER UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    html_url VARCHAR(500),
    type VARCHAR(50), -- User or Organization
    site_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### repository_owners (關聯表)
```sql
CREATE TABLE repository_owners (
    repository_id INTEGER REFERENCES repositories(id),
    owner_id INTEGER REFERENCES owners(id),
    PRIMARY KEY (repository_id, owner_id)
);
```

## API 設計

### 端點規劃

```
GET /api/repositories          # 獲取倉庫列表（分頁、篩選、排序）
GET /api/repositories/:id      # 獲取單個倉庫詳情
GET /api/repositories/search   # 搜索倉庫
GET /api/statistics           # 獲取統計數據
GET /api/languages            # 獲取程式語言列表
GET /api/trending             # 獲取趨勢倉庫
```

### 查詢參數
```
?page=1&limit=20              # 分頁
?language=javascript          # 按語言篩選
?sort=stars&order=desc        # 排序
?q=react                      # 搜索關鍵字
?min_stars=100               # 最小星數
?created_after=2023-01-01    # 創建時間篩選
```

## 部署策略

### 本地開發階段
1. 使用本地 PostgreSQL
2. 開發完整功能
3. 性能優化
4. 測試覆蓋

### 雲端部署階段
1. 數據遷移到雲端資料庫
2. 環境變數配置
3. Docker 容器化
4. CI/CD 流程設置

## 優勢

1. **成本控制** - 初期無雲端費用
2. **開發效率** - 本地環境響應快
3. **數據安全** - 敏感數據本地處理
4. **靈活調整** - 易於修改結構
5. **完整測試** - 本地環境便於測試

## 下一步

1. 設置 PostgreSQL 本地環境
2. 創建數據清洗腳本
3. 建立資料庫 schema
4. 開發 API 服務
5. 建構前端界面