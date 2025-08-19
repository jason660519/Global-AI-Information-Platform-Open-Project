import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置日誌
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/csv-exporter.log' }),
  ],
});

class CSVExporter {
  constructor() {
    this.outputDir = path.join(__dirname, '../../exports');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      logger.info(`Created output directory: ${this.outputDir}`);
    }
  }

  /**
   * 導出GitHub倉庫數據為CSV
   * @param {Array} repositories - 倉庫數據數組
   * @param {string} filename - 輸出文件名（可選）
   * @returns {Promise<string>} 導出文件的完整路徑
   */
  async exportRepositories(repositories, filename = null) {
    if (!repositories || repositories.length === 0) {
      throw new Error('No repository data to export');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = filename || `github-repositories-${timestamp}.csv`;
    const outputPath = path.join(this.outputDir, outputFilename);

    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        // 基本信息
        { id: 'id', title: 'ID' },
        { id: 'node_id', title: 'Node ID' },
        { id: 'name', title: 'Name' },
        { id: 'full_name', title: 'Full Name' },
        { id: 'description', title: 'Description' },
        { id: 'url', title: 'HTML URL' },
        { id: 'homepage', title: 'Homepage' },
        { id: 'clone_url', title: 'Clone URL' },
        { id: 'git_url', title: 'Git URL' },
        { id: 'ssh_url', title: 'SSH URL' },
        { id: 'svn_url', title: 'SVN URL' },
        { id: 'mirror_url', title: 'Mirror URL' },
        
        // 統計數據
        { id: 'stars', title: 'Stars' },
        { id: 'forks', title: 'Forks' },
        { id: 'watchers', title: 'Watchers' },
        { id: 'subscribers_count', title: 'Subscribers' },
        { id: 'network_count', title: 'Network Count' },
        { id: 'open_issues', title: 'Open Issues' },
        { id: 'size', title: 'Size (KB)' },
        
        // 技術信息
        { id: 'language', title: 'Language' },
        { id: 'topics', title: 'Topics' },
        { id: 'default_branch', title: 'Default Branch' },
        
        // 時間信息
        { id: 'created_at', title: 'Created At' },
        { id: 'updated_at', title: 'Updated At' },
        { id: 'pushed_at', title: 'Last Push' },
        
        // 設置信息
        { id: 'private', title: 'Private' },
        { id: 'fork', title: 'Is Fork' },
        { id: 'archived', title: 'Archived' },
        { id: 'disabled', title: 'Disabled' },
        { id: 'has_issues', title: 'Has Issues' },
        { id: 'has_projects', title: 'Has Projects' },
        { id: 'has_wiki', title: 'Has Wiki' },
        { id: 'has_pages', title: 'Has Pages' },
        { id: 'has_downloads', title: 'Has Downloads' },
        { id: 'has_discussions', title: 'Has Discussions' },
        
        // 許可證信息
        { id: 'license_key', title: 'License Key' },
        { id: 'license_name', title: 'License Name' },
        { id: 'license_spdx_id', title: 'License SPDX ID' },
        { id: 'license_url', title: 'License URL' },
        { id: 'visibility', title: 'Visibility' },
        
        // 所有者信息
        { id: 'owner_id', title: 'Owner ID' },
        { id: 'owner_login', title: 'Owner Login' },
        { id: 'owner_type', title: 'Owner Type' },
        { id: 'owner_site_admin', title: 'Owner Site Admin' },
        { id: 'owner_url', title: 'Owner URL' },
        { id: 'owner_avatar_url', title: 'Owner Avatar URL' },
        
        // API URLs (選擇性包含重要的)
        { id: 'api_url', title: 'API URL' },
        { id: 'contributors_url', title: 'Contributors URL' },
        { id: 'languages_url', title: 'Languages URL' },
        { id: 'releases_url', title: 'Releases URL' },
        { id: 'issues_url', title: 'Issues URL' },
        { id: 'pulls_url', title: 'Pulls URL' },
        
        // 合併設置
        { id: 'allow_forking', title: 'Allow Forking' },
        { id: 'is_template', title: 'Is Template' },
        { id: 'allow_merge_commit', title: 'Allow Merge Commit' },
        { id: 'allow_squash_merge', title: 'Allow Squash Merge' },
        { id: 'allow_rebase_merge', title: 'Allow Rebase Merge' },
        { id: 'allow_auto_merge', title: 'Allow Auto Merge' },
        { id: 'delete_branch_on_merge', title: 'Delete Branch on Merge' },
        
        // 其他
        { id: 'score', title: 'Score' },
        { id: 'crawled_at', title: 'Crawled At' },
      ],
    });

    // 格式化數據
    const formattedData = repositories.map(repo => ({
      // 基本信息
      id: repo.id || '',
      node_id: repo.node_id || '',
      name: repo.name || '',
      full_name: repo.full_name || '',
      description: repo.description || '',
      url: repo.url || '',
      homepage: repo.homepage || '',
      clone_url: repo.clone_url || '',
      git_url: repo.git_url || '',
      ssh_url: repo.ssh_url || '',
      svn_url: repo.svn_url || '',
      mirror_url: repo.mirror_url || '',
      
      // 統計數據
      stars: repo.stars || 0,
      forks: repo.forks || 0,
      watchers: repo.watchers || 0,
      subscribers_count: repo.subscribers_count || 0,
      network_count: repo.network_count || 0,
      open_issues: repo.open_issues || 0,
      size: repo.size || 0,
      
      // 技術信息
      language: repo.language || '',
      topics: Array.isArray(repo.topics) ? repo.topics.join(', ') : '',
      default_branch: repo.default_branch || 'main',
      
      // 時間信息
      created_at: repo.created_at || '',
      updated_at: repo.updated_at || '',
      pushed_at: repo.pushed_at || '',
      
      // 設置信息
      private: repo.private || false,
      fork: repo.fork || false,
      archived: repo.archived || false,
      disabled: repo.disabled || false,
      has_issues: repo.has_issues || false,
      has_projects: repo.has_projects || false,
      has_wiki: repo.has_wiki || false,
      has_pages: repo.has_pages || false,
      has_downloads: repo.has_downloads || false,
      has_discussions: repo.has_discussions || false,
      
      // 許可證信息
      license_key: repo.license?.key || '',
      license_name: repo.license?.name || '',
      license_spdx_id: repo.license?.spdx_id || '',
      license_url: repo.license?.url || '',
      visibility: repo.visibility || '',
      
      // 所有者信息
      owner_id: repo.owner?.id || '',
      owner_login: repo.owner?.login || '',
      owner_type: repo.owner?.type || '',
      owner_site_admin: repo.owner?.site_admin || false,
      owner_url: repo.owner?.url || '',
      owner_avatar_url: repo.owner?.avatar_url || '',
      
      // API URLs
      api_url: repo.api_url || '',
      contributors_url: repo.contributors_url || '',
      languages_url: repo.languages_url || '',
      releases_url: repo.releases_url || '',
      issues_url: repo.issues_url || '',
      pulls_url: repo.pulls_url || '',
      
      // 合併設置
      allow_forking: repo.allow_forking || false,
      is_template: repo.is_template || false,
      allow_merge_commit: repo.allow_merge_commit || false,
      allow_squash_merge: repo.allow_squash_merge || false,
      allow_rebase_merge: repo.allow_rebase_merge || false,
      allow_auto_merge: repo.allow_auto_merge || false,
      delete_branch_on_merge: repo.delete_branch_on_merge || false,
      
      // 其他
      score: repo.score || 0,
      crawled_at: repo.crawled_at || '',
    }));

    try {
      await csvWriter.writeRecords(formattedData);
      logger.info(`Successfully exported ${repositories.length} repositories to ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error('Error writing CSV file:', error);
      throw error;
    }
  }

  /**
   * 導出通用數據為CSV
   * @param {Array} data - 數據數組
   * @param {Array} headers - CSV標題配置
   * @param {string} filename - 輸出文件名
   * @returns {Promise<string>} 導出文件的完整路徑
   */
  async exportGeneric(data, headers, filename) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    if (!headers || headers.length === 0) {
      throw new Error('Headers configuration is required');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = filename || `export-${timestamp}.csv`;
    const outputPath = path.join(this.outputDir, outputFilename);

    const csvWriter = createCsvWriter({
      path: outputPath,
      header: headers,
    });

    try {
      await csvWriter.writeRecords(data);
      logger.info(`Successfully exported ${data.length} records to ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error('Error writing CSV file:', error);
      throw error;
    }
  }

  /**
   * 讀取CSV文件
   * @param {string} filePath - CSV文件路徑
   * @returns {Promise<Array>} 解析後的數據數組
   */
  async readCSV(filePath) {
    const csvParser = require('csv-parser');
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', data => results.push(data))
        .on('end', () => {
          logger.info(`Successfully read ${results.length} records from ${filePath}`);
          resolve(results);
        })
        .on('error', error => {
          logger.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }

  /**
   * 獲取導出目錄中的所有CSV文件
   * @returns {Promise<Array>} CSV文件列表
   */
  async listExportedFiles() {
    try {
      const files = await fs.readdir(this.outputDir);
      const csvFiles = files.filter(file => file.endsWith('.csv'));

      const fileDetails = await Promise.all(
        csvFiles.map(async file => {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        })
      );

      return fileDetails.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      logger.error('Error listing exported files:', error);
      throw error;
    }
  }
}

export default CSVExporter;

// 如果直接運行此文件，執行示例導出
if (import.meta.url === `file://${process.argv[1]}`) {
  const exporter = new CSVExporter();

  // 示例數據
  const sampleData = [
    {
      id: 1,
      name: 'sample-repo',
      full_name: 'user/sample-repo',
      description: 'A sample repository',
      html_url: 'https://github.com/user/sample-repo',
      stargazers_count: 100,
      forks_count: 20,
      watchers_count: 50,
      language: 'JavaScript',
      topics: ['javascript', 'node', 'sample'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      pushed_at: '2024-01-15T12:00:00Z',
      size: 1024,
      open_issues_count: 5,
      license: { name: 'MIT' },
      default_branch: 'main',
      archived: false,
      disabled: false,
      private: false,
    },
  ];

  exporter
    .exportRepositories(sampleData, 'sample-export.csv')
    .then(filePath => {
      console.log(`Sample export completed: ${filePath}`);
    })
    .catch(error => {
      console.error('Export failed:', error);
    });
}
