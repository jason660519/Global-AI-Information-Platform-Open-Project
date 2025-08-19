// 使用動態導入來支持ES模塊
let DataCleaner;

beforeAll(async () => {
  const module = await import('../src/data/processors/data-cleaner.js');
  DataCleaner = module.DataCleaner;
});

describe('Data Cleaner Tests', () => {
  const rawRepositoryData = {
    name: 'test-repo',
    full_name: 'user/test-repo',
    description: '<p>A test repository with <strong>HTML</strong> content</p>',
    html_url: 'https://github.com/user/test-repo',
    stargazers_count: 100,
    forks_count: 20,
    language: 'JavaScript',
    topics: ['test', 'demo'],
    owner: {
      login: 'testuser',
      avatar_url: 'https://github.com/testuser.png'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    license: {
      name: 'MIT License',
      spdx_id: 'MIT'
    },
    watchers_count: 50,
    open_issues_count: 5,
    default_branch: 'main',
    homepage: 'https://example.com'
  };

  test('should clean repository data correctly', () => {
    const cleaned = DataCleaner.cleanRepositoryData(rawRepositoryData);
    
    expect(cleaned).toBeDefined();
    expect(cleaned.name).toBe('test-repo');
    expect(cleaned.full_name).toBe('user/test-repo');
    expect(cleaned.url).toBe('https://github.com/user/test-repo');
    expect(cleaned.stars).toBe(100);
    expect(cleaned.forks).toBe(20);
    expect(cleaned.language).toBe('JavaScript');
    expect(cleaned.topics).toEqual(['test', 'demo']);
    expect(cleaned.owner).toBe('testuser');
    expect(cleaned.created_at).toBe('2024-01-01T00:00:00Z');
    expect(cleaned.updated_at).toBe('2024-01-02T00:00:00Z');
  });

  test('should clean HTML from description', () => {
    const cleaned = DataCleaner.cleanRepositoryData(rawRepositoryData);
    
    expect(cleaned.description).toBe('A test repository with HTML content');
    expect(cleaned.description).not.toContain('<p>');
    expect(cleaned.description).not.toContain('<strong>');
  });

  test('should handle missing optional fields', () => {
    const minimalData = {
      name: 'minimal-repo',
      full_name: 'user/minimal-repo',
      html_url: 'https://github.com/user/minimal-repo',
      stargazers_count: 0,
      forks_count: 0,
      owner: { login: 'user' }
    };
    
    const cleaned = DataCleaner.cleanRepositoryData(minimalData);
    
    expect(cleaned).toBeDefined();
    expect(cleaned.name).toBe('minimal-repo');
    expect(cleaned.description).toBe('');
    expect(cleaned.language).toBe('');
    expect(cleaned.topics).toEqual([]);
    expect(cleaned.license).toEqual({});
  });

  test('should validate URLs correctly', () => {
    expect(DataCleaner.isValidUrl('https://example.com')).toBe(true);
    expect(DataCleaner.isValidUrl('http://example.com')).toBe(true);
    expect(DataCleaner.isValidUrl('ftp://example.com')).toBe(false);
    expect(DataCleaner.isValidUrl('invalid-url')).toBe(false);
    expect(DataCleaner.isValidUrl('')).toBe(false);
    expect(DataCleaner.isValidUrl(null)).toBe(false);
  });

  test('should extract links from HTML', () => {
    const html = '<p>Check out <a href="https://example.com">this link</a> and <a href="https://github.com">GitHub</a></p>';
    const links = DataCleaner.extractLinks(html);
    
    expect(links).toEqual(['https://example.com', 'https://github.com']);
  });

  test('should extract images from HTML', () => {
    const html = '<p>Here is an image: <img src="https://example.com/image.png" alt="test"> and another <img src="https://github.com/logo.svg"></p>';
    const images = DataCleaner.extractImages(html);
    
    expect(images).toEqual(['https://example.com/image.png', 'https://github.com/logo.svg']);
  });

  test('should handle null or undefined input', () => {
    expect(() => DataCleaner.cleanRepositoryData(null)).not.toThrow();
    expect(() => DataCleaner.cleanRepositoryData(undefined)).not.toThrow();
    
    const cleanedNull = DataCleaner.cleanRepositoryData(null);
    expect(cleanedNull).toBeDefined();
  });

  test('should preserve metadata structure', () => {
    const cleaned = DataCleaner.cleanRepositoryData(rawRepositoryData);
    
    expect(cleaned.metadata).toBeDefined();
    expect(cleaned.metadata.watchers).toBe(50);
    expect(cleaned.metadata.open_issues).toBe(5);
    expect(cleaned.metadata.default_branch).toBe('main');
  });

  test('should handle invalid homepage URL', () => {
    const dataWithInvalidHomepage = {
      ...rawRepositoryData,
      homepage: 'invalid-url'
    };
    
    const cleaned = DataCleaner.cleanRepositoryData(dataWithInvalidHomepage);
    expect(cleaned.homepage).toBe(''); // 應該被清空
  });
});