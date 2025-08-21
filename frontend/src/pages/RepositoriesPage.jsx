import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner, { CardSkeleton } from '../components/ui/LoadingSpinner';
import { SimpleError } from '../components/ui/ErrorFallback';

// 模擬API調用
const fetchRepositories = async (params) => {
  // 這裡應該調用實際的API
  const mockData = {
    repositories: [
      {
        id: 1,
        name: 'awesome-react-components',
        full_name: 'facebook/react',
        description: '一個用於構建用戶界面的JavaScript庫，由Facebook開發和維護。',
        owner: {
          login: 'facebook',
          type: 'Organization',
          avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
        },
        language: 'JavaScript',
        stars_count: 218000,
        watchers_count: 6800,
        forks_count: 45000,
        created_at: '2013-05-24T16:15:54Z',
        updated_at: '2024-01-20T10:30:00Z',
        topics: ['react', 'javascript', 'library', 'ui'],
        license: 'MIT',
      },
      {
        id: 2,
        name: 'tensorflow',
        full_name: 'tensorflow/tensorflow',
        description: '一個開源的機器學習框架，適用於各種感知和語言理解任務。',
        owner: {
          login: 'tensorflow',
          type: 'Organization',
          avatar_url: 'https://avatars.githubusercontent.com/u/15658638?v=4',
        },
        language: 'Python',
        stars_count: 185000,
        watchers_count: 9200,
        forks_count: 74000,
        created_at: '2015-11-07T01:19:20Z',
        updated_at: '2024-01-20T08:45:00Z',
        topics: ['machine-learning', 'deep-learning', 'neural-network', 'python'],
        license: 'Apache-2.0',
      },
      {
        id: 3,
        name: 'vue',
        full_name: 'vuejs/vue',
        description: '漸進式JavaScript框架，易學易用，性能出色，適用於構建Web界面。',
        owner: {
          login: 'vuejs',
          type: 'Organization',
          avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
        },
        language: 'TypeScript',
        stars_count: 207000,
        watchers_count: 6200,
        forks_count: 33000,
        created_at: '2013-07-29T03:24:51Z',
        updated_at: '2024-01-19T22:15:00Z',
        topics: ['vue', 'javascript', 'framework', 'frontend'],
        license: 'MIT',
      },
    ],
    total: 125000,
    page: parseInt(params.page) || 1,
    per_page: parseInt(params.per_page) || 20,
    total_pages: Math.ceil(125000 / (parseInt(params.per_page) || 20)),
  };
  
  // 模擬網絡延遲
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData;
};

const RepositoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');

  // 從URL參數獲取當前狀態
  const currentParams = useMemo(() => ({
    page: parseInt(searchParams.get('page')) || 1,
    per_page: parseInt(searchParams.get('per_page')) || 20,
    sort: searchParams.get('sort') || 'stars',
    order: searchParams.get('order') || 'desc',
    language: searchParams.get('language') || '',
    q: searchParams.get('q') || '',
    min_stars: searchParams.get('min_stars') || '',
    owner_type: searchParams.get('owner_type') || '',
  }), [searchParams]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['repositories', currentParams],
    queryFn: () => fetchRepositories(currentParams),
  });

  // 更新URL參數
  const updateParams = (newParams) => {
    const updatedParams = { ...currentParams, ...newParams, page: 1 };
    Object.keys(updatedParams).forEach(key => {
      if (!updatedParams[key]) {
        delete updatedParams[key];
      }
    });
    setSearchParams(updatedParams);
  };

  // 處理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: localSearch });
  };

  // 處理分頁
  const handlePageChange = (page) => {
    setSearchParams({ ...currentParams, page });
  };

  // 排序選項
  const sortOptions = [
    { value: 'stars', label: '星數', icon: StarIcon },
    { value: 'updated', label: '更新時間', icon: CalendarIcon },
    { value: 'created', label: '創建時間', icon: CalendarIcon },
    { value: 'name', label: '名稱', icon: CodeBracketIcon },
  ];

  // 語言選項
  const languageOptions = [
    'JavaScript',
    'Python',
    'Java',
    'TypeScript',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
  ];

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GitHub 倉庫</h1>
          <p className="text-gray-600 mt-1">
            探索和發現優秀的開源項目
            {data && (
              <span className="ml-2 text-sm">
                (共 {data.total.toLocaleString()} 個倉庫)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
          篩選器
        </button>
      </div>

      {/* 搜索和篩選 */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="搜索倉庫名稱、描述、主題..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>

        {/* 篩選器 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 排序 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排序方式
                  </label>
                  <select
                    value={currentParams.sort}
                    onChange={(e) => updateParams({ sort: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 語言 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    程式語言
                  </label>
                  <select
                    value={currentParams.language}
                    onChange={(e) => updateParams({ language: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">所有語言</option>
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 最小星數 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最小星數
                  </label>
                  <input
                    type="number"
                    value={currentParams.min_stars}
                    onChange={(e) => updateParams({ min_stars: e.target.value })}
                    placeholder="例如: 1000"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 擁有者類型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    擁有者類型
                  </label>
                  <select
                    value={currentParams.owner_type}
                    onChange={(e) => updateParams({ owner_type: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">所有類型</option>
                    <option value="User">個人</option>
                    <option value="Organization">組織</option>
                  </select>
                </div>
              </div>

              {/* 清除篩選器 */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setLocalSearch('');
                    setSearchParams({});
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  清除篩選器
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 倉庫列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <SimpleError message="無法載入倉庫列表" onRetry={refetch} />
      ) : (
        <div className="space-y-6">
          {/* 倉庫卡片 */}
          <div className="grid grid-cols-1 gap-6">
            {data?.repositories?.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 倉庫標題 */}
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <Link
                          to={`/repositories/${repo.id}`}
                          className="text-xl font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {repo.name}
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{repo.owner.login}</span>
                          {repo.owner.type === 'Organization' ? (
                            <BuildingOfficeIcon className="h-4 w-4" />
                          ) : (
                            <UserIcon className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 描述 */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {repo.description}
                    </p>

                    {/* 主題標籤 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.topics.slice(0, 5).map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{repo.topics.length - 5} 更多
                        </span>
                      )}
                    </div>

                    {/* 統計信息 */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4" />
                        <span>{repo.stars_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{repo.watchers_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CodeBracketIcon className="h-4 w-4" />
                        <span>{repo.forks_count.toLocaleString()} forks</span>
                      </div>
                      {repo.language && (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>更新於 {formatDate(repo.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 分頁 */}
          {data && data.total_pages > 1 && (
            <div className="flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentParams.page - 1))}
                  disabled={currentParams.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                
                {/* 頁碼 */}
                {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                  const page = Math.max(1, currentParams.page - 2) + i;
                  if (page > data.total_pages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentParams.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(Math.min(data.total_pages, currentParams.page + 1))}
                  disabled={currentParams.page === data.total_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoriesPage;