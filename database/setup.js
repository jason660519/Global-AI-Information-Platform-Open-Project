import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config();

/**
 * PostgreSQL 資料庫設置腳本
 * 用於初始化資料庫結構和基本配置
 */
class DatabaseSetup {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'github_repos_dev',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password'
        };
        
        this.adminConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: 'postgres', // 連接到預設資料庫以創建新資料庫
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password'
        };
    }

    /**
     * 檢查資料庫連接
     */
    async checkConnection() {
        const client = new Client(this.adminConfig);
        try {
            await client.connect();
            console.log('✅ PostgreSQL 連接成功');
            await client.end();
            return true;
        } catch (error) {
            console.error('❌ PostgreSQL 連接失敗:', error.message);
            console.log('\n請確保:');
            console.log('1. PostgreSQL 服務已啟動');
            console.log('2. 連接參數正確 (host, port, user, password)');
            console.log('3. 用戶具有創建資料庫的權限');
            return false;
        }
    }

    /**
     * 創建資料庫（如果不存在）
     */
    async createDatabase() {
        const client = new Client(this.adminConfig);
        try {
            await client.connect();
            
            // 檢查資料庫是否存在
            const result = await client.query(
                'SELECT 1 FROM pg_database WHERE datname = $1',
                [this.config.database]
            );
            
            if (result.rows.length === 0) {
                console.log(`📦 創建資料庫: ${this.config.database}`);
                await client.query(`CREATE DATABASE "${this.config.database}"`);
                console.log('✅ 資料庫創建成功');
            } else {
                console.log(`✅ 資料庫 ${this.config.database} 已存在`);
            }
            
            await client.end();
            return true;
        } catch (error) {
            console.error('❌ 創建資料庫失敗:', error.message);
            await client.end();
            return false;
        }
    }

    /**
     * 執行 SQL 腳本
     */
    async executeSchema() {
        const client = new Client(this.config);
        try {
            await client.connect();
            console.log('📋 執行資料庫結構腳本...');
            
            // 讀取 schema.sql 文件
            const schemaPath = join(__dirname, 'schema.sql');
            const schemaSql = await fs.readFile(schemaPath, 'utf8');
            
            // 執行 SQL 腳本
            await client.query(schemaSql);
            console.log('✅ 資料庫結構創建成功');
            
            await client.end();
            return true;
        } catch (error) {
            console.error('❌ 執行資料庫結構腳本失敗:', error.message);
            await client.end();
            return false;
        }
    }

    /**
     * 驗證資料庫結構
     */
    async validateSchema() {
        const client = new Client(this.config);
        try {
            await client.connect();
            console.log('🔍 驗證資料庫結構...');
            
            // 檢查主要表格是否存在
            const tables = ['owners', 'repositories', 'repository_languages', 'topics', 'repository_topics', 'crawl_logs'];
            
            for (const table of tables) {
                const result = await client.query(
                    `SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )`,
                    [table]
                );
                
                if (result.rows[0].exists) {
                    console.log(`  ✅ 表格 ${table} 存在`);
                } else {
                    console.log(`  ❌ 表格 ${table} 不存在`);
                    await client.end();
                    return false;
                }
            }
            
            // 檢查視圖
            const views = ['repository_stats', 'language_stats', 'trending_repositories'];
            for (const view of views) {
                const result = await client.query(
                    `SELECT EXISTS (
                        SELECT FROM information_schema.views 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )`,
                    [view]
                );
                
                if (result.rows[0].exists) {
                    console.log(`  ✅ 視圖 ${view} 存在`);
                } else {
                    console.log(`  ⚠️  視圖 ${view} 不存在`);
                }
            }
            
            console.log('✅ 資料庫結構驗證完成');
            await client.end();
            return true;
        } catch (error) {
            console.error('❌ 驗證資料庫結構失敗:', error.message);
            await client.end();
            return false;
        }
    }

    /**
     * 顯示資料庫統計信息
     */
    async showStats() {
        const client = new Client(this.config);
        try {
            await client.connect();
            console.log('\n📊 資料庫統計信息:');
            
            // 表格記錄數
            const tables = ['owners', 'repositories', 'repository_languages', 'topics', 'crawl_logs'];
            
            for (const table of tables) {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = parseInt(result.rows[0].count);
                console.log(`  ${table}: ${count.toLocaleString()} 條記錄`);
            }
            
            await client.end();
        } catch (error) {
            console.error('❌ 獲取統計信息失敗:', error.message);
            await client.end();
        }
    }

    /**
     * 完整設置流程
     */
    async setup() {
        console.log('🚀 開始設置 PostgreSQL 資料庫...\n');
        
        // 1. 檢查連接
        if (!(await this.checkConnection())) {
            return false;
        }
        
        // 2. 創建資料庫
        if (!(await this.createDatabase())) {
            return false;
        }
        
        // 3. 執行結構腳本
        if (!(await this.executeSchema())) {
            return false;
        }
        
        // 4. 驗證結構
        if (!(await this.validateSchema())) {
            return false;
        }
        
        // 5. 顯示統計
        await this.showStats();
        
        console.log('\n🎉 資料庫設置完成！');
        console.log('\n下一步:');
        console.log('1. 運行數據清洗: npm run clean:data');
        console.log('2. 匯入數據: npm run import:data');
        console.log('3. 啟動後端服務: npm run dev:backend');
        
        return true;
    }

    /**
     * 重置資料庫（危險操作）
     */
    async reset() {
        const client = new Client(this.adminConfig);
        try {
            await client.connect();
            
            console.log('⚠️  警告: 即將刪除資料庫及所有數據!');
            console.log('請在 5 秒內按 Ctrl+C 取消...');
            
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            console.log(`🗑️  刪除資料庫: ${this.config.database}`);
            await client.query(`DROP DATABASE IF EXISTS "${this.config.database}"`);
            
            await client.end();
            
            console.log('✅ 資料庫已重置');
            return await this.setup();
        } catch (error) {
            console.error('❌ 重置資料庫失敗:', error.message);
            await client.end();
            return false;
        }
    }
}

// 命令行執行
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new DatabaseSetup();
    const command = process.argv[2];
    
    switch (command) {
        case 'reset':
            await setup.reset();
            break;
        case 'validate':
            if (await setup.checkConnection()) {
                await setup.validateSchema();
                await setup.showStats();
            }
            break;
        case 'stats':
            if (await setup.checkConnection()) {
                await setup.showStats();
            }
            break;
        default:
            await setup.setup();
    }
    
    process.exit(0);
}

export default DatabaseSetup;