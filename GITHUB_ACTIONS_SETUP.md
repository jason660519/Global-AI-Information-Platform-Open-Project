# GitHub Actions 自動化爬蟲設置指南

## 🚀 概述

本項目已配置為使用 GitHub Actions 每2小時自動執行一次 GitHub 爬蟲，每次執行最多4500次API請求，完全符合 GitHub API 的速率限制（每小時5000次）。

## ⚙️ 設置步驟

### 1. 配置 GitHub Secrets

在您的 GitHub 倉庫中設置以下 Secrets：

1. 進入倉庫 → Settings → Secrets and variables → Actions
2. 點擊 "New repository secret" 並添加以下secrets：

```
GITHUB_API_TOKEN=your_github_personal_access_token
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### 2. GitHub Personal Access Token 設置

1. 前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 點擊 "Generate new token (classic)"
3. 設置以下權限：
   - `public_repo` - 訪問公共倉庫
   - `read:org` - 讀取組織信息
   - `read:user` - 讀取用戶信息
4. 複製生成的 token 並添加到 `GITHUB_API_TOKEN` secret

### 3. Supabase 設置

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目
3. 前往 Settings → API
4. 複製 "Project URL" 到 `SUPABASE_URL`
5. 複製 "anon public" key 到 `SUPABASE_KEY`

## 📅 執行排程

### 自動執行
- **頻率**: 每2小時執行一次
- **時間**: 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00 (UTC)
- **每次請求數**: 4500次
- **每日總請求數**: 54,000次（遠低於120,000次的每日限制）

### 手動執行
1. 前往 Actions 頁面
2. 選擇 "GitHub Crawler Automation" workflow
3. 點擊 "Run workflow"
4. 可選擇自定義最大請求次數（預設4500）

## 📊 數據輸出

### CSV 檔案
- 自動生成的 CSV 檔案會上傳為 GitHub Actions artifacts
- 檔案保留30天
- 成功執行後會自動提交到倉庫的 `exports/` 目錄

### 日誌檔案
- 執行日誌會上傳為 artifacts
- 日誌保留7天
- 包含詳細的執行信息和錯誤報告

## 🔍 監控和故障排除

### 檢查執行狀態
1. 前往 Actions 頁面
2. 查看最近的 workflow 執行
3. 點擊具體的執行來查看詳細日誌

### 常見問題

**Q: API 請求失敗怎麼辦？**
A: 檢查 GitHub token 是否有效，確認沒有超過速率限制

**Q: Supabase 上傳失敗？**
A: 確認 Supabase URL 和 Key 正確，檢查數據庫表結構

**Q: 如何調整執行頻率？**
A: 修改 `.github/workflows/crawler.yml` 中的 cron 表達式

**Q: 如何增加請求數量？**
A: 手動執行時可以設置更高的數值，或修改環境變量 `MAX_REQUESTS`

## 📈 API 使用統計

### 速率限制
- **認證用戶限制**: 5,000 requests/hour
- **每次執行**: 4,500 requests (90% 利用率)
- **每日執行**: 12次
- **每日總請求**: 54,000 requests
- **每日限制**: 120,000 requests (45% 利用率)

### 數據收集範圍
- **涵蓋主題**: JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#, PHP, Ruby
- **數據欄位**: 61個完整的 repository 欄位
- **數據格式**: CSV 格式，便於分析和處理

## 🛠️ 自定義配置

### 修改爬取主題
編輯 `src/config/index.js` 中的 `topics` 陣列：

```javascript
topics: [
  'javascript',
  'python',
  'your-custom-topic',
  // 添加更多主題
]
```

### 調整請求數量
修改 `.github/workflows/crawler.yml` 中的預設值：

```yaml
default: '4500'  # 改為您想要的數值
```

## 🔒 安全注意事項

1. **永遠不要**將 API tokens 直接寫在代碼中
2. 定期輪換 GitHub Personal Access Token
3. 監控 API 使用量，避免超過限制
4. 確保 Supabase RLS (Row Level Security) 正確配置

## 📞 支援

如果遇到問題，請：
1. 檢查 Actions 執行日誌
2. 確認所有 secrets 正確設置
3. 查看 GitHub API 狀態頁面
4. 檢查 Supabase 服務狀態

---

**注意**: 此設置確保您的爬蟲可以24/7運行，無需保持本地電腦開機，完全利用 GitHub 的免費 Actions 服務！