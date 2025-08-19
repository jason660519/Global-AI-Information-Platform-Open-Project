// 使用動態導入來支持ES模塊
let GitHubCrawler;

beforeAll(async () => {
  const module = await import('../src/crawlers/sources/github-crawler.js');
  GitHubCrawler = module.GitHubCrawler;
});
const fs = require('fs');
const path = require('path');

describe('GitHub Crawler Tests', () => {
  let crawler;
  const testExportsDir = path.join(__dirname, '../exports');

  beforeEach(() => {
    crawler = new GitHubCrawler();
  });

  afterEach(() => {
    // 清理測試生成的文件
    if (fs.existsSync(testExportsDir)) {
      const files = fs.readdirSync(testExportsDir);
      files.forEach(file => {
        if (file.includes('test')) {
          fs.unlinkSync(path.join(testExportsDir, file));
        }
      });
    }
  });

  test('should create GitHubCrawler instance', () => {
    expect(crawler).toBeInstanceOf(GitHubCrawler);
    expect(crawler.baseUrl).toBe('https://github.com');
  });

  test('should crawl trending repositories with limit', async () => {
    const result = await crawler.crawlTrendingRepositories({
      limit: 2,
      exportCSV: false,
      uploadToSupabase: false
    });

    expect(result).toBeDefined();
    expect(result.repositories).toBeDefined();
    expect(Array.isArray(result.repositories)).toBe(true);
    expect(result.repositories.length).toBeGreaterThan(0);
    expect(result.repositories.length).toBeLessThanOrEqual(2);
  }, 30000);

  test('should export CSV when enabled', async () => {
    const result = await crawler.crawlTrendingRepositories({
      limit: 1,
      exportCSV: true,
      uploadToSupabase: false
    });

    expect(result.csvPath).toBeDefined();
    expect(fs.existsSync(result.csvPath)).toBe(true);
    
    // 檢查CSV文件內容
    const csvContent = fs.readFileSync(result.csvPath, 'utf8');
    expect(csvContent).toContain('Name,Full Name,Description');
  }, 30000);

  test('should handle errors gracefully', async () => {
    // 測試無效的選項
    const result = await crawler.crawlTrendingRepositories({
      limit: 0,
      exportCSV: false,
      uploadToSupabase: false
    });

    expect(result).toBeDefined();
    expect(result.repositories).toBeDefined();
  });

  test('should validate repository data structure', async () => {
    const result = await crawler.crawlTrendingRepositories({
      limit: 1,
      exportCSV: false,
      uploadToSupabase: false
    });

    if (result.repositories.length > 0) {
      const repo = result.repositories[0];
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('full_name');
      expect(repo).toHaveProperty('url');
      expect(repo).toHaveProperty('stars');
      expect(repo).toHaveProperty('forks');
      expect(typeof repo.stars).toBe('number');
      expect(typeof repo.forks).toBe('number');
    }
  }, 30000);
});