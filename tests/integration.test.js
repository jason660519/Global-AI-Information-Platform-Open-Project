const fs = require('fs');
const path = require('path');

// 簡單的集成測試
describe('Integration Tests', () => {
  test('should have all required files', () => {
    const requiredFiles = [
      'src/crawlers/sources/github-crawler.js',
      'src/exporters/csv-exporter.js',
      'src/data/processors/data-cleaner.js',
      'src/uploaders/supabase-uploader.js',
      'package.json'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should have exports directory', () => {
    const exportsDir = path.join(__dirname, '..', 'exports');
    expect(fs.existsSync(exportsDir)).toBe(true);
  });

  test('should have valid package.json', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    expect(packageJson.name).toBe('global-ai-info-platform');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.dependencies).toBeDefined();
  });

  test('should have required dependencies', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const requiredDeps = ['axios', 'cheerio', 'csv-writer', 'winston'];
    
    requiredDeps.forEach(dep => {
      expect(packageJson.dependencies[dep] || packageJson.devDependencies[dep]).toBeDefined();
    });
  });

  test('should have configuration files', () => {
    const configFiles = [
      '.prettierrc',
      '.prettierignore',
      'eslint.config.js',
      'jest.config.cjs'
    ];

    configFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});