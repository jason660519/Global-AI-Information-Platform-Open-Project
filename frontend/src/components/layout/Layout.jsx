import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <Header />
      
      <div className="flex">
        {/* 側邊欄 */}
        <Sidebar />
        
        {/* 主要內容區域 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* 底部 */}
      <Footer />
    </div>
  );
};

export default Layout;