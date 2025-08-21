import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner, { CardSkeleton } from '../components/ui/LoadingSpinner';
import { SimpleError } from '../components/ui/ErrorFallback';

// 模擬API調用
const fetchStats = async () => {
  return {
    totalRepositories: 125000,
    totalOwners: 45000,
    totalStars: 2500000,
    totalTopics: 1200,
  };
};

const fetchTrendingRepos = async () => {
  return [
    {
      id: 1,
      name: 'awesome-project',
      owner: 'github-user',
      description: '一個令人驚嘆的開源項目，提供了豐富的功能和優秀的性能。',
      stars: 15420,
      language: 'JavaScript',
      topics: ['react', 'nodejs', 'web'],
    },
    {
      id: 2,
      name: 'ml-toolkit',
      owner: 'ai-researcher',
      description: '機器學習工具包，包含常用的算法和數據處理工具。',
      stars: 8930,
      language: 'Python',
      topics: ['machine-learning', 'python', 'ai'],
    },
    {
      id: 3,
      name: 'data-viz',
      owner: 'data-scientist',
      description: '強大的數據可視化庫，支持多種圖表類型。',
      stars: 12340,
      language: 'TypeScript',
      topics: ['visualization', 'charts', 'typescript'],
    },
  ];
};

const HomePage = () => {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const {
    data: trendingRepos,
    isLoading: reposLoading,
    error: reposError,
  } = useQuery({
    queryKey: ['trending-repos'],
    queryFn: fetchTrendingRepos,
  });

  const features = [
    {
      icon: FolderIcon,
      title: '倉庫探索',
      description: '瀏覽和搜索數千個開源項目，發現有趣的代碼倉庫',
      link: '/repositories',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: UserGroupIcon,
      title: '開發者社區',
      description: '連接全球開發者，分享經驗和最佳實踐',
      link: '/developers',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: ChartBarIcon,
      title: '數據統計',
      description: '深入了解開源生態系統的趨勢和統計數據',
      link: '/analytics',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: MagnifyingGlassIcon,
      title: '智能搜索',
      description: '使用先進的搜索算法快速找到您需要的項目',
      link: '/search',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 英雄區域 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white"
      >
        {/* 動態背景裝飾 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="relative text-center py-24 px-4 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-blue-100 border border-white/20 mb-6">
                🚀 探索開源世界的無限可能
              </span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 md:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                全球 AI
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                資訊平台
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 md:mb-12 text-blue-100/90 max-w-4xl mx-auto leading-relaxed font-light px-4">
              連接全球開發者社區，發現最新的技術趨勢和創新項目，
              <br className="hidden sm:block" />
              讓每一行代碼都充滿無限可能
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link
                to="/repositories"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 border border-white/20"
              >
                <span className="relative z-10">開始探索</span>
                <ArrowRightIcon className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              
              <Link
                to="/stats"
                className="group inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border-2 border-white/30 hover:border-white/50"
              >
                查看統計
                <ChartBarIcon className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-0 sm:space-x-8 text-blue-200/70 px-4"
            >
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">125K+</div>
                <div className="text-xs sm:text-sm">開源項目</div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">45K+</div>
                <div className="text-xs sm:text-sm">開發者</div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">2.5M+</div>
                <div className="text-xs sm:text-sm">星標數</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 統計數據 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4 max-w-7xl mx-auto py-20 relative"
      >
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-3xl"></div>
        
        <div className="relative text-center mb-12 md:mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-800 mb-4">
              📊 實時數據
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                平台統計數據
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              實時追蹤開源生態系統的發展動態，見證技術創新的每一個瞬間
            </p>
          </motion.div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : statsError ? (
          <SimpleError message="無法載入統計數據" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-blue-100/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 group-hover:from-blue-500/10 group-hover:to-blue-600/20 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <FolderIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-blue-500/20 text-4xl md:text-6xl font-black">01</div>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors">
                  {stats?.totalRepositories?.toLocaleString()}
                </h3>
                <p className="text-slate-600 font-semibold text-base md:text-lg">總倉庫數</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="group relative bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-purple-100/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 group-hover:from-purple-500/10 group-hover:to-purple-600/20 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <UserGroupIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-purple-500/20 text-4xl md:text-6xl font-black">02</div>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2 md:mb-3 group-hover:text-purple-600 transition-colors">
                  {stats?.totalOwners?.toLocaleString()}
                </h3>
                <p className="text-slate-600 font-semibold text-base md:text-lg">開發者數量</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="group relative bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-amber-100/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 group-hover:from-amber-500/10 group-hover:to-amber-600/20 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300">
                    <StarIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-amber-500/20 text-4xl md:text-6xl font-black">03</div>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2 md:mb-3 group-hover:text-amber-600 transition-colors">
                  {stats?.totalStars?.toLocaleString()}
                </h3>
                <p className="text-slate-600 font-semibold text-base md:text-lg">總星數</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="group relative bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-emerald-100/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 group-hover:from-emerald-500/10 group-hover:to-emerald-600/20 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                    <ChartBarIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-emerald-500/20 text-4xl md:text-6xl font-black">04</div>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2 md:mb-3 group-hover:text-emerald-600 transition-colors">
                  {stats?.totalTopics?.toLocaleString()}
                </h3>
                <p className="text-slate-600 font-semibold text-base md:text-lg">主題數量</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.section>

      {/* 功能特色 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-4 max-w-7xl mx-auto py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            平台功能
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            強大的功能助您深入探索開源世界
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="group relative bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-slate-200/50 overflow-hidden"
              >
                {/* 背景裝飾 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/80 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-600/10 rounded-full blur-2xl group-hover:from-blue-500/10 group-hover:to-purple-600/20 transition-all duration-500"></div>
                
                <div className="relative">
                  {/* 圖標區域 */}
                  <div className="relative mb-4 md:mb-6">
                    <div className={`inline-flex p-4 md:p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <div className={`absolute -inset-2 bg-gradient-to-br ${feature.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                  </div>
                  
                  {/* 內容區域 */}
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-4 md:mb-6 leading-relaxed font-medium text-sm md:text-base">
                    {feature.description}
                  </p>
                  
                  {/* 按鈕 */}
                  <Link
                    to={feature.link}
                    className={`inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg text-sm md:text-base`}
                  >
                    <span>了解更多</span>
                    <ArrowRightIcon className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  
                  {/* 底部裝飾線 */}
                  <div className={`mt-4 md:mt-6 h-1 bg-gradient-to-r ${feature.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 熱門倉庫 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-4 max-w-7xl mx-auto py-16"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3 md:mb-4">
              熱門倉庫
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              發現最受歡迎的開源項目
            </p>
          </div>
          <Link
            to="/repositories"
            className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
          >
            查看更多
            <ArrowRightIcon className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </div>

        {reposLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : reposError ? (
          <SimpleError message="無法載入熱門倉庫" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {trendingRepos?.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="group relative bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-slate-200/50 overflow-hidden"
              >
                {/* 背景裝飾 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/80 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-orange-500/20 rounded-full blur-xl group-hover:from-yellow-500/20 group-hover:to-orange-500/30 transition-all duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div className="flex-1 pr-2">
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {repo.name}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 mb-2 font-semibold">
                        by {repo.owner}
                      </p>
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 md:px-4 py-1 md:py-2 rounded-2xl shadow-lg">
                      <StarIcon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                      <span className="font-black text-xs md:text-sm">
                        {repo.stars.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 md:mb-6 leading-relaxed font-medium text-sm md:text-base">
                    {repo.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 rounded-2xl text-xs md:text-sm font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200/50">
                        <CodeBracketIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        {repo.language}
                      </span>
                    </div>
                    <Link
                      to={`/repositories/${repo.id}`}
                      className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg text-sm md:text-base"
                    >
                      <span>查看詳情</span>
                      <EyeIcon className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-300" />
                    </Link>
                  </div>
                  
                  {/* 底部裝飾線 */}
                  <div className="mt-4 md:mt-6 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default HomePage;