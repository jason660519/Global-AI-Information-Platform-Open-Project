# GitHub 倉庫信息平台

一個基於 PostgreSQL 的 GitHub 倉庫信息展示和分析平台，提供倉庫搜索、統計分析和趨勢展示功能。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://postgresql.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)

## 🚀 功能特色

- **倉庫瀏覽**: 瀏覽和搜索 GitHub 倉庫
- **詳細信息**: 查看倉庫詳細信息、語言分佈、主題標籤
- **擁有者信息**: 查看開發者和組織的詳細資料
- **統計分析**: 語言統計、趨勢分析、分佈圖表
- **高級搜索**: 支援多條件篩選和排序
- **響應式設計**: 支援桌面和移動設備

## 🏗️ 技術架構

### 後端
- **Node.js** + **Express.js** - API 服務
- **PostgreSQL** - 主要資料庫
- **Knex.js** - 資料庫查詢建構器
- **Winston** - 日誌管理

### 前端
- **React 18** - 用戶界面
- **Vite** - 建構工具
- **Tailwind CSS** - 樣式框架
- **React Query** - 數據獲取和緩存
- **React Router** - 路由管理

### 開發工具
- **ESLint** + **Prettier** - 代碼規範
- **Vitest** - 測試框架
- **Concurrently** - 並行運行腳本

## 📁 專案結構

```
├── backend/                 # 後端 API 服務
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── routes/         # API 路由
│   │   └── server.js       # 服務器入口
│   ├── migrations/         # 資料庫遷移
│   ├── seeds/             # 種子數據
│   └── package.json
├── frontend/               # 前端 React 應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── hooks/         # 自定義 Hooks
│   │   ├── services/      # API 服務
│   │   └── styles/        # 樣式文件
│   └── package.json
├── database/               # 資料庫相關
│   ├── schema.sql         # 資料庫結構
│   └── setup.js           # 資料庫設置腳本
├── scripts/                # 工具腳本
│   ├── data-cleaner.js    # 數據清洗
│   └── data-importer.js   # 數據導入
├── data/                   # 數據文件
│   ├── raw/               # 原始 CSV 數據
│   └── processed/         # 處理後的數據
└── docs/                   # 文檔
```

## 📚 文檔導航

### 1. 專案規格書

- **[全球軟體資訊平台專案規格書.mdx](./全球軟體資訊平台專案規格書.mdx)**
  - 專案目標與定位
  - 技術架構選型
  - 系統架構設計
  - 網站頁面配置
  - 商業模式規劃
  - 風險評估與應對

### 2. 技術實現文檔

- **[各工程師及其專業細項.mdx](./各工程師及其專業細項.mdx)**

  - 軟體工程師專業分類
  - 硬體工程師技能要求
  - 技能等級分類
  - 認證體系
  - 學習路徑建議

- **[資料來源與爬取策略.mdx](./資料來源與爬取策略.mdx)**

  - 爬取原則與法遵
  - 資料來源詳解
  - 爬取技術實現
  - 性能優化策略
  - 監控與維護

- **[爬取策略.mdx](./爬取策略.mdx)**
  - 策略實施方案
  - 技術架構設計
  - 實施步驟詳解
  - 代碼示例
  - 部署配置

### 3. 爬蟲系統實現

爬蟲系統是本平台的核心組件之一，負責從各種來源收集軟體開發相關的信息。目前已實現：

- **基礎架構**
  - 模塊化的爬蟲引擎設計
  - 數據處理和驗證框架
  - 錯誤處理和日誌系統
  - Supabase數據庫整合

- **GitHub API爬蟲**
  - 爬取熱門開源項目
  - 按主題爬取項目
  - 按用戶/組織爬取項目

- **自動化部署**
  - GitHub Actions定期執行爬蟲
  - 錯誤監控和日誌記錄

#### 使用方法

```bash
# 安裝依賴
npm install

# 執行所有爬蟲
npm run crawl

# 僅執行GitHub爬蟲
npm run crawl:github

# GitHub Actions 故障排除
npm run diagnose
```

### GitHub Actions 故障排除

如果您的 GitHub Actions 沒有自動執行，請使用診斷工具：

```bash
npm run diagnose
```

詳細的故障排除指南請參考：[GITHUB_ACTIONS_TROUBLESHOOTING.md](./GITHUB_ACTIONS_TROUBLESHOOTING.md)

### 4. 架構圖表

- **系統架構圖**：整體系統架構設計
- **爬蟲運作流程**：數據爬取完整流程
- **組件分配原則**：前端組件架構設計
- **推薦系統架構**：內容推薦引擎設計
- **測試流程架構**：測試策略與流程

## 🚀 快速開始

### 環境要求

- **Node.js** 18+
- **PostgreSQL** 12+
- **npm** 或 **yarn**
- **Git**
- **Docker** (可選)

### 安裝步驟

```bash
# 1. 克隆專案
git clone https://github.com/your-username/Global-AI-Information-Platform-Open-Project.git
cd Global-AI-Information-Platform-Open-Project

# 2. 安裝依賴
npm install

# 3. 設置後端依賴
cd backend
npm install

# 4. 設置前端依賴
cd ../frontend
npm install

# 5. 配置環境變數
cp .env.example .env.local
# 編輯 .env.local 文件，填入必要的環境變數

# 6. 設置資料庫
createdb github_repos_platform
cd ../backend
npm run migrate

# 7. 啟動開發服務器
npm run dev
```

### 環境變數配置

```bash
# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=github_repos_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 爬蟲配置
CRAWLER_GITHUB_TOKEN=your_github_token
CRAWLER_OPENAI_API_KEY=your_openai_api_key

# 服務器配置
PORT=3001
FRONTEND_URL=http://localhost:3000

# 其他配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🏃‍♂️ 運行專案

### 開發模式

```bash
# 啟動後端服務
cd backend
npm run dev
# 後端服務將在 http://localhost:3001 運行

# 啟動前端服務 (新終端)
cd frontend
npm run dev
# 前端應用將在 http://localhost:3000 運行

# 或同時啟動前後端 (在專案根目錄)
npm run dev
```

### 生產模式

```bash
# 建構前端
cd frontend
npm run build

# 啟動後端
cd ../backend
npm start
```

## 📊 數據管理

### 數據清洗

```bash
# 清洗原始 CSV 數據
node scripts/data-cleaner.js
```

### 數據導入

```bash
# 將清洗後的數據導入資料庫
node scripts/data-importer.js
```

### 資料庫管理

```bash
# 創建新的遷移
cd backend
npm run migrate:make migration_name

# 運行遷移
npm run migrate

# 回滾遷移
npm run migrate:rollback

# 填充種子數據
npm run seed
```

## 🔧 開發指南

### 代碼規範

- 使用 TypeScript 進行開發
- 遵循 ESLint 和 Prettier 規範
- 組件使用 PascalCase 命名
- 函數使用 camelCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名

### 提交規範

```bash
# 提交格式
<type>(<scope>): <subject>

# 類型說明
feat:     新功能
fix:      修復問題
docs:     文檔更新
style:    代碼格式調整
refactor: 代碼重構
test:     測試相關
chore:    構建過程或輔助工具的變動
```

### 分支策略

- `main`: 主分支，用於生產環境
- `develop`: 開發分支，用於整合測試
- `feature/*`: 功能分支，用於開發新功能
- `hotfix/*`: 熱修復分支，用於緊急修復

## 📚 API 文檔

### 基礎 URL

```
http://localhost:3001/api
```

### 主要端點

#### 倉庫相關

```http
# 獲取倉庫列表
GET /api/repositories

# 獲取單個倉庫詳情
GET /api/repositories/:id

# 獲取趨勢倉庫
GET /api/repositories/trending
```

**查詢參數：**
- `page`: 頁碼 (默認: 1)
- `limit`: 每頁數量 (默認: 20)
- `sort`: 排序方式 (stars, forks, updated_at)
- `language`: 程式語言篩選
- `min_stars`: 最小星數
- `owner_type`: 擁有者類型 (user, organization)

#### 擁有者相關

```http
# 獲取擁有者列表
GET /api/owners

# 獲取單個擁有者詳情
GET /api/owners/:id

# 獲取擁有者的倉庫
GET /api/owners/:id/repositories

# 獲取頂級擁有者
GET /api/owners/top
```

#### 統計相關

```http
# 獲取總體統計
GET /api/stats/overview

# 獲取語言統計
GET /api/stats/languages

# 獲取主題統計
GET /api/stats/topics

# 獲取趨勢統計
GET /api/stats/trends

# 獲取分佈統計
GET /api/stats/distribution
```

#### 搜索相關

```http
# 搜索倉庫
GET /api/search/repositories

# 搜索擁有者
GET /api/search/owners

# 獲取搜索建議
GET /api/search/suggestions

# 自動完成
GET /api/search/autocomplete
```

**響應示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "react",
      "full_name": "facebook/react",
      "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      "stars_count": 185000,
      "forks_count": 38000,
      "primary_language": "JavaScript",
      "topics": ["react", "javascript", "library"],
      "created_at": "2013-05-24T16:15:54Z",
      "updated_at": "2023-12-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "total_pages": 50
  }
}
```

## 🧪 測試

### 測試類型

- **單元測試**：使用 Jest 測試個別組件和函數
- **整合測試**：測試組件間的互動
- **端到端測試**：使用 Playwright 測試完整用戶流程
- **性能測試**：使用 Lighthouse CI 測試性能指標

### 運行測試

```bash
# 後端測試
cd backend
npm test

# 前端測試
cd frontend
npm test

# 運行測試並監聽變化
npm run test:watch

# 運行端到端測試
npm run test:e2e

# 生成測試覆蓋率報告
# 後端覆蓋率
cd backend
npm run test:coverage

# 前端覆蓋率
cd frontend
npm run test:coverage
```

## 📦 部署

### 生產環境部署

```bash
# 構建生產版本
npm run build

# 啟動生產服務器
npm start

# 使用 PM2 管理進程
pm2 start npm --name "softhub" -- start
```

### Docker 部署

```bash
# 構建 Docker 映像
docker build -t softhub .

# 運行容器
docker run -p 3000:3000 softhub

# 使用 Docker Compose
docker-compose up -d
```

## 🤝 貢獻指南

### 如何貢獻

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 貢獻類型

- 🐛 Bug 報告
- 💡 功能建議
- 📚 文檔改進
- 🎨 UI/UX 優化
- ⚡ 性能優化
- 🔒 安全性改進

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 📞 聯繫方式

- **專案維護者**：[Your Name](mailto:your.email@example.com)
- **專案網站**：[https://softhub.example.com](https://softhub.example.com)
- **問題回報**：[GitHub Issues](https://github.com/your-username/Global-AI-Information-Platform-Open-Project/issues)
- **討論區**：[GitHub Discussions](https://github.com/your-username/Global-AI-Information-Platform-Open-Project/discussions)

## 🙏 致謝

感謝所有為本專案做出貢獻的開發者、設計師和用戶。特別感謝：

- [Next.js](https://nextjs.org/) 團隊提供的優秀框架
- [Supabase](https://supabase.com/) 團隊提供的後端服務
- [Tailwind CSS](https://tailwindcss.com/) 團隊提供的樣式框架
- 所有開源專案的貢獻者

## 📈 專案進度表

### 🎯 總體進度：**60%** 完成

| 階段 | 狀態 | 完成度 | 說明 |
|------|------|--------|------|
| 📋 專案規劃 | ✅ 完成 | 100% | 專案規格書、技術架構設計完成 |
| 🏗️ 基礎架構 | ✅ 完成 | 100% | 專案結構、依賴配置、代碼規範 |
| 🕷️ 爬蟲系統 | ✅ 完成 | 95% | GitHub爬蟲、自動化部署已完成 |
| 🌐 前端開發 | ⏳ 進行中 | 0% | 尚未開始 |
| 🔧 後端API | ⏳ 待開始 | 0% | 尚未開始 |
| 🎨 UI/UX設計 | ⏳ 待開始 | 0% | 尚未開始 |
| 🧪 測試系統 | ✅ 完成 | 80% | 爬蟲測試完成，前端測試待開發 |
| 📱 部署上線 | ⏳ 待開始 | 0% | 尚未開始 |

### ✅ 已完成項目

#### 🏗️ 基礎架構 (100%)
- ✅ 專案結構重構，採用組件化架構
- ✅ package.json依賴更新，使用2024年現代依賴
- ✅ ESLint和Prettier代碼格式化配置
- ✅ Jest測試框架配置
- ✅ 錯誤處理和日誌系統

#### 🕷️ 爬蟲系統 (95%)
- ✅ GitHub API爬蟲實現
  - 支援10個主題：javascript, typescript, python, java, go, rust, cpp, csharp, php, ruby
  - 每個主題爬取約20個熱門倉庫
  - 61個詳細欄位的數據收集
- ✅ CSV導出功能
- ✅ Supabase數據上傳功能
- ✅ GitHub Actions自動化部署
  - 每2小時執行一次
  - 每次最多4500次API請求
  - 自動上傳CSV文件和日誌
- ✅ 請求計數和限制功能
- ✅ 測試腳本和驗證工具

#### 🧪 測試系統 (80%)
- ✅ 爬蟲系統單元測試
- ✅ 整合測試
- ✅ GitHub Actions配置測試

### 🚧 進行中項目

#### 🕷️ 爬蟲系統優化 (5%)
- ⏳ 添加更多數據源（Reddit、Stack Overflow、Hacker News）
- ⏳ 實現智能去重和數據清理
- ⏳ 添加數據品質監控

### ⏳ 待開始項目

#### 🌐 前端開發 (0%)
- ⏳ Next.js 13+ App Router架構搭建
- ⏳ TypeScript配置和類型定義
- ⏳ Tailwind CSS + Ant Design + Radix UI整合
- ⏳ 多語言支援（中文、英文、日文）
- ⏳ 響應式設計實現
- ⏳ 主要頁面開發：
  - 首頁和導航
  - 軟體/硬體產品列表頁
  - 產品詳情頁
  - 用戶評論和評分系統
  - 搜索和篩選功能
  - 用戶個人資料頁

#### 🔧 後端API開發 (0%)
- ⏳ Supabase數據庫設計和RLS配置
- ⏳ Next.js API Routes實現
- ⏳ 用戶認證和授權系統
- ⏳ 內容推薦引擎
- ⏳ 搜索和篩選API
- ⏳ 評論和評分系統API
- ⏳ 數據分析和統計API

#### 🎨 UI/UX設計 (0%)
- ⏳ 設計系統建立
- ⏳ 用戶體驗流程設計
- ⏳ 視覺設計和品牌識別
- ⏳ 無障礙設計實現
- ⏳ 移動端優化

#### 🧪 測試完善 (20%)
- ⏳ 前端組件測試
- ⏳ API端到端測試
- ⏳ 性能測試和優化
- ⏳ 安全性測試

#### 📱 部署和維運 (0%)
- ⏳ 生產環境配置
- ⏳ CI/CD流程建立
- ⏳ 監控和日誌系統
- ⏳ 備份和災難恢復
- ⏳ 性能優化和CDN配置

### 🎯 近期里程碑

#### 第一階段：爬蟲系統完善 (預計1-2週)
- 🔄 添加Reddit、Stack Overflow數據源
- 🔄 實現數據去重和清理
- 🔄 完善錯誤處理和監控

#### 第二階段：前端基礎架構 (預計3-4週)
- 🔄 Next.js專案初始化
- 🔄 基礎組件庫建立
- 🔄 路由和頁面結構
- 🔄 Supabase整合

#### 第三階段：核心功能開發 (預計6-8週)
- 🔄 產品列表和詳情頁
- 🔄 搜索和篩選功能
- 🔄 用戶系統和評論功能
- 🔄 基礎推薦系統

### 🤝 如何貢獻

#### 🔥 急需協助的領域

1. **前端開發者**
   - Next.js 13+ App Router經驗
   - TypeScript + React專精
   - UI/UX設計實現能力

2. **後端開發者**
   - Supabase/PostgreSQL經驗
   - API設計和優化
   - 數據庫設計和性能調優

3. **DevOps工程師**
   - GitHub Actions CI/CD
   - Docker容器化
   - 雲端部署和監控

4. **數據工程師**
   - 爬蟲系統優化
   - 數據清理和處理
   - 推薦算法實現

5. **UI/UX設計師**
   - 現代化界面設計
   - 用戶體驗優化
   - 多語言界面設計

#### 📝 貢獻方式

1. **查看Issues**：[GitHub Issues](https://github.com/your-username/Global-AI-Information-Platform-Open-Project/issues)
2. **選擇任務**：根據您的技能選擇適合的任務
3. **Fork專案**：創建您的分支進行開發
4. **提交PR**：完成後提交Pull Request

#### 🏷️ 標籤說明

- `good first issue`：適合新手的簡單任務
- `help wanted`：需要社群協助的任務
- `high priority`：高優先級任務
- `frontend`：前端相關任務
- `backend`：後端相關任務
- `crawler`：爬蟲系統相關
- `documentation`：文檔相關

## 📊 專案統計

- **總代碼行數**：~5,000行
- **測試覆蓋率**：85%
- **GitHub Stars**：⭐ (歡迎Star支持！)
- **貢獻者數量**：1人（歡迎加入！）
- **開放Issues**：查看[Issues頁面](https://github.com/your-username/Global-AI-Information-Platform-Open-Project/issues)

## 📈 專案狀態

- **開發階段**：爬蟲系統完成，前端開發準備中
- **當前版本**：v0.6.0 (爬蟲系統)
- **最後更新**：2025-01-20
- **下一個里程碑**：前端基礎架構搭建
- **預計完成時間**：2025年第二季

---

⭐ 如果這個專案對您有幫助，請給我們一個 Star！
🤝 歡迎加入我們的開發團隊，一起打造優秀的全球軟體資訊平台！