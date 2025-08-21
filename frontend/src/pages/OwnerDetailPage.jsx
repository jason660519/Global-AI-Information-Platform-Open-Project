import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  StarIcon,
  EyeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const OwnerDetailPage = () => {
  const { login } = useParams();

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
            to="/owners"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回開發者列表
          </Link>
        </motion.div>

        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            開發者詳情頁面
          </h1>
          <p className="text-lg text-gray-600">
            @{login}
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
                <span className="text-gray-700">開發者基本信息</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">倉庫列表展示</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">貢獻統計圖表</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">活動時間線</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">關注者和關注中</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">技能標籤雲</span>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/owners"
              className="btn-primary"
            >
              瀏覽所有開發者
            </Link>
            <Link
              to="/search"
              className="btn-secondary"
            >
              搜索其他開發者
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
            模擬開發者信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>用戶名: {login}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>類型: 個人開發者</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>地點: 台灣</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>加入時間: 2020-01-01</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">統計數據</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-4 w-4" />
                  <span>關注者: 1,234</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4" />
                  <span>關注中: 567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>公開倉庫: 89</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 模擬倉庫列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            熱門倉庫
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-blue-600 hover:text-blue-800">
                      sample-repo-{index}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      這是一個示例倉庫的描述，展示了該項目的主要功能和用途。
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>JavaScript</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <StarIcon className="h-3 w-3" />
                        <span>{100 * index}</span>
                      </span>
                      <span>更新於 {index} 天前</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDetailPage;