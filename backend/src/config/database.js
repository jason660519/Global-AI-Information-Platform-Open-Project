const knex = require('knex');
require('dotenv').config();

// 數據庫配置
const config = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'github_repos_dev',
      charset: 'utf8'
    },
    pool: {
      min: 2,
      max: 10,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    },
    migrations: {
      directory: '../migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../seeds'
    },
    debug: process.env.DB_DEBUG === 'true'
  },
  
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_TEST_NAME || 'github_repos_test',
      charset: 'utf8'
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      directory: '../migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../seeds'
    }
  },
  
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    },
    pool: {
      min: 2,
      max: 20,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    },
    migrations: {
      directory: '../migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../seeds'
    },
    acquireConnectionTimeout: 60000,
    debug: false
  }
};

// 獲取當前環境
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// 創建數據庫連接
const db = knex(currentConfig);

// 測試數據庫連接
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log(`✅ Database connected successfully (${environment})`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// 關閉數據庫連接
const closeConnection = async () => {
  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

// 檢查數據庫健康狀態
const checkHealth = async () => {
  try {
    const result = await db.raw('SELECT version(), now() as current_time');
    return {
      status: 'healthy',
      version: result.rows[0].version,
      currentTime: result.rows[0].current_time,
      environment
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      environment
    };
  }
};

// 運行遷移
const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('Database is already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      log.forEach(migration => console.log(`- ${migration}`));
    }
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error.message);
    return false;
  }
};

// 運行種子數據
const runSeeds = async () => {
  try {
    console.log('Running database seeds...');
    const log = await db.seed.run();
    
    console.log(`Executed ${log.length} seed files`);
    log.forEach(seed => console.log(`- ${seed}`));
    
    return true;
  } catch (error) {
    console.error('Seeding failed:', error.message);
    return false;
  }
};

// 導出
module.exports = {
  db,
  config: currentConfig,
  environment,
  testConnection,
  closeConnection,
  checkHealth,
  runMigrations,
  runSeeds
};

// 如果直接運行此文件，測試連接
if (require.main === module) {
  testConnection().then(success => {
    if (success) {
      console.log('Database configuration is valid');
    } else {
      console.log('Database configuration has issues');
      process.exit(1);
    }
    process.exit(0);
  });
}