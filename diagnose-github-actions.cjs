#!/usr/bin/env node

/**
 * GitHub Actions 診斷工具
 * 檢查GitHub Actions配置和Secrets設置
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GitHub Actions 診斷工具');
console.log('=' .repeat(50));

// 檢查工作流程文件
function checkWorkflowFile() {
  console.log('\n📋 檢查工作流程文件...');
  
  const workflowPath = '.github/workflows/crawler.yml';
  
  if (!fs.existsSync(workflowPath)) {
    console.log('❌ 工作流程文件不存在:', workflowPath);
    return false;
  }
  
  console.log('✅ 工作流程文件存在:', workflowPath);
  
  const content = fs.readFileSync(workflowPath, 'utf8');
  
  // 檢查關鍵配置
  const checks = [
    { name: 'Cron 排程', pattern: /cron:\s*['"]0 \*\/2 \* \* \*['"]/, required: true },
    { name: '手動觸發', pattern: /workflow_dispatch:/, required: true },
    { name: 'SUPABASE_URL', pattern: /SUPABASE_URL:\s*\$\{\{\s*secrets\.SUPABASE_URL\s*\}\}/, required: true },
    { name: 'SUPABASE_KEY', pattern: /SUPABASE_KEY:\s*\$\{\{\s*secrets\.SUPABASE_KEY\s*\}\}/, required: true },
    { name: 'GITHUB_API_TOKEN', pattern: /GITHUB_API_TOKEN:\s*\$\{\{\s*secrets\.GITHUB_API_TOKEN\s*\}\}/, required: true },
    { name: 'MAX_REQUESTS', pattern: /MAX_REQUESTS:/, required: true },
    { name: 'CSV 上傳', pattern: /upload-artifact@v4/, required: true },
    { name: 'Git 提交', pattern: /git commit/, required: true }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`  ✅ ${check.name}: 配置正確`);
    } else {
      console.log(`  ${check.required ? '❌' : '⚠️'} ${check.name}: ${check.required ? '缺少必要配置' : '可選配置未找到'}`);
    }
  });
  
  return true;
}

// 檢查專案文件
function checkProjectFiles() {
  console.log('\n📁 檢查專案文件...');
  
  const requiredFiles = [
    'package.json',
    'src/index.js',
    'src/config/index.js',
    'src/crawlers/github.js'
  ];
  
  const requiredDirs = [
    'exports',
    'logs'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} (缺少)`);
    }
  });
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`  ✅ ${dir}/`);
    } else {
      console.log(`  ⚠️ ${dir}/ (將自動創建)`);
    }
  });
}

// 檢查依賴
function checkDependencies() {
  console.log('\n📦 檢查依賴...');
  
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json 不存在');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'axios',
    'csv-writer',
    'winston'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: 未安裝`);
    }
  });
}

// 檢查環境變量
function checkEnvironmentVariables() {
  console.log('\n🔐 檢查本地環境變量...');
  
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_KEY', 
    'GITHUB_API_TOKEN'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: 已設置`);
    } else {
      console.log(`  ⚠️ ${envVar}: 未設置 (GitHub Actions 需要在 Secrets 中設置)`);
    }
  });
}

// 生成診斷報告
function generateDiagnosticReport() {
  console.log('\n📊 診斷總結');
  console.log('=' .repeat(50));
  
  console.log('\n🔧 如果 GitHub Actions 沒有執行，請檢查以下項目:');
  console.log('\n1. GitHub 倉庫 Secrets 設置:');
  console.log('   - 前往: https://github.com/你的用戶名/Global-AI-Information-Platform-Open-Project/settings/secrets/actions');
  console.log('   - 確保設置了以下 Secrets:');
  console.log('     • SUPABASE_URL');
  console.log('     • SUPABASE_KEY');
  console.log('     • GITHUB_API_TOKEN');
  
  console.log('\n2. GitHub Actions 權限:');
  console.log('   - 前往: https://github.com/你的用戶名/Global-AI-Information-Platform-Open-Project/settings/actions');
  console.log('   - 確保 "Actions permissions" 設置為 "Allow all actions and reusable workflows"');
  console.log('   - 確保 "Workflow permissions" 設置為 "Read and write permissions"');
  
  console.log('\n3. 檢查 Actions 執行狀態:');
  console.log('   - 前往: https://github.com/你的用戶名/Global-AI-Information-Platform-Open-Project/actions');
  console.log('   - 查看是否有失敗的工作流程');
  console.log('   - 檢查錯誤日誌');
  
  console.log('\n4. 手動觸發測試:');
  console.log('   - 前往 Actions 頁面');
  console.log('   - 點擊 "GitHub Crawler Automation"');
  console.log('   - 點擊 "Run workflow" 按鈕進行手動測試');
  
  console.log('\n5. 檢查分支:');
  console.log('   - 確保工作流程文件在 main 或 master 分支上');
  console.log('   - GitHub Actions 只會在預設分支上執行排程任務');
  
  console.log('\n📝 如需更多幫助，請檢查:');
  console.log('   - GitHub Actions 日誌');
  console.log('   - 倉庫的 Issues 頁面');
  console.log('   - GITHUB_ACTIONS_SETUP.md 文件');
}

// 主函數
function main() {
  try {
    checkWorkflowFile();
    checkProjectFiles();
    checkDependencies();
    checkEnvironmentVariables();
    generateDiagnosticReport();
    
    console.log('\n✨ 診斷完成！');
    console.log('\n💡 提示: 如果所有配置都正確但 Actions 仍未執行，');
    console.log('   請檢查 GitHub 倉庫的 Secrets 和 Actions 權限設置。');
    
  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkWorkflowFile,
  checkProjectFiles,
  checkDependencies,
  checkEnvironmentVariables
};