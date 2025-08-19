module.exports = {
  // 測試環境
  testEnvironment: 'node',
  
  // 測試文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/*.(test|spec).js'
  ],
  
  // 覆蓋率收集
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  
  // 覆蓋率報告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 覆蓋率輸出目錄
  coverageDirectory: 'coverage',
  
  // 測試超時時間（毫秒）
  testTimeout: 30000,
  
  // 設置文件
  setupFilesAfterEnv: [],
  

  
  // 忽略的文件和目錄
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // 轉換忽略模式
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  
  // 詳細輸出
  verbose: true,
  
  // 清理模擬
  clearMocks: true,
  
  // 恢復模擬
  restoreMocks: true
};