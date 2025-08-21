import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  MapPinIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner, SkeletonLoader } from '../components/ui/LoadingSpinner';
import { ErrorFallback } from '../components/ui/ErrorFallback';

const OwnersPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // all, User, Organization
    sortBy: 'followers', // followers, public_repos, created_at
    minFollowers: '',
    location: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // 模擬API調用
  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 模擬API延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模擬數據
        const mockOwners = [
          {
            id: 1,
            login: 'torvalds',
            name: 'Linus Torvalds',
            type: 'User',
            avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
            bio: 'Creator of Linux and Git',
            location: 'Portland, OR',
            blog: 'https://github.com/torvalds',
            followers: 150000,
            following: 0,
            public_repos: 5,
            created_at: '2011-09-03T15:26:22Z',
            updated_at: '2024-01-15T10:30:00Z',
            company: 'Linux Foundation',
            email: null,
            hireable: null,
            twitter_username: null,
          },
          {
            id: 2,
            login: 'microsoft',
            name: 'Microsoft',
            type: 'Organization',
            avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
            bio: 'Open source projects and samples from Microsoft',
            location: 'Redmond, WA',
            blog: 'https://opensource.microsoft.com',
            followers: 45000,
            following: 0,
            public_repos: 6000,
            created_at: '2013-12-10T19:06:48Z',
            updated_at: '2024-01-15T08:45:00Z',
            company: null,
            email: 'opensource@microsoft.com',
            hireable: null,
            twitter_username: 'Microsoft',
          },
          {
            id: 3,
            login: 'gaearon',
            name: 'Dan Abramov',
            type: 'User',
            avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4',
            bio: 'Working on @reactjs. Co-author of Redux and Create React App.',
            location: 'London, UK',
            blog: 'https://overreacted.io',
            followers: 85000,
            following: 171,
            public_repos: 245,
            created_at: '2011-05-25T18:18:31Z',
            updated_at: '2024-01-14T16:20:00Z',
            company: '@facebook',
            email: null,
            hireable: null,
            twitter_username: 'dan_abramov',
          },
          {
            id: 4,
            login: 'google',
            name: 'Google',
            type: 'Organization',
            avatar_url: 'https://avatars.githubusercontent.com/u/1342004?v=4',
            bio: 'Google ❤️ Open Source',
            location: 'Mountain View, CA',
            blog: 'https://opensource.google/',
            followers: 75000,
            following: 0,
            public_repos: 2500,
            created_at: '2012-01-18T01:30:18Z',
            updated_at: '2024-01-15T12:00:00Z',
            company: null,
            email: 'opensource@google.com',
            hireable: null,
            twitter_username: 'Google',
          },
          {
            id: 5,
            login: 'octocat',
            name: 'The Octocat',
            type: 'User',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
            bio: 'GitHub mascot',
            location: 'San Francisco, CA',
            blog: 'https://github.blog',
            followers: 8500,
            following: 9,
            public_repos: 8,
            created_at: '2011-01-25T18:44:36Z',
            updated_at: '2024-01-10T14:30:00Z',
            company: '@github',
            email: 'octocat@github.com',
            hireable: null,
            twitter_username: null,
          },
          {
            id: 6,
            login: 'facebook',
            name: 'Meta',
            type: 'Organization',
            avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
            bio: 'We are working to build community through open source technology.',
            location: 'Menlo Park, CA',
            blog: 'https://opensource.fb.com',
            followers: 65000,
            following: 0,
            public_repos: 180,
            created_at: '2009-05-02T16:09:58Z',
            updated_at: '2024-01-15T09:15:00Z',
            company: null,
            email: 'opensource+github@fb.com',
            hireable: null,
            twitter_username: 'MetaOpenSource',
          },
        ];
        
        // 應用篩選
        let filteredOwners = mockOwners.filter(owner => {
          const matchesSearch = owner.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               (owner.name && owner.name.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchesType = filters.type === 'all' || owner.type === filters.type;
          const matchesMinFollowers = !filters.minFollowers || owner.followers >= parseInt(filters.minFollowers);
          const matchesLocation = !filters.location || 
                                 (owner.location && owner.location.toLowerCase().includes(filters.location.toLowerCase()));
          
          return matchesSearch && matchesType && matchesMinFollowers && matchesLocation;
        });
        
        // 排序
        filteredOwners.sort((a, b) => {
          switch (filters.sortBy) {
            case 'followers':
              return b.followers - a.followers;
            case 'public_repos':
              return b.public_repos - a.public_repos;
            case 'created_at':
              return new Date(a.created_at) - new Date(b.created_at);
            default:
              return 0;
          }
        });
        
        // 分頁
        const totalItems = filteredOwners.length;
        const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedOwners = filteredOwners.slice(startIndex, startIndex + itemsPerPage);
        
        setOwners(paginatedOwners);
        setTotalPages(totalPagesCount);
      } catch (err) {
        setError('載入開發者數據時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwners();
  }, [searchTerm, filters, currentPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 重置到第一頁
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (error) {
    return <ErrorFallback error={{ message: error }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">開發者與組織</h1>
            <p className="text-gray-600">探索活躍的開發者和組織，發現優秀的開源貢獻者</p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* 搜索和篩選 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 搜索框 */}
            <div className="space-y-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索開發者或組織..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* 篩選選項 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>篩選選項</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="input"
                >
                  <option value="all">所有類型</option>
                  <option value="User">個人開發者</option>
                  <option value="Organization">組織</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input"
                >
                  <option value="followers">按關注者排序</option>
                  <option value="public_repos">按倉庫數排序</option>
                  <option value="created_at">按創建時間排序</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="最少關注者數"
                  value={filters.minFollowers}
                  onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
                  className="input"
                />
                
                <input
                  type="text"
                  placeholder="地區"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 開發者列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <SkeletonLoader key={index} className="h-80" />
            ))}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {owners.map((owner, index) => (
                <motion.div
                  key={owner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-hover p-6"
                >
                  {/* 頭像和基本信息 */}
                  <div className="text-center mb-4">
                    <div className="relative inline-block">
                      <img
                        src={owner.avatar_url}
                        alt={owner.login}
                        className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white shadow-lg"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                        owner.type === 'Organization' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {owner.type === 'Organization' ? (
                          <BuildingOfficeIcon className="h-3 w-3 text-white" />
                        ) : (
                          <UserIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {owner.name || owner.login}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">@{owner.login}</p>
                    
                    {owner.bio && (
                      <p className="text-gray-600 text-sm text-ellipsis-2 mb-3">
                        {owner.bio}
                      </p>
                    )}
                  </div>

                  {/* 統計信息 */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(owner.followers)}
                      </div>
                      <div className="text-xs text-gray-500">關注者</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(owner.following)}
                      </div>
                      <div className="text-xs text-gray-500">關注中</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(owner.public_repos)}
                      </div>
                      <div className="text-xs text-gray-500">倉庫</div>
                    </div>
                  </div>

                  {/* 詳細信息 */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {owner.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{owner.location}</span>
                      </div>
                    )}
                    
                    {owner.company && (
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{owner.company}</span>
                      </div>
                    )}
                    
                    {owner.blog && (
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a
                          href={owner.blog}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate"
                        >
                          {owner.blog.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/owners/${owner.login}`}
                      className="btn-primary flex-1 text-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      查看詳情
                    </Link>
                    <a
                      href={`https://github.com/${owner.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline px-3"
                      title="在 GitHub 上查看"
                    >
                      <CodeBracketIcon className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-center items-center space-x-2"
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-outline p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    const pageNumber = currentPage <= 3 ? index + 1 : 
                                     currentPage >= totalPages - 2 ? totalPages - 4 + index :
                                     currentPage - 2 + index;
                    
                    if (pageNumber < 1 || pageNumber > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-outline p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* 空狀態 */}
        {!loading && owners.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到開發者</h3>
            <p className="text-gray-500 mb-4">嘗試調整搜索條件或篩選選項</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  type: 'all',
                  sortBy: 'followers',
                  minFollowers: '',
                  location: '',
                });
                setCurrentPage(1);
              }}
              className="btn-primary"
            >
              重置篩選
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OwnersPage;