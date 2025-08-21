import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import csv from 'csv-parser';
import pg from 'pg';
import winston from 'winston';
import dotenv from 'dotenv';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config();

/**
 * 數據匯入工具
 * 將清洗後的 CSV 數據匯入 PostgreSQL 資料庫
 */
class DataImporter {
    constructor() {
        this.logger = this.setupLogger();
        this.client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'github_repos_dev',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password'
        });
        
        this.stats = {
            totalRecords: 0,
            importedRecords: 0,
            skippedRecords: 0,
            errorRecords: 0,
            startTime: null,
            endTime: null
        };
        
        this.processedDir = join(process.cwd(), 'data', 'processed');
        this.batchSize = 1000; // 批次處理大小
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
                    filename: join(process.cwd(), 'logs', 'data-importer.log') 
                })
            ]
        });
    }

    /**
     * 連接資料庫
     */
    async connect() {
        try {
            await this.client.connect();
            this.logger.info('✅ 資料庫連接成功');
            return true;
        } catch (error) {
            this.logger.error('❌ 資料庫連接失敗:', error.message);
            return false;
        }
    }

    /**
     * 斷開資料庫連接
     */
    async disconnect() {
        try {
            await this.client.end();
            this.logger.info('📤 資料庫連接已關閉');
        } catch (error) {
            this.logger.error('關閉資料庫連接時出錯:', error.message);
        }
    }

    /**
     * 檢查資料庫表格是否存在
     */
    async checkTables() {
        try {
            const tables = ['owners', 'repositories', 'repository_languages', 'topics'];
            
            for (const table of tables) {
                const result = await this.client.query(
                    `SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )`,
                    [table]
                );
                
                if (!result.rows[0].exists) {
                    this.logger.error(`❌ 表格 ${table} 不存在，請先運行資料庫設置`);
                    return false;
                }
            }
            
            this.logger.info('✅ 資料庫表格檢查通過');
            return true;
        } catch (error) {
            this.logger.error('❌ 檢查資料庫表格失敗:', error.message);
            return false;
        }
    }

    /**
     * 匯入擁有者數據
     */
    async importOwner(ownerData) {
        try {
            const query = `
                INSERT INTO owners (
                    login, github_id, avatar_url, html_url, type, site_admin,
                    name, company, blog, location, email, bio,
                    public_repos, public_gists, followers, following,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
                )
                ON CONFLICT (login) DO UPDATE SET
                    avatar_url = EXCLUDED.avatar_url,
                    html_url = EXCLUDED.html_url,
                    type = EXCLUDED.type,
                    site_admin = EXCLUDED.site_admin,
                    name = EXCLUDED.name,
                    company = EXCLUDED.company,
                    blog = EXCLUDED.blog,
                    location = EXCLUDED.location,
                    email = EXCLUDED.email,
                    bio = EXCLUDED.bio,
                    public_repos = EXCLUDED.public_repos,
                    public_gists = EXCLUDED.public_gists,
                    followers = EXCLUDED.followers,
                    following = EXCLUDED.following,
                    updated_at = EXCLUDED.updated_at
                RETURNING id
            `;
            
            const values = [
                ownerData.login,
                parseInt(ownerData.id) || null,
                ownerData.avatar_url || null,
                ownerData.html_url || null,
                ownerData.type || 'User',
                ownerData.site_admin || false,
                ownerData.name || null,
                ownerData.company || null,
                ownerData.blog || null,
                ownerData.location || null,
                ownerData.email || null,
                ownerData.bio || null,
                parseInt(ownerData.public_repos) || 0,
                parseInt(ownerData.public_gists) || 0,
                parseInt(ownerData.followers) || 0,
                parseInt(ownerData.following) || 0,
                ownerData.created_at || null,
                ownerData.updated_at || null
            ];
            
            const result = await this.client.query(query, values);
            return result.rows[0]?.id;
        } catch (error) {
            this.logger.error(`匯入擁有者失敗 (${ownerData.login}):`, error.message);
            throw error;
        }
    }

    /**
     * 匯入倉庫數據
     */
    async importRepository(repoData, ownerId) {
        try {
            const query = `
                INSERT INTO repositories (
                    github_id, name, full_name, description, html_url,
                    clone_url, ssh_url, git_url, svn_url, homepage,
                    language, stargazers_count, watchers_count, forks_count,
                    open_issues_count, size, default_branch, is_private,
                    is_fork, is_archived, is_disabled, has_issues,
                    has_projects, has_wiki, has_pages, has_downloads,
                    has_discussions, license_key, license_name, license_url,
                    topics, visibility, created_at, updated_at, pushed_at,
                    owner_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                    $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
                )
                ON CONFLICT (full_name) DO UPDATE SET
                    description = EXCLUDED.description,
                    html_url = EXCLUDED.html_url,
                    clone_url = EXCLUDED.clone_url,
                    ssh_url = EXCLUDED.ssh_url,
                    git_url = EXCLUDED.git_url,
                    svn_url = EXCLUDED.svn_url,
                    homepage = EXCLUDED.homepage,
                    language = EXCLUDED.language,
                    stargazers_count = EXCLUDED.stargazers_count,
                    watchers_count = EXCLUDED.watchers_count,
                    forks_count = EXCLUDED.forks_count,
                    open_issues_count = EXCLUDED.open_issues_count,
                    size = EXCLUDED.size,
                    default_branch = EXCLUDED.default_branch,
                    is_private = EXCLUDED.is_private,
                    is_fork = EXCLUDED.is_fork,
                    is_archived = EXCLUDED.is_archived,
                    is_disabled = EXCLUDED.is_disabled,
                    has_issues = EXCLUDED.has_issues,
                    has_projects = EXCLUDED.has_projects,
                    has_wiki = EXCLUDED.has_wiki,
                    has_pages = EXCLUDED.has_pages,
                    has_downloads = EXCLUDED.has_downloads,
                    has_discussions = EXCLUDED.has_discussions,
                    license_key = EXCLUDED.license_key,
                    license_name = EXCLUDED.license_name,
                    license_url = EXCLUDED.license_url,
                    topics = EXCLUDED.topics,
                    visibility = EXCLUDED.visibility,
                    updated_at = EXCLUDED.updated_at,
                    pushed_at = EXCLUDED.pushed_at
                RETURNING id
            `;
            
            // 處理 topics 數組
            let topics = null;
            if (repoData.topics) {
                try {
                    topics = Array.isArray(repoData.topics) 
                        ? repoData.topics 
                        : JSON.parse(repoData.topics);
                } catch {
                    topics = repoData.topics.split(',').map(t => t.trim()).filter(t => t);
                }
            }
            
            const values = [
                parseInt(repoData.id) || null,
                repoData.name,
                repoData.full_name,
                repoData.description || null,
                repoData.html_url,
                repoData.clone_url || null,
                repoData.ssh_url || null,
                repoData.git_url || null,
                repoData.svn_url || null,
                repoData.homepage || null,
                repoData.language || null,
                parseInt(repoData.stargazers_count) || 0,
                parseInt(repoData.watchers_count) || 0,
                parseInt(repoData.forks_count) || 0,
                parseInt(repoData.open_issues_count) || 0,
                parseInt(repoData.size) || 0,
                repoData.default_branch || 'main',
                repoData.private || false,
                repoData.fork || false,
                repoData.archived || false,
                repoData.disabled || false,
                repoData.has_issues !== false,
                repoData.has_projects !== false,
                repoData.has_wiki !== false,
                repoData.has_pages || false,
                repoData.has_downloads !== false,
                repoData.has_discussions || false,
                repoData.license_key || null,
                repoData.license_name || null,
                repoData.license_url || null,
                topics,
                repoData.visibility || 'public',
                repoData.created_at || null,
                repoData.updated_at || null,
                repoData.pushed_at || null,
                ownerId
            ];
            
            const result = await this.client.query(query, values);
            return result.rows[0]?.id;
        } catch (error) {
            this.logger.error(`匯入倉庫失敗 (${repoData.full_name}):`, error.message);
            throw error;
        }
    }

    /**
     * 處理單個 CSV 文件
     */
    async processCSVFile(filePath) {
        return new Promise((resolve, reject) => {
            const records = [];
            let lineNumber = 0;
            
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    lineNumber++;
                    records.push({ ...data, _lineNumber: lineNumber });
                })
                .on('end', () => {
                    resolve(records);
                })
                .on('error', reject);
        });
    }

    /**
     * 批次處理數據
     */
    async processBatch(records, processor) {
        const results = {
            imported: 0,
            skipped: 0,
            errors: 0
        };
        
        for (let i = 0; i < records.length; i += this.batchSize) {
            const batch = records.slice(i, i + this.batchSize);
            
            try {
                await this.client.query('BEGIN');
                
                for (const record of batch) {
                    try {
                        await processor(record);
                        results.imported++;
                        this.stats.importedRecords++;
                    } catch (error) {
                        results.errors++;
                        this.stats.errorRecords++;
                        this.logger.warn(`處理記錄失敗 (行 ${record._lineNumber}):`, error.message);
                    }
                }
                
                await this.client.query('COMMIT');
                
                // 顯示進度
                const progress = Math.min(i + this.batchSize, records.length);
                const percentage = ((progress / records.length) * 100).toFixed(1);
                this.logger.info(`進度: ${progress}/${records.length} (${percentage}%)`);
                
            } catch (error) {
                await this.client.query('ROLLBACK');
                this.logger.error(`批次處理失敗:`, error.message);
                results.errors += batch.length;
                this.stats.errorRecords += batch.length;
            }
        }
        
        return results;
    }

    /**
     * 匯入所有數據
     */
    async import() {
        this.logger.info('📥 開始數據匯入流程...');
        this.stats.startTime = new Date();
        
        try {
            // 連接資料庫
            if (!(await this.connect())) {
                return false;
            }
            
            // 檢查表格
            if (!(await this.checkTables())) {
                return false;
            }
            
            // 查找處理後的 CSV 文件
            const files = await fs.readdir(this.processedDir);
            const csvFiles = files.filter(file => file.endsWith('.csv') && file.startsWith('cleaned_'));
            
            if (csvFiles.length === 0) {
                this.logger.warn('未找到清洗後的 CSV 文件，請先運行數據清洗');
                return false;
            }
            
            this.logger.info(`找到 ${csvFiles.length} 個清洗後的 CSV 文件`);
            
            // 創建擁有者映射
            const ownerMap = new Map();
            
            // 處理每個文件
            for (const csvFile of csvFiles) {
                const filePath = join(this.processedDir, csvFile);
                this.logger.info(`處理文件: ${csvFile}`);
                
                const records = await this.processCSVFile(filePath);
                this.stats.totalRecords += records.length;
                
                if (records.length === 0) {
                    this.logger.warn(`文件 ${csvFile} 沒有數據`);
                    continue;
                }
                
                // 根據文件類型處理
                if (csvFile.includes('owner') || csvFile.includes('user')) {
                    // 處理擁有者數據
                    const results = await this.processBatch(records, async (record) => {
                        const ownerId = await this.importOwner(record);
                        if (ownerId && record.login) {
                            ownerMap.set(record.login, ownerId);
                        }
                    });
                    
                    this.logger.info(`擁有者數據: 匯入 ${results.imported}, 錯誤 ${results.errors}`);
                } else {
                    // 處理倉庫數據
                    const results = await this.processBatch(records, async (record) => {
                        // 提取擁有者信息
                        let ownerId = null;
                        
                        if (record.owner_login) {
                            ownerId = ownerMap.get(record.owner_login);
                        }
                        
                        // 如果沒有找到擁有者，創建一個
                        if (!ownerId && record.owner_login) {
                            const ownerData = {
                                login: record.owner_login,
                                id: record.owner_id || null,
                                avatar_url: record.owner_avatar_url || null,
                                html_url: record.owner_html_url || null,
                                type: record.owner_type || 'User'
                            };
                            
                            ownerId = await this.importOwner(ownerData);
                            if (ownerId) {
                                ownerMap.set(record.owner_login, ownerId);
                            }
                        }
                        
                        if (ownerId) {
                            await this.importRepository(record, ownerId);
                        } else {
                            throw new Error('無法找到或創建擁有者');
                        }
                    });
                    
                    this.logger.info(`倉庫數據: 匯入 ${results.imported}, 錯誤 ${results.errors}`);
                }
            }
            
            // 更新統計信息
            await this.updateCrawlLog();
            
            // 生成匯入報告
            await this.generateReport();
            
            this.logger.info('✅ 數據匯入完成');
            return true;
            
        } catch (error) {
            this.logger.error('❌ 數據匯入失敗:', error.message);
            return false;
        } finally {
            await this.disconnect();
            this.stats.endTime = new Date();
        }
    }

    /**
     * 更新爬蟲日誌
     */
    async updateCrawlLog() {
        try {
            const query = `
                INSERT INTO crawl_logs (
                    crawl_type, status, total_items, processed_items, 
                    failed_items, started_at, completed_at, duration_seconds
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            const duration = Math.round((this.stats.endTime - this.stats.startTime) / 1000);
            
            await this.client.query(query, [
                'import',
                'completed',
                this.stats.totalRecords,
                this.stats.importedRecords,
                this.stats.errorRecords,
                this.stats.startTime,
                this.stats.endTime,
                duration
            ]);
        } catch (error) {
            this.logger.warn('更新爬蟲日誌失敗:', error.message);
        }
    }

    /**
     * 生成匯入報告
     */
    async generateReport() {
        const duration = this.stats.endTime - this.stats.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            duration: {
                milliseconds: duration,
                seconds: Math.round(duration / 1000),
                minutes: Math.round(duration / 60000)
            },
            statistics: this.stats,
            summary: {
                successRate: ((this.stats.importedRecords / this.stats.totalRecords) * 100).toFixed(2) + '%',
                errorRate: ((this.stats.errorRecords / this.stats.totalRecords) * 100).toFixed(2) + '%',
                recordsPerSecond: Math.round(this.stats.importedRecords / (duration / 1000))
            }
        };
        
        const reportPath = join(this.processedDir, 'import_report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        // 控制台輸出統計
        console.log('\n📊 數據匯入統計:');
        console.log(`總記錄數: ${this.stats.totalRecords.toLocaleString()}`);
        console.log(`成功匯入: ${this.stats.importedRecords.toLocaleString()} (${report.summary.successRate})`);
        console.log(`匯入失敗: ${this.stats.errorRecords.toLocaleString()} (${report.summary.errorRate})`);
        console.log(`處理時間: ${report.duration.minutes} 分鐘`);
        console.log(`處理速度: ${report.summary.recordsPerSecond} 記錄/秒`);
        console.log(`\n📄 詳細報告: ${reportPath}`);
    }

    /**
     * 清空資料庫數據
     */
    async clearDatabase() {
        try {
            await this.connect();
            
            this.logger.warn('⚠️  警告: 即將清空所有數據!');
            console.log('請在 5 秒內按 Ctrl+C 取消...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const tables = ['repository_topics', 'repository_languages', 'repositories', 'owners', 'crawl_logs'];
            
            for (const table of tables) {
                await this.client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
                this.logger.info(`🗑️  清空表格: ${table}`);
            }
            
            this.logger.info('✅ 資料庫清空完成');
            return true;
        } catch (error) {
            this.logger.error('❌ 清空資料庫失敗:', error.message);
            return false;
        } finally {
            await this.disconnect();
        }
    }
}

// 命令行執行
if (import.meta.url === `file://${process.argv[1]}`) {
    const importer = new DataImporter();
    const command = process.argv[2];
    
    switch (command) {
        case 'clear':
            await importer.clearDatabase();
            break;
        default:
            await importer.import();
    }
    
    process.exit(0);
}

export default DataImporter;