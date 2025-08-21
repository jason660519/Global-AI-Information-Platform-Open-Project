const app = require('./app');
const { db, testConnection, runMigrations } = require('./config/database');
require('dotenv').config();

// 配置
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// 啟動服務器
const startServer = async () => {
  try {
    console.log('🚀 Starting GitHub Repository Information Platform API Server...');
    console.log(`Environment: ${NODE_ENV}`);
    
    // 測試數據庫連接
    console.log('📊 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // 運行數據庫遷移（僅在開發和生產環境）
    if (NODE_ENV !== 'test') {
      console.log('🔄 Running database migrations...');
      const migrationSuccess = await runMigrations();
      
      if (!migrationSuccess) {
        console.error('❌ Database migration failed. Exiting...');
        process.exit(1);
      }
    }
    
    // 啟動HTTP服務器
    const server = app.listen(PORT, HOST, () => {
      console.log(`\n🎉 Server is running successfully!`);
      console.log(`📍 Local: http://${HOST}:${PORT}`);
      console.log(`🌐 Network: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://${HOST}:${PORT}/api/docs`);
      console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
      console.log(`\n🔗 Available Endpoints:`);
      console.log(`   • Repositories: http://${HOST}:${PORT}/api/repositories`);
      console.log(`   • Owners: http://${HOST}:${PORT}/api/owners`);
      console.log(`   • Topics: http://${HOST}:${PORT}/api/topics`);
      console.log(`   • Statistics: http://${HOST}:${PORT}/api/stats`);
      console.log(`   • Search: http://${HOST}:${PORT}/api/search`);
      console.log(`\n⏰ Started at: ${new Date().toISOString()}`);
      
      if (NODE_ENV === 'development') {
        console.log(`\n🛠️  Development Mode Features:`);
        console.log(`   • Hot reload enabled`);
        console.log(`   • Detailed error messages`);
        console.log(`   • Request logging enabled`);
        console.log(`   • CORS enabled for all origins`);
      }
    });
    
    // 設置服務器超時
    server.timeout = 30000; // 30秒
    server.keepAliveTimeout = 65000; // 65秒
    server.headersTimeout = 66000; // 66秒
    
    // 優雅關閉處理
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      // 停止接受新連接
      server.close(async () => {
        console.log('📡 HTTP server closed');
        
        try {
          // 關閉數據庫連接
          console.log('🔌 Closing database connections...');
          await db.destroy();
          console.log('✅ Database connections closed');
          
          console.log('👋 Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // 強制關閉超時
      setTimeout(() => {
        console.error('⚠️  Forced shutdown due to timeout');
        process.exit(1);
      }, 10000); // 10秒後強制關閉
    };
    
    // 監聽關閉信號
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 處理未捕獲的異常
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
    
    return server;
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// 如果直接運行此文件，啟動服務器
if (require.main === module) {
  startServer();
}

module.exports = { startServer };