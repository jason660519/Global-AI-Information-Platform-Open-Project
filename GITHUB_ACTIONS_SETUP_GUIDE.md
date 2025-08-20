# GitHub Actions 自動化配置指南

## 概述

本指南將幫助你設置GitHub Actions自動化工作流程，讓GitHub爬蟲系統能夠定期執行並自動將爬取的CSV文件提交到倉庫。

## 🚀 快速開始

### 步驟1：設置倉庫權限

1. **進入倉庫設置**
   - 打開你的GitHub倉庫
   - 點擊 `Settings` 標籤

2. **配置Actions權限**
   - 在左側選單中點擊 `Actions` → `General`
   - 在 "Workflow permissions" 部分：
     - 選擇 `Read and write permissions`
     - 勾選 `Allow GitHub Actions to create and approve pull requests`
   - 點擊 `Save` 保存設置

### 步驟2：配置Secrets

1. **進入Secrets設置**
   - 在倉庫設置中，點擊 `Secrets and variables` → `Actions`

2. **添加必要的Secrets**
   點擊 `New repository secret` 並添加以下secrets：

   | Secret名稱 | 描述 | 獲取方式 |
   |-----------|------|----------|
   | `AI_INFORMATION_PLATFORMAPI_TOKEN` | GitHub Personal Access Token | [創建GitHub Token](#創建github-token) |
   | `SUPABASE_URL` | Supabase項目URL | Supabase控制台 → Settings → API |
   | `SUPABASE_KEY` | Supabase API密鑰 | Supabase控制台 → Settings → API |

### 步驟3：創建GitHub Token

1. **進入GitHub設置**
   - 點擊右上角頭像 → `Settings`
   - 在左側選單中點擊 `Developer settings`
   - 點擊 `Personal access tokens` → `Tokens (classic)`

2. **生成新Token**
   - 點擊 `Generate new token` → `Generate new token (classic)`
   - 設置Token名稱：`AI Information Platform API`
   - 選擇過期時間：建議選擇 `No expiration`
   - 選擇權限範圍：
     - ✅ `repo` (完整倉庫權限)
     - ✅ `workflow` (工作流程權限)
     - ✅ `read:user` (讀取用戶信息)
   - 點擊 `Generate token`
   - **重要：立即複製token並保存，它只會顯示一次！**

### 步驟4：驗證配置

1. **手動觸發工作流程**
   - 進入倉庫的 `Actions` 標籤
   - 選擇 `GitHub Crawler Automation` 工作流程
   - 點擊 `Run workflow` → `Run workflow`

2. **檢查執行結果**
   - 等待工作流程完成（約5-10分鐘）
   - 檢查是否有新的CSV文件出現在 `exports/` 目錄
   - 查看工作流程日誌確認沒有錯誤

## 📋 工作流程說明

### 執行時間
- **自動執行**：每天UTC時間6點（台灣時間下午2點）
- **手動執行**：隨時可以在Actions頁面手動觸發

### 執行步驟
1. 檢出代碼
2. 設置Node.js環境
3. 安裝依賴包
4. 創建日誌目錄
5. 執行GitHub爬蟲
6. 上傳CSV文件作為備份
7. 上傳日誌文件
8. 提交CSV文件到倉庫

### 輸出文件
- **CSV文件**：保存在 `exports/` 目錄
- **日誌文件**：保存在 `logs/` 目錄
- **Artifacts**：GitHub Actions中的備份文件

## 🔧 故障排除

### 常見錯誤及解決方案

#### 1. 權限被拒絕
```
remote: Permission to user/repo.git denied
```
**解決方案：**
- 確認倉庫設置中啟用了 "Read and write permissions"
- 檢查 `AI_INFORMATION_PLATFORMAPI_TOKEN` 是否正確配置
- 確認Token有足夠的權限範圍

#### 2. Secrets未找到
```
Error: Input required and not supplied: GITHUB_TOKEN
```
**解決方案：**
- 檢查所有必要的Secrets是否已正確添加
- 確認Secret名稱拼寫正確
- 重新生成並更新過期的Token

#### 3. 爬蟲執行失敗
```
Request failed with status code 422
```
**解決方案：**
- 檢查GitHub API Token是否有效
- 確認網路連接正常
- 查看詳細錯誤日誌

#### 4. CSV文件未生成
**解決方案：**
- 檢查爬蟲執行日誌
- 確認API請求成功
- 檢查exports目錄權限

### 調試技巧

1. **查看詳細日誌**
   - 在Actions頁面點擊失敗的工作流程
   - 展開各個步驟查看詳細輸出

2. **本地測試**
   ```bash
   # 驗證環境變數
   npm run validate:env
   
   # 本地執行爬蟲
   npm start
   
   # 檢查生成的文件
   ls -la exports/
   ```

3. **手動觸發測試**
   - 使用 `workflow_dispatch` 手動觸發
   - 設置較小的 `max_requests` 參數進行測試

## 📊 監控和維護

### 定期檢查項目
- [ ] 工作流程執行狀態
- [ ] CSV文件生成情況
- [ ] API請求配額使用情況
- [ ] 錯誤日誌和警告

### 性能優化建議
1. **調整執行頻率**：根據需求調整cron表達式
2. **優化請求數量**：調整 `max_requests` 參數
3. **清理舊文件**：定期清理過期的CSV和日誌文件

## 🔗 相關資源

- [GitHub Actions文檔](https://docs.github.com/en/actions)
- [GitHub API文檔](https://docs.github.com/en/rest)
- [Supabase文檔](https://supabase.com/docs)
- [Cron表達式生成器](https://crontab.guru/)

## 📞 支援

如果遇到問題，請：
1. 查看本指南的故障排除部分
2. 檢查GitHub Actions執行日誌
3. 參考 `GITHUB_ACTIONS_TROUBLESHOOTING.md` 文件
4. 在GitHub Issues中報告問題

---

**最後更新：2024年**  
**版本：1.0**