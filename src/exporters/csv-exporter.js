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
        
        // 所有者信息 (完整)
        { id: 'owner_id', title: 'Owner ID' },
        { id: 'owner_node_id', title: 'Owner Node ID' },
        { id: 'owner_login', title: 'Owner Login' },
        { id: 'owner_type', title: 'Owner Type' },
        { id: 'owner_site_admin', title: 'Owner Site Admin' },
        { id: 'owner_url', title: 'Owner URL' },
        { id: 'owner_avatar_url', title: 'Owner Avatar URL' },
        { id: 'owner_gravatar_id', title: 'Owner Gravatar ID' },
        { id: 'owner_followers_url', title: 'Owner Followers URL' },
        { id: 'owner_following_url', title: 'Owner Following URL' },
        { id: 'owner_gists_url', title: 'Owner Gists URL' },
        { id: 'owner_starred_url', title: 'Owner Starred URL' },
        { id: 'owner_subscriptions_url', title: 'Owner Subscriptions URL' },
        { id: 'owner_organizations_url', title: 'Owner Organizations URL' },
        { id: 'owner_repos_url', title: 'Owner Repos URL' },
        { id: 'owner_events_url', title: 'Owner Events URL' },
        { id: 'owner_received_events_url', title: 'Owner Received Events URL' },
        
        // API URLs (完整的API端點)
        { id: 'api_url', title: 'API URL' },
        { id: 'archive_url', title: 'Archive URL' },
        { id: 'assignees_url', title: 'Assignees URL' },
        { id: 'blobs_url', title: 'Blobs URL' },
        { id: 'branches_url', title: 'Branches URL' },
        { id: 'collaborators_url', title: 'Collaborators URL' },
        { id: 'comments_url', title: 'Comments URL' },
        { id: 'commits_url', title: 'Commits URL' },
        { id: 'compare_url', title: 'Compare URL' },
        { id: 'contents_url', title: 'Contents URL' },
        { id: 'contributors_url', title: 'Contributors URL' },
        { id: 'deployments_url', title: 'Deployments URL' },
        { id: 'downloads_url', title: 'Downloads URL' },
        { id: 'events_url', title: 'Events URL' },
        { id: 'forks_url', title: 'Forks URL' },
        { id: 'git_commits_url', title: 'Git Commits URL' },
        { id: 'git_refs_url', title: 'Git Refs URL' },
        { id: 'git_tags_url', title: 'Git Tags URL' },
        { id: 'hooks_url', title: 'Hooks URL' },
        { id: 'issue_comment_url', title: 'Issue Comment URL' },
        { id: 'issue_events_url', title: 'Issue Events URL' },
        { id: 'issues_url', title: 'Issues URL' },
        { id: 'keys_url', title: 'Keys URL' },
        { id: 'labels_url', title: 'Labels URL' },
        { id: 'languages_url', title: 'Languages URL' },
        { id: 'merges_url', title: 'Merges URL' },
        { id: 'milestones_url', title: 'Milestones URL' },
        { id: 'notifications_url', title: 'Notifications URL' },
        { id: 'pulls_url', title: 'Pulls URL' },
        { id: 'releases_url', title: 'Releases URL' },
        { id: 'stargazers_url', title: 'Stargazers URL' },
        { id: 'statuses_url', title: 'Statuses URL' },
        { id: 'subscribers_url', title: 'Subscribers URL' },
        { id: 'subscription_url', title: 'Subscription URL' },
        { id: 'tags_url', title: 'Tags URL' },
        { id: 'teams_url', title: 'Teams URL' },
        { id: 'trees_url', title: 'Trees URL' },
        
        // 合併設置和額外配置
        { id: 'allow_forking', title: 'Allow Forking' },
        { id: 'is_template', title: 'Is Template' },
        { id: 'web_commit_signoff_required', title: 'Web Commit Signoff Required' },
        { id: 'delete_branch_on_merge', title: 'Delete Branch on Merge' },
        { id: 'use_squash_pr_title_as_default', title: 'Use Squash PR Title as Default' },
        { id: 'squash_merge_commit_title', title: 'Squash Merge Commit Title' },
        { id: 'squash_merge_commit_message', title: 'Squash Merge Commit Message' },
        { id: 'merge_commit_title', title: 'Merge Commit Title' },
        { id: 'merge_commit_message', title: 'Merge Commit Message' },
        { id: 'allow_merge_commit', title: 'Allow Merge Commit' },
        { id: 'allow_squash_merge', title: 'Allow Squash Merge' },
        { id: 'allow_rebase_merge', title: 'Allow Rebase Merge' },
        { id: 'allow_auto_merge', title: 'Allow Auto Merge' },
        { id: 'allow_update_branch', title: 'Allow Update Branch' },
        
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
      
      // 所有者信息 (完整)
      owner_id: repo.owner?.id || '',
      owner_node_id: repo.owner?.node_id || '',
      owner_login: repo.owner?.login || '',
      owner_type: repo.owner?.type || '',
      owner_site_admin: repo.owner?.site_admin || false,
      owner_url: repo.owner?.url || '',
      owner_avatar_url: repo.owner?.avatar_url || '',
      owner_gravatar_id: repo.owner?.gravatar_id || '',
      owner_followers_url: repo.owner?.followers_url || '',
      owner_following_url: repo.owner?.following_url || '',
      owner_gists_url: repo.owner?.gists_url || '',
      owner_starred_url: repo.owner?.starred_url || '',
      owner_subscriptions_url: repo.owner?.subscriptions_url || '',
      owner_organizations_url: repo.owner?.organizations_url || '',
      owner_repos_url: repo.owner?.repos_url || '',
      owner_events_url: repo.owner?.events_url || '',
      owner_received_events_url: repo.owner?.received_events_url || '',
      
      // API URLs (完整)
      api_url: repo.api_url || '',
      archive_url: repo.archive_url || '',
      assignees_url: repo.assignees_url || '',
      blobs_url: repo.blobs_url || '',
      branches_url: repo.branches_url || '',
      collaborators_url: repo.collaborators_url || '',
      comments_url: repo.comments_url || '',
      commits_url: repo.commits_url || '',
      compare_url: repo.compare_url || '',
      contents_url: repo.contents_url || '',
      contributors_url: repo.contributors_url || '',
      deployments_url: repo.deployments_url || '',
      downloads_url: repo.downloads_url || '',
      events_url: repo.events_url || '',
      forks_url: repo.forks_url || '',
      git_commits_url: repo.git_commits_url || '',
      git_refs_url: repo.git_refs_url || '',
      git_tags_url: repo.git_tags_url || '',
      hooks_url: repo.hooks_url || '',
      issue_comment_url: repo.issue_comment_url || '',
      issue_events_url: repo.issue_events_url || '',
      issues_url: repo.issues_url || '',
      keys_url: repo.keys_url || '',
      labels_url: repo.labels_url || '',
      languages_url: repo.languages_url || '',
      merges_url: repo.merges_url || '',
      milestones_url: repo.milestones_url || '',
      notifications_url: repo.notifications_url || '',
      pulls_url: repo.pulls_url || '',
      releases_url: repo.releases_url || '',
      stargazers_url: repo.stargazers_url || '',
      statuses_url: repo.statuses_url || '',
      subscribers_url: repo.subscribers_url || '',
      subscription_url: repo.subscription_url || '',
      tags_url: repo.tags_url || '',
      teams_url: repo.teams_url || '',
      trees_url: repo.trees_url || '',
      
      // 合併設置和額外配置
      allow_forking: repo.allow_forking || false,
      is_template: repo.is_template || false,
      web_commit_signoff_required: repo.web_commit_signoff_required || false,
      delete_branch_on_merge: repo.delete_branch_on_merge || false,
      use_squash_pr_title_as_default: repo.use_squash_pr_title_as_default || false,
      squash_merge_commit_title: repo.squash_merge_commit_title || '',
      squash_merge_commit_message: repo.squash_merge_commit_message || '',
      merge_commit_title: repo.merge_commit_title || '',
      merge_commit_message: repo.merge_commit_message || '',
      allow_merge_commit: repo.allow_merge_commit || false,
      allow_squash_merge: repo.allow_squash_merge || false,
      allow_rebase_merge: repo.allow_rebase_merge || false,
      allow_auto_merge: repo.allow_auto_merge || false,
      allow_update_branch: repo.allow_update_branch || false,
      
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
