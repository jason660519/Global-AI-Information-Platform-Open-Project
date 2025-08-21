const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { validationResult } = require('express-validator');
const path = require('path');
require('dotenv').config();

// 導入路由
const apiRoutes = require('./routes/api');

// 創建Express應用
const app = express();

// 信任代理（如果在反向代理後面運行）
app.set('trust proxy', 1);

// 基本安全中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允許的來源
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173'
    ];
    
    // 在開發環境中允許所有來源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 允許沒有來源的請求（如移動應用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

// 壓縮中間件
app.use(compression());

// 請求日誌
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 解析JSON和URL編碼的請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 靜態文件服務（如果需要）
app.use('/static', express.static(path.join(__dirname, '../public')));

// 請求ID中間件（用於追蹤）
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// 請求時間戳
app.use((req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
});

// 驗證錯誤處理中間件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

app.use(handleValidationErrors);

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GitHub Repository Information Platform API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      api: '/api',
      health: '/health',
      docs: '/api/docs'
    },
    database: {
      status: 'connected',
      type: 'PostgreSQL'
    }
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api', apiRoutes);

// 404處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Check the API documentation at /api/docs'
  });
});

// 全局錯誤處理中間件
app.use((error, req, res, next) => {
  // 記錄錯誤
  console.error(`[${req.timestamp}] [${req.id}] Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // CORS錯誤
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: 'Origin not allowed'
    });
  }

  // 驗證錯誤
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details || error.message
    });
  }

  // 資料庫錯誤
  if (error.code && error.code.startsWith('ER_')) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal database error'
    });
  }

  // JSON解析錯誤
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: 'Request body contains invalid JSON'
    });
  }

  // 請求體過大錯誤
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      error: 'Request body exceeds size limit'
    });
  }

  // 超時錯誤
  if (error.code === 'ETIMEDOUT') {
    return res.status(408).json({
      success: false,
      message: 'Request timeout',
      error: 'The request took too long to process'
    });
  }

  // 默認錯誤響應
  const statusCode = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message,
    error: process.env.NODE_ENV === 'development' ? {
      message: error.message,
      stack: error.stack,
      details: error
    } : undefined,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// 優雅關閉處理
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// 未捕獲的異常處理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;