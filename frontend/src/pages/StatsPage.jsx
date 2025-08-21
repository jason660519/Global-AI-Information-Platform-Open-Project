import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrendingUpIcon,
  StarIcon,
  EyeIcon,
  CodeBracketIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  GlobeAltIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { LoadingSpinner, SkeletonLoader } from '../components/ui/LoadingSpinner';
import { ErrorFallback } from '../components/ui/ErrorFallback';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('stars'); // stars, forks, issues, commits

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 模擬API延遲
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模擬統計數據
        const mockStats = {
          overview: {
            totalRepositories: 125000,
            totalUsers: 45000,
            totalOrganizations: 3200,
            totalStars: 2800000,
            totalForks: 850000,
            totalIssues: 125000,
            totalCommits: 5600000,
            activeRepositories: 89000,
          },
          trends: {
            repositories: {
              current: 125000,
              previous: 118000,
              change: 5.9
            },
            users: {
              current: 45000,
              previous: 42000,
              change: 7.1
            },
            stars: {
              current: 2800000,
              previous: 2650000,
              change: 5.7
            },
            commits: {
              current: 5600000,
              previous: 5200000,
              change: 7.7
            }
          },
          languageDistribution: [
            { name: 'JavaScript', value: 28.5, count: 35625, color: '#f7df1e' },
            { name: 'Python', value: 22.3, count: 27875, color: '#3776ab' },
            { name: 'TypeScript', value: 15.8, count: 19750, color: '#3178c6' },
            { name: 'Java', value: 12.4, count: 15500, color: '#ed8b00' },
            { name: 'Go', value: 8.9, count: 11125, color: '#00add8' },
            { name: 'Rust', value: 6.2, count: 7750, color: '#000000' },
            { name: 'C++', value: 3.8, count: 4750, color: '#00599c' },
            { name: 'Other', value: 2.1, count: 2625, color: '#8884d8' },
          ],
          monthlyActivity: [
            { month: '2023-07', repositories: 8500, users: 2800, stars: 185000, commits: 420000 },
            { month: '2023-08', repositories: 9200, users: 3100, stars: 198000, commits: 445000 },
            { month: '2023-09', repositories: 10100, users: 3400, stars: 215000, commits: 465000 },
            { month: '2023-10', repositories: 11200, users: 3800, stars: 235000, commits: 485000 },
            { month: '2023-11', repositories: 12500, users: 4200, stars: 258000, commits: 510000 },
            { month: '2023-12', repositories: 13800, users: 4600, stars: 275000, commits: 535000 },
            { month: '2024-01', repositories: 15200, users: 5100, stars: 295000, commits: 560000 },
          ],
          topRepositories: [
            { name: 'microsoft/vscode', stars: 158000, forks: 28000, language: 'TypeScript' },
            { name: 'facebook/react', stars: 220000, forks: 45000, language: 'JavaScript' },
            { name: 'vuejs/vue', stars: 207000, forks: 33000, language: 'TypeScript' },
            { name: 'angular/angular', stars: 93000, forks: 24000, language: 'TypeScript' },
            { name: 'nodejs/node', stars: 104000, forks: 28000, language: 'JavaScript' },
          ],
          topUsers: [
            { login: 'torvalds', followers: 150000, repos: 5, contributions: 12000 },
            { login: 'gaearon', followers: 85000, repos: 245, contributions: 8500 },
            { login: 'yyx990803', followers: 95000, repos: 180, contributions: 9200 },
            { login: 'sindresorhus', followers: 75000, repos: 1200, contributions: 15000 },
            { login: 'addyosmani', followers: 68000, repos: 320, contributions: 7800 },
          ],
          activityHeatmap: [
            { day: 'Mon', hour: 0, value: 12 },
            { day: 'Mon', hour: 1, value: 8 },
            { day: 'Mon', hour: 2, value: 5 },
            // ... 更多數據
          ],
          geographicDistribution: [
            { country: 'United States', users: 12500, percentage: 27.8 },
            { country: 'China', users: 8900, percentage: 19.8 },
            { country: 'India', users: 6200, percentage: 13.8 },
            { country: 'Germany', users: 3800, percentage: 8.4 },
            { country: 'United Kingdom', users: 3200, percentage: 7.1 },
            { country: 'Japan', users: 2800, percentage: 6.2 },
            { country: 'Canada', users: 2400, percentage: 5.3 },
            { country: 'Other', users: 5200, percentage: 11.6 },
          ]
        };
        
        setStats(mockStats);
      } catch (err) {
        setError('載入統計數據時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [timeRange]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (value) => {
    return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{formatPercentage(change)}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

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
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">數據統計</h1>
              <p className="text-gray-600">平台數據概覽和趨勢分析</p>
            </div>
            
            {/* 時間範圍選擇 */}
            <div className="flex space-x-2">
              {[
                { value: '7d', label: '7天' },
                { value: '30d', label: '30天' },
                { value: '90d', label: '90天' },
                { value: '1y', label: '1年' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <SkeletonLoader key={index} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, index) => (
                <SkeletonLoader key={index} className="h-80" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 概覽統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="總倉庫數"
                value={stats.overview.totalRepositories}
                change={stats.trends.repositories.change}
                icon={CodeBracketIcon}
                color="blue"
              />
              <StatCard
                title="總用戶數"
                value={stats.overview.totalUsers}
                change={stats.trends.users.change}
                icon={UserIcon}
                color="green"
              />
              <StatCard
                title="總星數"
                value={stats.overview.totalStars}
                change={stats.trends.stars.change}
                icon={StarIcon}
                color="yellow"
              />
              <StatCard
                title="總提交數"
                value={stats.overview.totalCommits}
                change={stats.trends.commits.change}
                icon={TrendingUpIcon}
                color="purple"
              />
            </div>

            {/* 圖表區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 月度活動趨勢 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">月度活動趨勢</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('zh-TW', { month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
                      formatter={(value, name) => [formatNumber(value), name === 'repositories' ? '倉庫' : name === 'users' ? '用戶' : name === 'stars' ? '星數' : '提交']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="repositories" stroke="#3b82f6" name="倉庫" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="#10b981" name="用戶" strokeWidth={2} />
                    <Line type="monotone" dataKey="stars" stroke="#f59e0b" name="星數" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* 程式語言分布 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">程式語言分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.languageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.languageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* 地理分布 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">地理分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.geographicDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="country" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatNumber(value), '用戶數']} />
                    <Bar dataKey="users" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* 提交活動熱力圖 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">提交活動分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('zh-TW', { month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
                      formatter={(value) => [formatNumber(value), '提交數']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="commits" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* 排行榜 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 熱門倉庫 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  熱門倉庫
                </h3>
                <div className="space-y-4">
                  {stats.topRepositories.map((repo, index) => (
                    <div key={repo.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{repo.name}</div>
                          <div className="text-sm text-gray-500">{repo.language}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600">
                          <StarIcon className="h-4 w-4 mr-1" />
                          <span>{formatNumber(repo.stars)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(repo.forks)} forks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 活躍用戶 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  活躍用戶
                </h3>
                <div className="space-y-4">
                  {stats.topUsers.map((user, index) => (
                    <div key={user.login} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">@{user.login}</div>
                          <div className="text-sm text-gray-500">{formatNumber(user.repos)} 倉庫</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {formatNumber(user.followers)} 關注者
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(user.contributions)} 貢獻
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;