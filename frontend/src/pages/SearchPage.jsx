import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner, SkeletonLoader } from '../components/ui/LoadingSpinner';
import { ErrorFallback } from '../components/ui/ErrorFallback';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, repositories, users, organizations
  const [results, setResults] = useState({
    repositories: [],
    users: [],
    organizations: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    language: '',
    minStars: '',
    minFollowers: '',
    location: '',
    sortBy: 'relevance', // relevance, stars, updated, created
    dateRange: 'all', // all, day, week, month, year
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // 從localStorage載入搜索歷史
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // 執行搜索
  const performSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 模擬API延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模擬搜索結果
      const mockRepositories = [
        {
          id: 1,
          name: 'react',
          full_name: 'facebook/react',
          description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
          owner: {
            login: 'facebook',
            avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
            type: 'Organization'
          },
          stargazers_count: 220000,
          watchers_count: 220000,
          forks_count: 45000,
          language: 'JavaScript',
          topics: ['react', 'javascript', 'library', 'ui'],
          created_at: '2013-05-24T16:15:54Z',
          updated_at: '2024-01-15T10:30:00Z',
          pushed_at: '2024-01-15T08:45:00Z',
          size: 20000,
          open_issues_count: 800,
          license: { name: 'MIT License' },
          default_branch: 'main'
        },
        {
          id: 2,
          name: 'vue',
          full_name: 'vuejs/vue',
          description: '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework.',
          owner: {
            login: 'vuejs',
            avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
            type: 'Organization'
          },
          stargazers_count: 207000,
          watchers_count: 207000,
          forks_count: 33000,
          language: 'TypeScript',
          topics: ['vue', 'javascript', 'framework', 'frontend'],
          created_at: '2013-07-29T03:24:51Z',
          updated_at: '2024-01-14T16:20:00Z',
          pushed_at: '2024-01-14T14:30:00Z',
          size: 34000,
          open_issues_count: 500,
          license: { name: 'MIT License' },
          default_branch: 'main'
        }
      ];

      const mockUsers = [
        {
          id: 1,
          login: 'gaearon',
          name: 'Dan Abramov',
          avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4',
          bio: 'Working on @reactjs. Co-author of Redux and Create React App.',
          location: 'London, UK',
          followers: 85000,
          following: 171,
          public_repos: 245,
          type: 'User'
        },
        {
          id: 2,
          login: 'yyx990803',
          name: 'Evan You',
          avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4',
          bio: 'Creator of Vue.js, Vite, and Vitest.',
          location: 'Singapore',
          followers: 95000,
          following: 20,
          public_repos: 180,
          type: 'User'
        }
      ];

      const mockOrganizations = [
        {
          id: 1,
          login: 'facebook',
          name: 'Meta',
          avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
          description: 'We are working to build community through open source technology.',
          location: 'Menlo Park, CA',
          followers: 65000,
          public_repos: 180,
          type: 'Organization'
        },
        {
          id: 2,
          login: 'microsoft',
          name: 'Microsoft',
          avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
          description: 'Open source projects and samples from Microsoft',
          location: 'Redmond, WA',
          followers: 45000,
          public_repos: 6000,
          type: 'Organization'
        }
      ];

      // 根據搜索類型篩選結果
      let filteredResults = {
        repositories: searchType === 'all' || searchType === 'repositories' ? mockRepositories : [],
        users: searchType === 'all' || searchType === 'users' ? mockUsers : [],
        organizations: searchType === 'all' || searchType === 'organizations' ? mockOrganizations : [],
        total: 0
      };

      filteredResults.total = filteredResults.repositories.length + 
                             filteredResults.users.length + 
                             filteredResults.organizations.length;

      setResults(filteredResults);

      // 更新搜索歷史
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    } catch (err) {
      setError('搜索時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return <ErrorFallback error={{ message: error }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 搜索區域 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-6">搜索</h1>
            
            {/* 搜索表單 */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索倉庫、開發者或組織..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 text-lg py-3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || loading}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    '搜索'
                  )}
                </button>
              </div>
              
              {/* 搜索類型選擇 */}
              <div className="flex space-x-4">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'repositories', label: '倉庫' },
                  { value: 'users', label: '用戶' },
                  { value: 'organizations', label: '組織' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSearchType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>篩選</span>
                </button>
              </div>
            </form>
            
            {/* 搜索歷史 */}
            {searchHistory.length > 0 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">搜索歷史</h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    清除
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(query);
                        performSearch(query);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 篩選面板 */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-100 border-b"
        >
          <div className="container-custom py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="程式語言"
                value={filters.language}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                className="input"
              />
              <input
                type="number"
                placeholder="最少星數"
                value={filters.minStars}
                onChange={(e) => setFilters(prev => ({ ...prev, minStars: e.target.value }))}
                className="input"
              />
              <input
                type="number"
                placeholder="最少關注者"
                value={filters.minFollowers}
                onChange={(e) => setFilters(prev => ({ ...prev, minFollowers: e.target.value }))}
                className="input"
              />
              <input
                type="text"
                placeholder="地區"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="container-custom py-8">
        {/* 搜索結果 */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, index) => (
              <SkeletonLoader key={index} className="h-32" />
            ))}
          </div>
        ) : results.total > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* 結果統計 */}
            <div className="text-gray-600">
              找到 <span className="font-semibold text-gray-900">{results.total}</span> 個結果
            </div>

            {/* 倉庫結果 */}
            {results.repositories.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CodeBracketIcon className="h-5 w-5 mr-2" />
                  倉庫 ({results.repositories.length})
                </h2>
                <div className="space-y-4">
                  {results.repositories.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="card p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <img
                              src={repo.owner.avatar_url}
                              alt={repo.owner.login}
                              className="w-6 h-6 rounded-full"
                            />
                            <Link
                              to={`/repositories/${repo.full_name}`}
                              className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                            >
                              {repo.full_name}
                            </Link>
                          </div>
                          
                          {repo.description && (
                            <p className="text-gray-600 mb-3">{repo.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="h-4 w-4" />
                              <span>{formatNumber(repo.stargazers_count)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <EyeIcon className="h-4 w-4" />
                              <span>{formatNumber(repo.watchers_count)}</span>
                            </div>
                            {repo.language && (
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>更新於 {formatDate(repo.updated_at)}</span>
                            </div>
                          </div>
                          
                          {repo.topics && repo.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {repo.topics.slice(0, 5).map((topic) => (
                                <span
                                  key={topic}
                                  className="badge-secondary"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 用戶結果 */}
            {results.users.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  用戶 ({results.users.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="card p-6 text-center"
                    >
                      <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-16 h-16 rounded-full mx-auto mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {user.name || user.login}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">@{user.login}</p>
                      {user.bio && (
                        <p className="text-gray-600 text-sm mb-3 text-ellipsis-2">
                          {user.bio}
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(user.followers)}
                          </div>
                          <div className="text-gray-500">關注者</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(user.following)}
                          </div>
                          <div className="text-gray-500">關注中</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(user.public_repos)}
                          </div>
                          <div className="text-gray-500">倉庫</div>
                        </div>
                      </div>
                      <Link
                        to={`/owners/${user.login}`}
                        className="btn-primary w-full mt-4"
                      >
                        查看詳情
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 組織結果 */}
            {results.organizations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  組織 ({results.organizations.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.organizations.map((org, index) => (
                    <motion.div
                      key={org.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="card p-6 text-center"
                    >
                      <img
                        src={org.avatar_url}
                        alt={org.login}
                        className="w-16 h-16 rounded-full mx-auto mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {org.name || org.login}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">@{org.login}</p>
                      {org.description && (
                        <p className="text-gray-600 text-sm mb-3 text-ellipsis-2">
                          {org.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(org.followers)}
                          </div>
                          <div className="text-gray-500">關注者</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatNumber(org.public_repos)}
                          </div>
                          <div className="text-gray-500">倉庫</div>
                        </div>
                      </div>
                      <Link
                        to={`/owners/${org.login}`}
                        className="btn-primary w-full mt-4"
                      >
                        查看詳情
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : searchQuery && !loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到結果</h3>
            <p className="text-gray-500 mb-4">嘗試使用不同的關鍵字或調整篩選條件</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">開始搜索</h3>
            <p className="text-gray-500">輸入關鍵字來搜索倉庫、開發者或組織</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;