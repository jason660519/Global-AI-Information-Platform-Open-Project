import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  TagIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const location = useLocation();

  const navigation = [
    {
      name: '首頁',
      href: '/',
      icon: HomeIcon,
      current: location.pathname === '/',
    },
    {
      name: '倉庫',
      href: '/repositories',
      icon: FolderIcon,
      current: location.pathname.startsWith('/repositories'),
      children: [
        { name: '熱門倉庫', href: '/repositories?sort=stars' },
        { name: '最新倉庫', href: '/repositories?sort=created' },
        { name: '最活躍', href: '/repositories?sort=updated' },
      ],
    },
    {
      name: '開發者',
      href: '/owners',
      icon: UserGroupIcon,
      current: location.pathname.startsWith('/owners'),
      children: [
        { name: '個人開發者', href: '/owners?type=User' },
        { name: '組織', href: '/owners?type=Organization' },
        { name: '頂級開發者', href: '/owners?sort=followers' },
      ],
    },
    {
      name: '主題',
      href: '/topics',
      icon: TagIcon,
      current: location.pathname.startsWith('/topics'),
    },
    {
      name: '統計',
      href: '/stats',
      icon: ChartBarIcon,
      current: location.pathname === '/stats',
    },
    {
      name: '搜索',
      href: '/search',
      icon: MagnifyingGlassIcon,
      current: location.pathname === '/search',
    },
    {
      name: '關於',
      href: '/about',
      icon: InformationCircleIcon,
      current: location.pathname === '/about',
    },
  ];

  const toggleExpanded = (itemName) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0, width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen sticky top-0 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 側邊欄頭部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FolderIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">GitHub 平台</span>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* 導航菜單 */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isExpanded = expandedItems.has(item.name);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navigation.indexOf(item) * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 主菜單項 */}
              <div className="flex items-center">
                <Link
                  to={item.href}
                  className={`group flex items-center flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${
                    item.current
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.current && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                      item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                    }`}
                  />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
                
                {/* 展開/收起按鈕 */}
                {hasChildren && !isCollapsed && (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className="p-1 ml-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <ChevronRightIcon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* 子菜單 */}
              {hasChildren && !isCollapsed && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="ml-6 mt-1 space-y-1"
                >
                  {item.children.map((child, childIndex) => (
                    <motion.div
                      key={child.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: childIndex * 0.05, duration: 0.2 }}
                      whileHover={{ x: 4 }}
                    >
                      <Link
                        to={child.href}
                        className={`group block px-3 py-2 text-sm rounded-lg transition-all duration-200 relative ${
                          child.current
                            ? 'text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                        }`}
                      >
                        {child.current && (
                          <motion.div
                            layoutId="activeSubTab"
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <motion.span
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.1 }}
                        >
                          {child.name}
                        </motion.span>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* 側邊欄底部 */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>GitHub 倉庫信息平台</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;