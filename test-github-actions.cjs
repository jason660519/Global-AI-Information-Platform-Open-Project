#!/usr/bin/env node

/**
 * GitHub Actions 工作流程測試腳本
 * 用於驗證GitHub Actions配置和本地環境
 */

const fs = require('fs');
const path = require('path');

class GitHubActionsValidator {
  constructor() {
    this.workflowPath = '.github/workflows/crawler.yml';
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 驗證工作流程文件
   */
  validateWorkflow() {
    console.log('🔍 驗證GitHub Actions工作流程...');
    
    // 檢查文件是否存在
    if (!fs.existsSync(this.workflowPath)) {
      this.errors.push('GitHub Actions工作流程文件不存在');
      return false;
    }

    try {
      // 讀取YAML內容
      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      
      // 基本YAML語法檢查
      this.validateYamlSyntax(workflowContent);
      
      console.log('✅ 工作流程文件存在且可讀取');
      return true;
    } catch (error) {
      this.errors.push(`文件讀取錯誤: ${error.message}`);
      return false;
    }
  }

  /**
   * 基本YAML語法檢查
   */
  validateYamlSyntax(content) {
    // 檢查基本結構
    if (!content.includes('name:')) {
      this.warnings.push('工作流程可能缺少名稱');
    }
    
    if (!content.includes('on:')) {
      this.errors.push('工作流程缺少觸發器配置');
    }
    
    if (!content.includes('jobs:')) {
      this.errors.push('工作流程缺少作業配置');
    }
    
    if (content.includes('schedule:')) {
      console.log('📅 定時觸發器已配置');
    }
    
    if (content.includes('workflow_dispatch:')) {
      console.log('🔧 手動觸發器已配置');
    }
    
    if (content.includes('permissions:')) {
      console.log('🔐 權限配置已設置');
    }
  }

  /**
   * 驗證環境變數
   */
  validateEnvironment() {
    console.log('\n🌍 驗證環境配置...');
    
    const requiredSecrets = [
      'AI_INFORMATION_PLATFORMAPI_TOKEN',
      'SUPABASE_URL',
      'SUPABASE_KEY'
    ];
    
    console.log('📝 必要的GitHub Secrets:');
    requiredSecrets.forEach(secret => {
      console.log(`   - ${secret}`);
    });
    
    // 檢查本地環境（僅供參考）
    console.log('\n💻 本地環境變數狀態:');
    requiredSecrets.forEach(secret => {
      const value = process.env[secret];
      const status = value ? '✅ 已設置' : '❌ 未設置';
      console.log(`   ${secret}: ${status}`);
    });
    
    console.log('\n💡 注意: 本地環境變數未設置是正常的，它們應該在GitHub Secrets中配置');
  }

  /**
   * 驗證項目結構
   */
  validateProjectStructure() {
    console.log('\n📁 驗證項目結構...');
    
    const requiredFiles = [
      'package.json',
      'src/crawlers/sources/github-crawler.js',
      'src/exporters/csv-exporter.js',
      '.github/workflows/crawler.yml'
    ];
    
    const requiredDirs = [
      'src',
      'exports',
      'logs',
      '.github/workflows'
    ];
    
    // 檢查文件
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        this.errors.push(`缺少必要文件: ${file}`);
      }
    });
    
    // 檢查目錄
    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/`);
      } else {
        this.warnings.push(`建議創建目錄: ${dir}`);
      }
    });
  }

  /**
   * 生成報告
   */
  generateReport() {
    console.log('\n📊 驗證報告');
    console.log('=' .repeat(50));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 所有檢查都通過了！');
      console.log('\n✅ GitHub Actions工作流程已準備就緒');
      console.log('\n📋 下一步:');
      console.log('1. 確保在GitHub倉庫中配置了必要的Secrets');
      console.log('2. 設置倉庫權限為 "Read and write permissions"');
      console.log('3. 手動觸發工作流程進行測試');
      return true;
    }
    
    if (this.errors.length > 0) {
      console.log('❌ 發現錯誤:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    return this.errors.length === 0;
  }

  /**
   * 運行所有驗證
   */
  runValidation() {
    console.log('🚀 GitHub Actions 配置驗證器');
    console.log('=' .repeat(50));
    
    this.validateWorkflow();
    this.validateEnvironment();
    this.validateProjectStructure();
    
    return this.generateReport();
  }
}

// 主程序
if (require.main === module) {
  const validator = new GitHubActionsValidator();
  const success = validator.runValidation();
  process.exit(success ? 0 : 1);
}

module.exports = GitHubActionsValidator;