// 使用動態導入來支持ES模塊
let CSVExporter;

beforeAll(async () => {
  const module = await import('../src/exporters/csv-exporter.js');
  CSVExporter = module.CSVExporter;
});
const fs = require('fs');
const path = require('path');

describe('CSV Exporter Tests', () => {
  let exporter;
  const testData = [
    {
      name: 'test-repo',
      full_name: 'user/test-repo',
      description: 'A test repository',
      url: 'https://github.com/user/test-repo',
      stars: 100,
      forks: 20,
      language: 'JavaScript',
      topics: ['test', 'demo'],
      owner: { login: 'user' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      license: { name: 'MIT' },
      metadata: {
        watchers: 50,
        open_issues: 5,
        default_branch: 'main'
      }
    }
  ];

  beforeEach(() => {
    exporter = new CSVExporter();
  });

  afterEach(() => {
    // 清理測試生成的文件
    const exportsDir = path.join(__dirname, '../exports');
    if (fs.existsSync(exportsDir)) {
      const files = fs.readdirSync(exportsDir);
      files.forEach(file => {
        if (file.includes('test')) {
          fs.unlinkSync(path.join(exportsDir, file));
        }
      });
    }
  });

  test('should create CSVExporter instance', () => {
    expect(exporter).toBeInstanceOf(CSVExporter);
    expect(exporter.outputDir).toContain('exports');
  });

  test('should export repositories to CSV', async () => {
    const filePath = await exporter.exportRepositories(testData, 'test-export');
    
    expect(filePath).toBeDefined();
    expect(fs.existsSync(filePath)).toBe(true);
    
    // 檢查文件內容
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('Name,Full Name,Description');
    expect(content).toContain('test-repo');
    expect(content).toContain('user/test-repo');
    expect(content).toContain('A test repository');
  });

  test('should handle empty data array', async () => {
    const filePath = await exporter.exportRepositories([], 'test-empty');
    
    expect(filePath).toBeDefined();
    expect(fs.existsSync(filePath)).toBe(true);
    
    // 檢查文件只包含標題行
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    expect(lines.length).toBe(1); // 只有標題行
    expect(lines[0]).toContain('Name,Full Name,Description');
  });

  test('should generate unique filename with timestamp', async () => {
    const filePath1 = await exporter.exportRepositories(testData);
    
    // 等待一毫秒確保時間戳不同
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const filePath2 = await exporter.exportRepositories(testData);
    
    expect(filePath1).not.toBe(filePath2);
    expect(fs.existsSync(filePath1)).toBe(true);
    expect(fs.existsSync(filePath2)).toBe(true);
  });

  test('should handle missing optional fields', async () => {
    const incompleteData = [{
      name: 'incomplete-repo',
      full_name: 'user/incomplete-repo',
      url: 'https://github.com/user/incomplete-repo',
      stars: 0,
      forks: 0
      // 缺少其他可選字段
    }];
    
    const filePath = await exporter.exportRepositories(incompleteData, 'test-incomplete');
    
    expect(filePath).toBeDefined();
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('incomplete-repo');
  });
});