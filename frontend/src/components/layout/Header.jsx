import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: '首頁', href: '/', current: location.pathname === '/' },
    { name: '倉庫', href: '/repositories', current: location.pathname.startsWith('/repositories') },
    { name: '開發者', href: '/owners', current: location.pathname.startsWith('/owners') },
    { name: '統計', href: '/stats', current: location.pathname === '/stats' },
    { name: '搜索', href: '/search', current: location.pathname === '/search' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo 和品牌 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-black text-lg">AI</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  全球 AI 資訊平台
                </span>
                <div className="text-xs text-slate-500 font-medium">Global AI Information Platform</div>
              </div>
            </Link>
          </div>

          {/* 桌面導航 */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.href}
                  className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group overflow-hidden ${
                    item.current
                      ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
                  }`}
                >
                  {item.current && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                  {item.current && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0.9 }}
                    />
                  )}
                  {!item.current && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* 搜索框 */}
          <div className="flex items-center space-x-4">
            <motion.form 
              onSubmit={handleSearch} 
              className="hidden sm:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="relative group">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </motion.div>
                <motion.input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索倉庫、開發者..."
                  className="block w-80 pl-12 pr-4 py-3 bg-slate-50/80 border border-slate-200/50 rounded-2xl leading-5 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-sm font-medium"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 rounded-2xl"
                  initial={{ opacity: 0 }}
                  whileFocus={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.form>

            {/* 移動端菜單按鈕 */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-3 rounded-2xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 移動端菜單 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20 shadow-xl"
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
                      item.current
                        ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/80'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              {/* 移動端搜索 */}
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <motion.form 
                  onSubmit={handleSearch}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative group">
                    <motion.div 
                      className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </motion.div>
                    <motion.input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索倉庫、開發者..."
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50/80 border border-slate-200/50 rounded-2xl leading-5 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-base font-medium"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 rounded-2xl"
                      initial={{ opacity: 0 }}
                      whileFocus={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;