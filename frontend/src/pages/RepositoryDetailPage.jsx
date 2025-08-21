import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  CalendarIcon,
  UserIcon,
  LinkIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const RepositoryDetailPage = () => {
  const { owner, repo } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 返回按鈕 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/repositories"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回倉庫列表
          </Link>
        </motion.div>

        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            倉庫詳情頁面
          </h1>
          <p className="text-lg text-gray-600">
            {owner}/{repo}
          </p>
        </motion.div>

        {/* 開發中提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center"
        >
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            頁面開發中
          </h2>
          <p className="text-yellow-700 mb-6">
            此頁面正在開發中，敬請期待！
          </p>
          
          {/* 預期功能列表 */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              預期功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">倉庫基本信息展示</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">README 內容顯示</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">提交歷史記錄</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">貢獻者信息</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">議題和拉取請求</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">統計數據圖表</span>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/repositories"
              className="btn-primary"
            >
              瀏覽所有倉庫
            </Link>
            <Link
              to="/search"
              className="btn-secondary"
            >
              搜索其他倉庫
            </Link>
          </div>
        </motion.div>

        {/* 模擬數據展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            模擬倉庫信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>所有者: {owner}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CodeBracketIcon className="h-4 w-4" />
                  <span>倉庫名: {repo}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>創建時間: 2023-01-01</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">統計數據</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-4 w-4" />
                  <span>星標數: 1,234</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4" />
                  <span>關注數: 567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>分支數: 89</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RepositoryDetailPage;