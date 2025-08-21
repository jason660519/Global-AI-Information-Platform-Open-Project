import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ErrorFallback = ({ error, resetErrorBoundary, title, message }) => {
  const defaultTitle = '出現錯誤';
  const defaultMessage = '抱歉，應用程序遇到了一個錯誤。請嘗試刷新頁面或聯繫支持團隊。';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          {title || defaultTitle}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-6 leading-relaxed"
        >
          {message || defaultMessage}
        </motion.p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-left bg-gray-50 rounded-lg p-4"
          >
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              錯誤詳情 (開發模式)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </motion.details>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={resetErrorBoundary}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            重試
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            返回首頁
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// 簡單錯誤組件
const SimpleError = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">{message || '載入失敗'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          重試
        </button>
      )}
    </div>
  );
};

// 網絡錯誤組件
const NetworkError = ({ onRetry, className = '' }) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">網絡連接錯誤</h3>
      <p className="text-gray-600 mb-4">
        無法連接到服務器，請檢查您的網絡連接。
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          重新連接
        </button>
      )}
    </div>
  );
};

// 404 錯誤組件
const NotFoundError = ({ title, message, showHomeButton = true }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {title || '頁面未找到'}
      </h2>
      <p className="text-gray-600 mb-6">
        {message || '抱歉，您訪問的頁面不存在或已被移除。'}
      </p>
      {showHomeButton && (
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          返回首頁
        </button>
      )}
    </div>
  );
};

export { ErrorFallback, SimpleError, NetworkError, NotFoundError };
export default ErrorFallback;