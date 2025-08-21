import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import csvParser from 'csv-parser';
import { createReadStream } from 'fs';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置日誌
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/supabase-uploader.log' }),
  ],
});

class SupabaseUploader {
  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.key);
    this.batchSize = 1000; // 批次處理大小
  }

  /**
   * 從CSV文件讀取數據
   * @param {string} csvFilePath - CSV文件路徑
   * @returns {Promise<Array>} 解析後的數據數組
   */
  async readCSVFile(csvFilePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', data => {
          // 清理和轉換數據
          const cleanedData = this.cleanRepositoryData(data);
          if (cleanedData) {
            results.push(cleanedData);
          }
        })
        .on('end', () => {
          logger.info(`Successfully read ${results.length} records from ${csvFilePath}`);
          resolve(results);
        })
        .on('error', error => {
          logger.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }

  /**
   * 清理和轉換倉庫數據
   * @param {Object} rawData - 原始CSV數據
   * @returns {Object|null} 清理後的數據
   */
  cleanRepositoryData(rawData) {
    try {
      // 轉換布爾值
      const parseBoolean = value => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);
      };

      // 轉換數字
      const parseNumber = value => {
        const num = parseInt(value, 10);
        return isNaN(num) ? 0 : num;
      };

      // 解析主題標籤
      const parseTopics = topicsString => {
        if (!topicsString || topicsString.trim() === '') {
          return [];
        }
        return topicsString
          .split(',')
          .map(topic => topic.trim())
          .filter(topic => topic);
      };

      // 只返回數據庫中確實存在的基本字段
      // 根據用戶的 Supabase 表格結構調整欄位映射
      return {
        'Name': rawData.Name || rawData.name || '',
        'Full Name': rawData['Full Name'] || rawData.full_name || '',
        'Description': rawData.Description || rawData.description || null,
        'HTML URL': rawData['HTML URL'] || rawData.url || '',
        'Stars': parseNumber(rawData.Stars || rawData.stars),
        'Forks': parseNumber(rawData.Forks || rawData.forks),
        'Language': rawData.Language || rawData.language || null,
        'Topics': parseTopics(rawData.Topics || rawData.topics || ''),
      };
    } catch (error) {
      logger.error('Error cleaning repository data:', error, rawData);
      return null;
    }
  }

  /**
   * 批次上傳數據到Supabase
   * @param {Array} data - 要上傳的數據數組
   * @param {string} tableName - 目標表名
   * @returns {Promise<Object>} 上傳結果
   */
  async batchUpload(data, tableName = 'repositories') {
    if (!data || data.length === 0) {
      throw new Error('No data to upload');
    }

    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    // 分批處理數據
    for (let i = 0; i < data.length; i += this.batchSize) {
      const batch = data.slice(i, i + this.batchSize);

      try {
        logger.info(
          `Uploading batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(data.length / this.batchSize)} (${batch.length} records)`
        );

        const { data: insertedData, error } = await this.supabase
          .from(tableName)
          .insert(batch)
          .select();

        if (error) {
          logger.error('Batch upload error:', error);
          results.failed += batch.length;
          results.errors.push({
            batch: Math.floor(i / this.batchSize) + 1,
            error: error.message,
            records: batch.length,
          });
        } else {
          results.successful += batch.length;
          logger.info(`Successfully uploaded batch with ${batch.length} records`);
        }

        // 添加延遲以避免速率限制
        if (i + this.batchSize < data.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        logger.error('Unexpected error in batch upload:', error);
        results.failed += batch.length;
        results.errors.push({
          batch: Math.floor(i / this.batchSize) + 1,
          error: error.message,
          records: batch.length,
        });
      }
    }

    return results;
  }

  /**
   * 從CSV文件上傳到Supabase
   * @param {string} csvFilePath - CSV文件路徑
   * @param {string} tableName - 目標表名
   * @returns {Promise<Object>} 上傳結果
   */
  async uploadFromCSV(csvFilePath, tableName = 'repositories') {
    try {
      logger.info(`Starting upload from CSV: ${csvFilePath}`);

      // 檢查文件是否存在
      await fs.access(csvFilePath);

      // 讀取CSV數據
      const data = await this.readCSVFile(csvFilePath);

      if (data.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      // 批次上傳
      const results = await this.batchUpload(data, tableName);

      logger.info(`Upload completed. Successful: ${results.successful}, Failed: ${results.failed}`);

      return results;
    } catch (error) {
      logger.error('Error uploading from CSV:', error);
      throw error;
    }
  }

  /**
   * 直接上傳數據數組到Supabase
   * @param {Array} repositories - 倉庫數據數組
   * @param {string} tableName - 目標表名
   * @returns {Promise<Object>} 上傳結果
   */
  async uploadRepositories(repositories, tableName = 'repositories') {
    try {
      logger.info(`Starting direct upload of ${repositories.length} repositories`);

      // 清理數據
      const cleanedData = repositories.map(repo => this.cleanRepositoryData(repo)).filter(Boolean);

      if (cleanedData.length === 0) {
        throw new Error('No valid repository data to upload');
      }

      // 批次上傳
      const results = await this.batchUpload(cleanedData, tableName);

      logger.info(
        `Direct upload completed. Successful: ${results.successful}, Failed: ${results.failed}`
      );

      return results;
    } catch (error) {
      logger.error('Error in direct upload:', error);
      throw error;
    }
  }

  /**
   * 檢查Supabase連接
   * @param {string} tableName - 要測試的表名
   * @returns {Promise<Object>} 連接狀態和錯誤信息
   */
  async testConnection(tableName = 'GITHUB REPO EVERY 2 HOUR') {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true });

      if (error) {
        logger.error('Supabase connection test failed:', error);
        return { success: false, error: error.message };
      }

      logger.info('Supabase connection test successful');
      return { success: true };
    } catch (error) {
      logger.error('Supabase connection test error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 獲取表中的記錄數量
   * @param {string} tableName - 表名
   * @returns {Promise<number>} 記錄數量
   */
  async getRecordCount(tableName = 'repositories') {
    try {
      const { count, error } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        logger.error(`Error getting record count for ${tableName}:`, error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error getting record count:', error);
      throw error;
    }
  }

  /**
   * 清空表數據
   * @param {string} tableName - 表名
   * @returns {Promise<boolean>} 操作結果
   */
  async clearTable(tableName = 'repositories') {
    try {
      logger.warn(`Clearing all data from table: ${tableName}`);

      const { error } = await this.supabase.from(tableName).delete().neq('id', 0); // 刪除所有記錄

      if (error) {
        logger.error(`Error clearing table ${tableName}:`, error);
        throw error;
      }

      logger.info(`Successfully cleared table: ${tableName}`);
      return true;
    } catch (error) {
      logger.error('Error clearing table:', error);
      throw error;
    }
  }
}

export default SupabaseUploader;

// 如果直接運行此文件，執行測試上傳
if (import.meta.url === `file://${process.argv[1]}`) {
  const uploader = new SupabaseUploader();

  async function testUpload() {
    try {
      // 測試連接
      const isConnected = await uploader.testConnection();
      if (!isConnected) {
        console.error('Failed to connect to Supabase');
        return;
      }

      console.log('Supabase connection successful');

      // 獲取當前記錄數量
      const currentCount = await uploader.getRecordCount();
      console.log(`Current record count: ${currentCount}`);

      // 如果有CSV文件參數，則上傳
      if (process.argv[2]) {
        const csvPath = process.argv[2];
        console.log(`Uploading from CSV: ${csvPath}`);

        const results = await uploader.uploadFromCSV(csvPath);
        console.log('Upload results:', results);

        // 獲取更新後的記錄數量
        const newCount = await uploader.getRecordCount();
        console.log(`New record count: ${newCount}`);
      } else {
        console.log('No CSV file specified. Usage: node supabase-uploader.js <csv-file-path>');
      }
    } catch (error) {
      console.error('Test upload failed:', error);
    }
  }

  testUpload();
}

export { SupabaseUploader };
