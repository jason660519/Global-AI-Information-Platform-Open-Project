import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 確保日誌目錄存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 創建日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 創建控制台格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      try {
        // 處理循環引用
        const cleanMeta = JSON.parse(
          JSON.stringify(meta, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (value.constructor && value.constructor.name === 'ClientRequest') {
                return '[ClientRequest]';
              }
              if (value.constructor && value.constructor.name === 'IncomingMessage') {
                return '[IncomingMessage]';
              }
            }
            return value;
          })
        );
        msg += ` ${JSON.stringify(cleanMeta)}`;
      } catch (error) {
        msg += ' [無法序列化的對象]';
      }
    }
    return msg;
  })
);

// 創建logger實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'github-crawler' },
  transports: [
    // 錯誤日誌文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日誌文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 控制台輸出
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// 在非生產環境中，記錄到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 添加便利方法
logger.logCrawlerStart = (source, options = {}) => {
  logger.info(`開始爬取 ${source}`, { source, options, type: 'crawler_start' });
};

logger.logCrawlerEnd = (source, results = {}) => {
  logger.info(`完成爬取 ${source}`, { source, results, type: 'crawler_end' });
};

logger.logCrawlerError = (source, error, context = {}) => {
  logger.error(`爬取 ${source} 時發生錯誤: ${error.message}`, {
    source,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
    type: 'crawler_error',
  });
};

logger.logDataProcessing = (action, data = {}) => {
  logger.info(`數據處理: ${action}`, { action, data, type: 'data_processing' });
};

logger.logDatabaseOperation = (operation, table, result = {}) => {
  logger.info(`數據庫操作: ${operation} on ${table}`, {
    operation,
    table,
    result,
    type: 'database_operation',
  });
};

export default logger;
