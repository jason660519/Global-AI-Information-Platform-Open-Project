import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// 佈局組件
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ErrorFallback } from './components/ui/ErrorFallback';

// 懶加載頁面組件
const HomePage = React.lazy(() => import('./pages/HomePage'));
const RepositoriesPage = React.lazy(() => import('./pages/RepositoriesPage'));
const RepositoryDetailPage = React.lazy(() => import('./pages/RepositoryDetailPage'));
const OwnersPage = React.lazy(() => import('./pages/OwnersPage'));
const OwnerDetailPage = React.lazy(() => import('./pages/OwnerDetailPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const StatsPage = React.lazy(() => import('./pages/StatsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// 頁面加載組件
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
);

// 錯誤處理函數
const handleError = (error, errorInfo) => {
  console.error('Application Error:', error, errorInfo);
  // 這裡可以添加錯誤報告服務，如 Sentry
};

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* 首頁 */}
              <Route path="/" element={<HomePage />} />
              
              {/* 倉庫相關路由 */}
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/repositories/:id" element={<RepositoryDetailPage />} />
              
              {/* 擁有者相關路由 */}
              <Route path="/owners" element={<OwnersPage />} />
              <Route path="/owners/:id" element={<OwnerDetailPage />} />
              
              {/* 搜索頁面 */}
              <Route path="/search" element={<SearchPage />} />
              
              {/* 統計頁面 */}
              <Route path="/stats" element={<StatsPage />} />
              
              {/* 關於頁面 */}
              <Route path="/about" element={<AboutPage />} />
              
              {/* 404 頁面 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </ErrorBoundary>
  );
}

export default App;