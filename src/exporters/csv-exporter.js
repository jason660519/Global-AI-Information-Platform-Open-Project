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
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'full_name', title: 'Full Name' },
        { id: 'description', title: 'Description' },
        { id: 'html_url', title: 'URL' },
        { id: 'stars_count', title: 'Stars' },
        { id: 'forks_count', title: 'Forks' },
        { id: 'watchers_count', title: 'Watchers' },
        { id: 'language', title: 'Language' },
        { id: 'topics', title: 'Topics' },
        { id: 'created_at', title: 'Created At' },
        { id: 'updated_at', title: 'Updated At' },
        { id: 'pushed_at', title: 'Last Push' },
        { id: 'size', title: 'Size (KB)' },
        { id: 'open_issues_count', title: 'Open Issues' },
        { id: 'license', title: 'License' },
        { id: 'default_branch', title: 'Default Branch' },
        { id: 'archived', title: 'Archived' },
        { id: 'disabled', title: 'Disabled' },
        { id: 'private', title: 'Private' },
      ],
    });

    // 格式化數據
    const formattedData = repositories.map(repo => ({
      id: repo.id || '',
      name: repo.name || '',
      full_name: repo.full_name || '',
      description: repo.description || '',
      html_url: repo.url || '',
      stars_count: repo.stars || 0,
      forks_count: repo.forks || 0,
      watchers_count: repo.metadata?.watchers || 0,
      language: repo.language || '',
      topics: Array.isArray(repo.topics) ? repo.topics.join(', ') : '',
      created_at: repo.created_at || '',
      updated_at: repo.updated_at || '',
      pushed_at: repo.pushed_at || '',
      size: repo.size || 0,
      open_issues_count: repo.metadata?.open_issues || 0,
      license: repo.license?.name || '',
      default_branch: repo.metadata?.default_branch || 'main',
      archived: repo.archived || false,
      disabled: repo.disabled || false,
      private: repo.private || false,
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
