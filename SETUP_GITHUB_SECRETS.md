# GitHub Secrets 設置指南

## 🔐 必要的 GitHub Secrets

您的 GitHub Actions 需要以下 Secrets 才能正常運行：

### 1. SUPABASE_URL
- **值**: `https://atczlkrosuuztfhszyin.supabase.co`
- **說明**: 您的 Supabase 專案 URL

### 2. SUPABASE_KEY
- **值**: `從您的 .env 文件中複製 SUPABASE_KEY 的值`
- **說明**: Supabase anon key

### 3. GITHUB_API_TOKEN
- **值**: `從您的 .env 文件中複製 GITHUB_TOKEN 的值`
- **說明**: GitHub Personal Access Token
- **⚠️ 注意**: 請確保使用完整的 GitHub Personal Access Token

## 📝 設置步驟

### 步驟 1: 前往 GitHub Secrets 設置頁面
1. 打開您的 GitHub 倉庫: `https://github.com/jason660519/Global-AI-Information-Platform-Open-Project`
2. 點擊 **Settings** 標籤
3. 在左側選單中點擊 **Secrets and variables** → **Actions**

### 步驟 2: 添加 Repository Secrets
對於每個 Secret：
1. 點擊 **New repository secret** 按鈕
2. 在 **Name** 欄位輸入 Secret 名稱（如 `SUPABASE_URL`）
3. 在 **Secret** 欄位輸入對應的值
4. 點擊 **Add secret**

### 步驟 3: 驗證 Actions 權限
1. 在 Settings 頁面，點擊 **Actions** → **General**
2. 確保 **Actions permissions** 設置為：
   - ✅ "Allow all actions and reusable workflows"
3. 確保 **Workflow permissions** 設置為：
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"

## 🧪 測試設置

### 手動觸發 Actions
1. 前往 **Actions** 標籤
2. 選擇 "GitHub Repository Crawler" workflow
3. 點擊 **Run workflow** 按鈕
4. 保持預設設置，點擊 **Run workflow**

### 檢查執行結果
- 如果成功：您會看到綠色的勾號，並且 `exports/` 資料夾會有新的 CSV 文件
- 如果失敗：點擊失敗的執行，查看錯誤日誌

## 🔍 常見問題

### Q: Actions 沒有自動執行
**A**: 檢查以下項目：
- Secrets 是否正確設置
- Actions 權限是否正確
- 是否在 main 分支上
- 工作流程文件是否存在於 `.github/workflows/` 目錄

### Q: GitHub Token 無效
**A**: 重新生成 GitHub Personal Access Token：
1. 前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 生成新的 token，確保包含以下權限：
   - `repo` (完整倉庫權限)
   - `workflow` (工作流程權限)

### Q: Supabase 連接失敗
**A**: 檢查：
- Supabase URL 是否正確
- Supabase Key 是否有效
- 資料庫 RLS 政策是否正確設置

## 📊 預期結果

設置完成後，您的 GitHub Actions 將：
- ⏰ 每 2 小時自動執行一次
- 📊 爬取約 200 個 GitHub 倉庫資料
- 💾 生成 CSV 文件並保存到 `exports/` 目錄
- 🔄 自動提交並推送到 Git 倉庫
- 📤 上傳資料到 Supabase 資料庫

## 🆘 需要幫助？

如果遇到問題，請：
1. 運行診斷工具：`npm run diagnose`
2. 查看 Actions 執行日誌
3. 檢查 [GITHUB_ACTIONS_TROUBLESHOOTING.md](./GITHUB_ACTIONS_TROUBLESHOOTING.md)