import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import winston from 'winston';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config();

/**
 * 數據清洗工具
 * 處理 GitHub 倉庫 CSV 數據的清洗、去重和驗證
 */
class DataCleaner {
    constructor() {
        this.logger = this.setupLogger();
        this.stats = {
            totalRecords: 0,
            validRecords: 0,
            duplicateRecords: 0,
            invalidRecords: 0,
            processedRecords: 0
        };
        
        // 數據目錄
        this.dataDir = join(process.cwd(), 'data');
        this.rawDir = join(this.dataDir, 'raw');
        this.processedDir = join(this.dataDir, 'processed');
        
        // 確保目錄存在
        this.ensureDirectories();
        
        // 用於去重的 Set
        this.seenRepositories = new Set();
        this.seenOwners = new Set();
    }

    /**
     * 設置日誌系統
     */
    setupLogger() {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ 
                    filename: join(process.cwd(), 'logs', 'data-cleaner.log') 
                })
            ]
        });
    }

    /**
     * 確保必要的目錄存在
     */
    async ensureDirectories() {
        const dirs = [this.dataDir, this.rawDir, this.processedDir, join(process.cwd(), 'logs')];
        for (const dir of dirs) {
            await fs.ensureDir(dir);
        }
    }

    /**
     * 驗證倉庫數據
     */
    validateRepository(repo) {
        const errors = [];
        
        // 必填字段檢查
        if (!repo.full_name || typeof repo.full_name !== 'string') {
            errors.push('full_name is required and must be string');
        }
        
        if (!repo.html_url || !this.isValidUrl(repo.html_url)) {
            errors.push('html_url is required and must be valid URL');
        }
        
        if (!repo.name || typeof repo.name !== 'string') {
            errors.push('name is required and must be string');
        }
        
        // 數值字段檢查
        const numericFields = ['stargazers_count', 'watchers_count', 'forks_count', 'open_issues_count', 'size'];
        for (const field of numericFields) {
            if (repo[field] !== undefined && repo[field] !== null && repo[field] !== '') {
                const num = parseInt(repo[field]);
                if (isNaN(num) || num < 0) {
                    errors.push(`${field} must be a non-negative number`);
                } else {
                    repo[field] = num;
                }
            } else {
                repo[field] = 0;
            }
        }
        
        // 布林字段檢查
        const booleanFields = ['private', 'fork', 'archived', 'disabled', 'has_issues', 'has_projects', 'has_wiki', 'has_pages', 'has_downloads'];
        for (const field of booleanFields) {
            if (repo[field] !== undefined && repo[field] !== null && repo[field] !== '') {
                repo[field] = this.parseBoolean(repo[field]);
            } else {
                repo[field] = false;
            }
        }
        
        // 日期字段檢查
        const dateFields = ['created_at', 'updated_at', 'pushed_at'];
        for (const field of dateFields) {
            if (repo[field] && !this.isValidDate(repo[field])) {
                errors.push(`${field} must be a valid date`);
            }
        }
        
        // URL 字段檢查
        const urlFields = ['html_url', 'clone_url', 'ssh_url', 'git_url', 'svn_url', 'homepage'];
        for (const field of urlFields) {
            if (repo[field] && !this.isValidUrl(repo[field])) {
                errors.push(`${field} must be a valid URL`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            cleanedData: repo
        };
    }

    /**
     * 驗證擁有者數據
     */
    validateOwner(owner) {
        const errors = [];
        
        if (!owner.login || typeof owner.login !== 'string') {
            errors.push('login is required and must be string');
        }
        
        if (!owner.id || isNaN(parseInt(owner.id))) {
            errors.push('id is required and must be number');
        } else {
            owner.id = parseInt(owner.id);
        }
        
        if (owner.avatar_url && !this.isValidUrl(owner.avatar_url)) {
            errors.push('avatar_url must be valid URL');
        }
        
        if (owner.html_url && !this.isValidUrl(owner.html_url)) {
            errors.push('html_url must be valid URL');
        }
        
        // 數值字段
        const numericFields = ['public_repos', 'public_gists', 'followers', 'following'];
        for (const field of numericFields) {
            if (owner[field] !== undefined && owner[field] !== null && owner[field] !== '') {
                const num = parseInt(owner[field]);
                if (isNaN(num) || num < 0) {
                    errors.push(`${field} must be a non-negative number`);
                } else {
                    owner[field] = num;
                }
            } else {
                owner[field] = 0;
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            cleanedData: owner
        };
    }

    /**
     * 工具函數：檢查是否為有效 URL
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * 工具函數：檢查是否為有效日期
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * 工具函數：解析布林值
     */
    parseBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
    }

    /**
     * 處理單個 CSV 文件
     */
    async processCSVFile(inputPath, outputPath, validator) {
        return new Promise((resolve, reject) => {
            const results = [];
            const errors = [];
            let lineNumber = 0;
            
            fs.createReadStream(inputPath)
                .pipe(csv())
                .on('data', (data) => {
                    lineNumber++;
                    this.stats.totalRecords++;
                    
                    const validation = validator(data);
                    
                    if (validation.isValid) {
                        // 檢查重複
                        const key = validation.cleanedData.full_name || validation.cleanedData.login;
                        if (key && !this.seenRepositories.has(key) && !this.seenOwners.has(key)) {
                            results.push(validation.cleanedData);
                            this.seenRepositories.add(key);
                            this.seenOwners.add(key);
                            this.stats.validRecords++;
                        } else {
                            this.stats.duplicateRecords++;
                            this.logger.debug(`Duplicate record at line ${lineNumber}: ${key}`);
                        }
                    } else {
                        this.stats.invalidRecords++;
                        errors.push({
                            line: lineNumber,
                            data,
                            errors: validation.errors
                        });
                        this.logger.warn(`Invalid record at line ${lineNumber}: ${validation.errors.join(', ')}`);
                    }
                })
                .on('end', async () => {
                    try {
                        if (results.length > 0) {
                            await this.writeCSV(outputPath, results);
                            this.stats.processedRecords += results.length;
                        }
                        
                        // 寫入錯誤報告
                        if (errors.length > 0) {
                            const errorPath = outputPath.replace('.csv', '_errors.json');
                            await fs.writeJson(errorPath, errors, { spaces: 2 });
                        }
                        
                        resolve({
                            processed: results.length,
                            errors: errors.length
                        });
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', reject);
        });
    }

    /**
     * 寫入 CSV 文件
     */
    async writeCSV(filePath, data) {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: headers
        });
        
        await csvWriter.writeRecords(data);
    }

    /**
     * 查找所有 CSV 文件
     */
    async findCSVFiles() {
        const files = await fs.readdir(this.rawDir);
        return files.filter(file => file.endsWith('.csv')).map(file => join(this.rawDir, file));
    }

    /**
     * 主要清洗流程
     */
    async clean() {
        this.logger.info('🧹 開始數據清洗流程...');
        
        try {
            // 查找所有 CSV 文件
            const csvFiles = await this.findCSVFiles();
            
            if (csvFiles.length === 0) {
                this.logger.warn('未找到 CSV 文件，請確保 data/raw/ 目錄中有 CSV 文件');
                return false;
            }
            
            this.logger.info(`找到 ${csvFiles.length} 個 CSV 文件`);
            
            // 重置統計
            this.stats = {
                totalRecords: 0,
                validRecords: 0,
                duplicateRecords: 0,
                invalidRecords: 0,
                processedRecords: 0
            };
            
            // 處理每個文件
            for (const csvFile of csvFiles) {
                const fileName = csvFile.split(/[\\/]/).pop();
                this.logger.info(`處理文件: ${fileName}`);
                
                const outputPath = join(this.processedDir, `cleaned_${fileName}`);
                
                // 根據文件名判斷數據類型
                let validator;
                if (fileName.includes('repo') || fileName.includes('github')) {
                    validator = this.validateRepository.bind(this);
                } else if (fileName.includes('owner') || fileName.includes('user')) {
                    validator = this.validateOwner.bind(this);
                } else {
                    // 默認使用倉庫驗證器
                    validator = this.validateRepository.bind(this);
                }
                
                const result = await this.processCSVFile(csvFile, outputPath, validator);
                this.logger.info(`${fileName}: 處理 ${result.processed} 條記錄，${result.errors} 個錯誤`);
            }
            
            // 生成清洗報告
            await this.generateReport();
            
            this.logger.info('✅ 數據清洗完成');
            return true;
            
        } catch (error) {
            this.logger.error('❌ 數據清洗失敗:', error.message);
            return false;
        }
    }

    /**
     * 生成清洗報告
     */
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            statistics: this.stats,
            summary: {
                successRate: ((this.stats.validRecords / this.stats.totalRecords) * 100).toFixed(2) + '%',
                duplicateRate: ((this.stats.duplicateRecords / this.stats.totalRecords) * 100).toFixed(2) + '%',
                errorRate: ((this.stats.invalidRecords / this.stats.totalRecords) * 100).toFixed(2) + '%'
            }
        };
        
        const reportPath = join(this.processedDir, 'cleaning_report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        // 控制台輸出統計
        console.log('\n📊 數據清洗統計:');
        console.log(`總記錄數: ${this.stats.totalRecords.toLocaleString()}`);
        console.log(`有效記錄: ${this.stats.validRecords.toLocaleString()} (${report.summary.successRate})`);
        console.log(`重複記錄: ${this.stats.duplicateRecords.toLocaleString()} (${report.summary.duplicateRate})`);
        console.log(`無效記錄: ${this.stats.invalidRecords.toLocaleString()} (${report.summary.errorRate})`);
        console.log(`最終輸出: ${this.stats.processedRecords.toLocaleString()} 條記錄`);
        console.log(`\n📄 詳細報告: ${reportPath}`);
    }

    /**
     * 清理舊的處理文件
     */
    async cleanProcessedFiles() {
        try {
            const files = await fs.readdir(this.processedDir);
            for (const file of files) {
                await fs.remove(join(this.processedDir, file));
            }
            this.logger.info('🗑️  清理舊的處理文件完成');
        } catch (error) {
            this.logger.warn('清理舊文件時出錯:', error.message);
        }
    }
}

// 命令行執行
if (import.meta.url === `file://${process.argv[1]}`) {
    const cleaner = new DataCleaner();
    const command = process.argv[2];
    
    switch (command) {
        case 'clean-old':
            await cleaner.cleanProcessedFiles();
            break;
        default:
            await cleaner.clean();
    }
    
    process.exit(0);
}

export default DataCleaner;