#!/usr/bin/env node

/**
 * GitHub Actions 測試腳本
 * 用於驗證環境變量和請求限制功能
 */

import GitHubCrawler from './src/crawlers/sources/github-crawler.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

async function testGitHubActions() {
  console.log('🚀 開始 GitHub Actions 測試...');
  console.log('\n=== 環境變量檢查 ===');
  
  // 檢查環境變量
  const requiredEnvVars = {
    'GITHUB_TOKEN': process.env.GITHUB_TOKEN,
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_KEY': process.env.SUPABASE_KEY,
    'MAX_REQUESTS': process.env.MAX_REQUESTS,
  };

  let missingVars = [];
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (value) {
      console.log(`✅ ${key}: ${key === 'GITHUB_TOKEN' || key === 'SUPABASE_KEY' ? '***隱藏***' : value}`);
    } else {
      console.log(`❌ ${key}: 未設置`);
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    console.log(`\n⚠️  警告: 以下環境變量未設置: ${missingVars.join(', ')}`);
    console.log('這可能會影響 GitHub Actions 的正常運行。');
  }

  console.log('\n=== 配置檢查 ===');
  console.log(`最大請求數: ${config.crawler.maxRequests}`);
  console.log(`爬蟲頻率: ${config.sources.github.crawlFrequency}`);
  console.log(`主題數量: ${config.sources.github.topics.length}`);
  console.log(`主題列表: ${config.sources.github.topics.join(', ')}`);

  console.log('\n=== 請求限制測試 ===');
  
  try {
    const crawler = new GitHubCrawler();
    
    // 測試小量請求
    console.log('測試搜索功能...');
    const testQuery = 'language:javascript stars:>1000';
    const results = await crawler.searchRepositories(testQuery, 5);
    
    console.log(`✅ 搜索成功，找到 ${results.length} 個倉庫`);
    console.log(`當前請求計數: ${crawler.requestCount}/${crawler.maxRequests}`);
    
    if (results.length > 0) {
      console.log(`示例倉庫: ${results[0].full_name} (⭐ ${results[0].stargazers_count})`);
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('💡 提示: 請檢查 GITHUB_TOKEN 是否正確設置');
    } else if (error.message.includes('403')) {
      console.log('💡 提示: 可能已達到 API 速率限制，請稍後再試');
    }
  }

  console.log('\n=== GitHub Actions 建議 ===');
  
  const requestsPerHour = 5000;
  const requestsPerExecution = config.crawler.maxRequests;
  const executionsPerDay = 12; // 每2小時一次
  const dailyRequests = requestsPerExecution * executionsPerDay;
  const dailyLimit = requestsPerHour * 24;
  
  console.log(`每次執行請求數: ${requestsPerExecution}`);
  console.log(`每日執行次數: ${executionsPerDay}`);
  console.log(`每日總請求數: ${dailyRequests}`);
  console.log(`每日API限制: ${dailyLimit}`);
  console.log(`利用率: ${((dailyRequests / dailyLimit) * 100).toFixed(1)}%`);
  
  if (dailyRequests > dailyLimit) {
    console.log('⚠️  警告: 每日請求數超過限制！');
    const suggestedRequests = Math.floor(dailyLimit / executionsPerDay);
    console.log(`建議每次執行請求數: ${suggestedRequests}`);
  } else {
    console.log('✅ 請求配置在安全範圍內');
  }

  console.log('\n=== 測試完成 ===');
  console.log('如果所有檢查都通過，您的 GitHub Actions 配置應該可以正常工作！');
}

// 執行測試
testGitHubActions().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});