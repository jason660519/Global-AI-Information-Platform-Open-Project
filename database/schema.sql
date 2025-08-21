-- GitHub 倉庫信息平台 - PostgreSQL 資料庫結構
-- 創建時間: 2024

-- 創建資料庫（如果需要）
-- CREATE DATABASE github_repos_dev;

-- 使用資料庫
-- \c github_repos_dev;

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用於文本搜索

-- 創建 owners 表（倉庫擁有者）
CREATE TABLE IF NOT EXISTS owners (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    github_id INTEGER UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    html_url VARCHAR(500),
    type VARCHAR(50) CHECK (type IN ('User', 'Organization')),
    site_admin BOOLEAN DEFAULT false,
    name VARCHAR(255),
    company VARCHAR(255),
    blog VARCHAR(500),
    location VARCHAR(255),
    email VARCHAR(255),
    bio TEXT,
    public_repos INTEGER DEFAULT 0,
    public_gists INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建 repositories 表（倉庫信息）
CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    github_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    html_url VARCHAR(500) NOT NULL,
    clone_url VARCHAR(500),
    ssh_url VARCHAR(500),
    git_url VARCHAR(500),
    svn_url VARCHAR(500),
    homepage VARCHAR(500),
    language VARCHAR(100),
    stargazers_count INTEGER DEFAULT 0,
    watchers_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    open_issues_count INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0, -- KB
    default_branch VARCHAR(100) DEFAULT 'main',
    is_private BOOLEAN DEFAULT false,
    is_fork BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_disabled BOOLEAN DEFAULT false,
    has_issues BOOLEAN DEFAULT true,
    has_projects BOOLEAN DEFAULT true,
    has_wiki BOOLEAN DEFAULT true,
    has_pages BOOLEAN DEFAULT false,
    has_downloads BOOLEAN DEFAULT true,
    has_discussions BOOLEAN DEFAULT false,
    license_key VARCHAR(100),
    license_name VARCHAR(255),
    license_url VARCHAR(500),
    topics TEXT[], -- PostgreSQL 數組類型
    visibility VARCHAR(50) DEFAULT 'public',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    pushed_at TIMESTAMP,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id INTEGER REFERENCES owners(id) ON DELETE CASCADE
);

-- 創建 languages 表（程式語言統計）
CREATE TABLE IF NOT EXISTS repository_languages (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    language VARCHAR(100) NOT NULL,
    bytes INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, language)
);

-- 創建 topics 表（主題標籤）
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建 repository_topics 關聯表
CREATE TABLE IF NOT EXISTS repository_topics (
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (repository_id, topic_id)
);

-- 創建 crawl_logs 表（爬蟲日誌）
CREATE TABLE IF NOT EXISTS crawl_logs (
    id SERIAL PRIMARY KEY,
    crawl_type VARCHAR(50) NOT NULL, -- 'repositories', 'users', 'topics'
    status VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed'
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER
);

-- 創建索引以提高查詢性能

-- repositories 表索引
CREATE INDEX IF NOT EXISTS idx_repositories_language ON repositories(language);
CREATE INDEX IF NOT EXISTS idx_repositories_stars ON repositories(stargazers_count DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_forks ON repositories(forks_count DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_created ON repositories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_updated ON repositories(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_pushed ON repositories(pushed_at DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_owner ON repositories(owner_id);
CREATE INDEX IF NOT EXISTS idx_repositories_fork ON repositories(is_fork);
CREATE INDEX IF NOT EXISTS idx_repositories_archived ON repositories(is_archived);
CREATE INDEX IF NOT EXISTS idx_repositories_private ON repositories(is_private);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_repositories_name_gin ON repositories USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_repositories_description_gin ON repositories USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_repositories_full_name_gin ON repositories USING gin(full_name gin_trgm_ops);

-- owners 表索引
CREATE INDEX IF NOT EXISTS idx_owners_login ON owners(login);
CREATE INDEX IF NOT EXISTS idx_owners_type ON owners(type);
CREATE INDEX IF NOT EXISTS idx_owners_followers ON owners(followers DESC);
CREATE INDEX IF NOT EXISTS idx_owners_public_repos ON owners(public_repos DESC);

-- repository_languages 表索引
CREATE INDEX IF NOT EXISTS idx_repo_languages_repo ON repository_languages(repository_id);
CREATE INDEX IF NOT EXISTS idx_repo_languages_lang ON repository_languages(language);
CREATE INDEX IF NOT EXISTS idx_repo_languages_bytes ON repository_languages(bytes DESC);

-- topics 表索引
CREATE INDEX IF NOT EXISTS idx_topics_name ON topics(name);

-- crawl_logs 表索引
CREATE INDEX IF NOT EXISTS idx_crawl_logs_type ON crawl_logs(crawl_type);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_status ON crawl_logs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started ON crawl_logs(started_at DESC);

-- 創建視圖以便於查詢

-- 倉庫統計視圖
CREATE OR REPLACE VIEW repository_stats AS
SELECT 
    r.id,
    r.full_name,
    r.name,
    r.description,
    r.language,
    r.stargazers_count,
    r.forks_count,
    r.open_issues_count,
    r.size,
    r.created_at,
    r.updated_at,
    r.pushed_at,
    o.login as owner_login,
    o.type as owner_type,
    o.avatar_url as owner_avatar,
    CASE 
        WHEN r.pushed_at > NOW() - INTERVAL '30 days' THEN 'active'
        WHEN r.pushed_at > NOW() - INTERVAL '90 days' THEN 'moderate'
        ELSE 'inactive'
    END as activity_status
FROM repositories r
JOIN owners o ON r.owner_id = o.id
WHERE r.is_archived = false AND r.is_disabled = false;

-- 語言統計視圖
CREATE OR REPLACE VIEW language_stats AS
SELECT 
    language,
    COUNT(*) as repository_count,
    AVG(stargazers_count) as avg_stars,
    SUM(stargazers_count) as total_stars,
    AVG(forks_count) as avg_forks,
    SUM(forks_count) as total_forks
FROM repositories 
WHERE language IS NOT NULL 
    AND is_archived = false 
    AND is_disabled = false
GROUP BY language
ORDER BY repository_count DESC;

-- 趨勢倉庫視圖（最近30天活躍且星數增長）
CREATE OR REPLACE VIEW trending_repositories AS
SELECT 
    r.*,
    o.login as owner_login,
    o.avatar_url as owner_avatar,
    EXTRACT(DAYS FROM (NOW() - r.created_at)) as days_since_created
FROM repositories r
JOIN owners o ON r.owner_id = o.id
WHERE r.pushed_at > NOW() - INTERVAL '30 days'
    AND r.stargazers_count > 10
    AND r.is_archived = false
    AND r.is_disabled = false
ORDER BY 
    (r.stargazers_count / GREATEST(EXTRACT(DAYS FROM (NOW() - r.created_at)), 1)) DESC,
    r.stargazers_count DESC
LIMIT 100;

-- 創建函數以便於數據操作

-- 更新倉庫統計信息的函數
CREATE OR REPLACE FUNCTION update_repository_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 可以在這裡添加統計更新邏輯
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
CREATE TRIGGER trigger_update_repository_stats
    BEFORE UPDATE ON repositories
    FOR EACH ROW
    EXECUTE FUNCTION update_repository_stats();

-- 插入一些初始數據（可選）

-- 常見的程式語言
INSERT INTO topics (name, display_name, description) VALUES
('javascript', 'JavaScript', 'JavaScript programming language'),
('python', 'Python', 'Python programming language'),
('java', 'Java', 'Java programming language'),
('typescript', 'TypeScript', 'TypeScript programming language'),
('react', 'React', 'React JavaScript library'),
('vue', 'Vue.js', 'Vue.js JavaScript framework'),
('angular', 'Angular', 'Angular TypeScript framework'),
('nodejs', 'Node.js', 'Node.js JavaScript runtime'),
('machine-learning', 'Machine Learning', 'Machine learning and AI'),
('web-development', 'Web Development', 'Web development tools and frameworks')
ON CONFLICT (name) DO NOTHING;

-- 創建用於數據清理的函數
CREATE OR REPLACE FUNCTION clean_duplicate_repositories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 刪除重複的倉庫（保留最新的）
    WITH duplicates AS (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY full_name ORDER BY crawled_at DESC) as rn
        FROM repositories
    )
    DELETE FROM repositories 
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 創建備份表結構的函數
CREATE OR REPLACE FUNCTION create_backup_tables(backup_suffix TEXT DEFAULT '')
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE TABLE IF NOT EXISTS repositories_backup%s AS SELECT * FROM repositories WHERE 1=0', backup_suffix);
    EXECUTE format('CREATE TABLE IF NOT EXISTS owners_backup%s AS SELECT * FROM owners WHERE 1=0', backup_suffix);
END;
$$ LANGUAGE plpgsql;

-- 註釋
COMMENT ON TABLE repositories IS '存儲 GitHub 倉庫信息';
COMMENT ON TABLE owners IS '存儲 GitHub 用戶和組織信息';
COMMENT ON TABLE repository_languages IS '存儲倉庫的程式語言統計';
COMMENT ON TABLE topics IS '存儲主題標籤';
COMMENT ON TABLE repository_topics IS '倉庫和主題的關聯表';
COMMENT ON TABLE crawl_logs IS '爬蟲執行日誌';

COMMENT ON COLUMN repositories.size IS '倉庫大小（KB）';
COMMENT ON COLUMN repositories.topics IS '倉庫主題標籤數組';
COMMENT ON COLUMN repository_languages.percentage IS '該語言在倉庫中的百分比';

-- 完成
SELECT 'Database schema created successfully!' as status;