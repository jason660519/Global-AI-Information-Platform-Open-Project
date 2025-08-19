const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

// 確保日誌目錄存在
const logDir = path.dirname(config.logger.filePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * 創建日誌記錄器
 * @param {string} category - 日誌類別
 * @returns {winston.Logger} - Winston日誌記錄器實例
 */
function createLogger(category = 'app') {
  return winston.createLogger({
    level: config.logger.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
          if (meta.stack) {
            metaStr = `\n${meta.stack}`;
          } else {
            metaStr = `\n${JSON.stringify(meta, null, 2)}`;
          }
        }
        return `${timestamp} [${category}] ${level.toUpperCase()}: ${message}${metaStr}`;
      })
    ),
    transports: [
      // 控制台輸出
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
      // 文件輸出
      new winston.transports.File({
        filename: config.logger.filePath,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
      }),
    ],
  });
}

module.exports = createLogger;
