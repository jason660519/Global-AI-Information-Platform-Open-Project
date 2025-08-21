import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const suggestions = [
    {
      icon: HomeIcon,
      title: '返回首頁',
      description: '回到首頁探索熱門項目',
      link: '/',
      color: 'blue'
    },
    {
      icon: MagnifyingGlassIcon,
      title: '搜索項目',
      description: '使用搜索功能找到您需要的內容',
      link: '/search',
      color: 'green'
    },
    {
      icon: ArrowLeftIcon,
      title: '返回上頁',
      description: '回到您之前瀏覽的頁面',
      action: 'back',
      color: 'purple'
    }
  ];

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 動畫 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            {/* 404 文字 */}
            <motion.h1
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-9xl font-bold text-gray-200 select-none"
            >
              404
            </motion.h1>
            
            {/* 浮動的警告圖標 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-yellow-100 p-4 rounded-full"
              >
                <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* 錯誤信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            頁面未找到
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            抱歉，您訪問的頁面不存在或已被移動。
          </p>
          <p className="text-gray-500">
            請檢查URL是否正確，或嘗試以下建議。
          </p>
        </motion.div>

        {/* 建議操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-${suggestion.color}-100 rounded-lg mb-4`}>
                <suggestion.icon className={`h-6 w-6 text-${suggestion.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {suggestion.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {suggestion.description}
              </p>
              {suggestion.link ? (
                <Link
                  to={suggestion.link}
                  className={`btn-${suggestion.color === 'blue' ? 'primary' : suggestion.color === 'green' ? 'success' : 'secondary'} w-full`}
                >
                  {suggestion.title}
                </Link>
              ) : (
                <button
                  onClick={handleGoBack}
                  className="btn-secondary w-full"
                >
                  {suggestion.title}
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* 額外信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              需要幫助？
            </h3>
            <p className="text-blue-700 mb-4">
              如果您認為這是一個錯誤，請聯繫我們的技術支持團隊。
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                support@example.com
              </a>
              <span className="hidden sm:inline text-blue-400">|</span>
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                關於我們
              </Link>
            </div>
          </div>

          {/* 裝飾性元素 */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="inline-block text-gray-300 text-6xl mb-4"
          >
            ⚙️
          </motion.div>
          
          <p className="text-gray-400 text-sm">
            錯誤代碼: 404 | 頁面未找到
          </p>
        </motion.div>

        {/* 浮動動畫背景元素 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0, 0.1, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute w-2 h-2 bg-blue-200 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;