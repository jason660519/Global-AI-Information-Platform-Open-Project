# GitHub Actions 故障排除指南

## 🚨 問題：GitHub Actions 沒有定時執行

根據診斷結果，您的 GitHub Actions 配置文件是正確的，但可能存在以下問題：

## 📋 檢查清單

### 1. ✅ 已確認正確的配置
- [x] 工作流程文件存在且配置正確
- [x] Cron 排程設置為每2小時執行一次
- [x] 所有必要的依賴已安裝
- [x] 專案文件結構正確

### 2. ❓ 需要檢查的項目

#### A. GitHub 倉庫 Secrets 設置

**步驟：**
1. 前往您的 GitHub 倉庫：`https://github.com/jason660519/Global-AI-Information-Platform-Open-Project`
2. 點擊 **Settings** 標籤
3. 在左側選單中點擊 **Secrets and variables** → **Actions**
4. 確保設置了以下 Repository secrets：

| Secret 名稱 | 說明 | 如何獲取 |
|------------|------|----------|
| `SUPABASE_URL` | Supabase 專案 URL | 從 Supabase Dashboard → Settings → API |
| `SUPABASE_KEY` | Supabase anon/public key | 從 Supabase Dashboard → Settings → API |
| `GITHUB_API_TOKEN` | GitHub Personal Access Token | 從 GitHub Settings → Developer settings → Personal access tokens |

**如何創建 GitHub Personal Access Token：**
1. 前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 點擊 "Generate new token (classic)"
3. 設置以下權限：
   - `repo` (完整倉庫權限)
   - `workflow` (工作流程權限)
4. 複製生成的 token 並添加到 Secrets 中

#### B. GitHub Actions 權限設置

**步驟：**
1. 前往倉庫 **Settings** → **Actions** → **General**
2. 確保以下設置：

**Actions permissions:**
- ✅ 選擇 "Allow all actions and reusable workflows"

**Workflow permissions:**
- ✅ 選擇 "Read and write permissions"
- ✅ 勾選 "Allow GitHub Actions to create and approve pull requests"

#### C. 檢查分支設置

**確認事項：**
- 工作流程文件 `.github/workflows/crawler.yml` 必須在預設分支（通常是 `main` 或 `master`）
- GitHub Actions 的排程任務只會在預設分支上執行

#### D. 手動測試 Actions

**步驟：**
1. 前往 `https://github.com/jason660519/Global-AI-Information-Platform-Open-Project/actions`
2. 點擊 "GitHub Crawler Automation" 工作流程
3. 點擊 "Run workflow" 按鈕
4. 保持預設設置，點擊 "Run workflow"
5. 觀察執行結果和日誌

## 🔍 常見問題和解決方案

### 問題 1: Actions 頁面顯示 "No workflows"
**解決方案：**
- 確保 `.github/workflows/crawler.yml` 文件在預設分支上
- 檢查 YAML 語法是否正確
- 推送最新變更到 GitHub

### 問題 2: 工作流程執行失敗
**解決方案：**
- 檢查 Actions 日誌中的錯誤訊息
- 確認所有 Secrets 都已正確設置
- 檢查 API token 權限是否足夠

### 問題 3: 排程任務沒有自動執行
**解決方案：**
- GitHub Actions 的 cron 排程可能有延遲（最多15分鐘）
- 確保倉庫有足夠的活動（GitHub 可能暫停不活躍倉庫的排程任務）
- 手動觸發一次工作流程來激活排程

### 問題 4: Secrets 設置後仍然失敗
**解決方案：**
- 檢查 Secret 名稱是否完全匹配（區分大小寫）
- 確認 Secret 值沒有多餘的空格或換行符
- 重新生成並設置 API tokens

## 📊 驗證設置

運行以下命令來驗證本地配置：
```bash
node diagnose-github-actions.cjs
```

## 🆘 如果問題仍然存在

1. **檢查 GitHub Status：** https://www.githubstatus.com/
2. **查看 Actions 使用限制：** 確保沒有超過 GitHub Actions 的使用配額
3. **聯繫支援：** 在倉庫中創建 Issue 描述具體問題

## 📈 預期行為

設置正確後，您應該看到：
- 每2小時自動執行一次爬蟲
- 在 `exports/` 目錄中生成新的 CSV 文件
- CSV 文件自動提交到 Git 倉庫
- Actions 頁面顯示成功的工作流程執行記錄

## 🔗 相關資源

- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [GitHub Secrets 設置指南](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase API 設置](https://supabase.com/docs/guides/api)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

**最後更新：** 2025年1月
**版本：** 1.0
**狀態：** 活躍維護