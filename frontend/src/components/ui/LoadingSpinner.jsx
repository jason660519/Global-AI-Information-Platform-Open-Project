import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  text = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600',
  };

  const spinner = (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <motion.div
        className={clsx(
          'border-2 border-current border-t-transparent rounded-full',
          sizeClasses[size],
          colorClasses[color]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'mt-2 text-sm font-medium',
            colorClasses[color]
          )}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// 骨架屏組件
const SkeletonLoader = ({ className = '', lines = 3, height = 'h-4' }) => {
  return (
    <div className={clsx('animate-pulse space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'bg-gray-200 rounded',
            height,
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// 卡片骨架屏
const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={clsx('animate-pulse', className)}>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
};

// 表格骨架屏
const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={clsx('animate-pulse', className)}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 表頭 */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        </div>
        
        {/* 表格行 */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={clsx(
                    'h-4 bg-gray-200 rounded flex-1',
                    colIndex === 0 ? 'w-1/4' : '',
                    colIndex === columns - 1 ? 'w-1/6' : ''
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { LoadingSpinner, SkeletonLoader, CardSkeleton, TableSkeleton };
export default LoadingSpinner;