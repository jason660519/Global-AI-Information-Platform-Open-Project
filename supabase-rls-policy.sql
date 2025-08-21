-- GITHUB REPO EVERY 2 HOUR 表的 Row Level Security (RLS) 政策
-- 這個政策允許所有用戶對表進行完整的 CRUD 操作

-- 1. 首先啟用 RLS（如果還沒啟用）
ALTER TABLE "GITHUB REPO EVERY 2 HOUR" ENABLE ROW LEVEL SECURITY;

-- 2. 創建允許所有操作的政策
-- SELECT 政策（允許讀取）
CREATE POLICY "github_repo_select_all" ON "GITHUB REPO EVERY 2 HOUR"
    FOR SELECT
    USING (true);

-- INSERT 政策（允許插入）
CREATE POLICY "github_repo_insert_all" ON "GITHUB REPO EVERY 2 HOUR"
    FOR INSERT
    WITH CHECK (true);

-- UPDATE 政策（允許更新）
CREATE POLICY "github_repo_update_all" ON "GITHUB REPO EVERY 2 HOUR"
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- DELETE 政策（允許刪除）
CREATE POLICY "github_repo_delete_all" ON "GITHUB REPO EVERY 2 HOUR"
    FOR DELETE
    USING (true);

-- 或者，你可以使用一個綜合政策來處理所有操作：
-- CREATE POLICY "github_repo_all_operations" ON "GITHUB REPO EVERY 2 HOUR"
--     FOR ALL
--     USING (true)
--     WITH CHECK (true);

-- 如果你想要更安全的政策，可以基於用戶角色或其他條件：
-- 例如：只允許已認證用戶
-- CREATE POLICY "github_repo_authenticated_only" ON "GITHUB REPO EVERY 2 HOUR"
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- 查看現有政策
-- SELECT * FROM pg_policies WHERE tablename = 'GITHUB REPO EVERY 2 HOUR';

-- 如果需要刪除政策
-- DROP POLICY IF EXISTS "github_repo_select_all" ON "GITHUB REPO EVERY 2 HOUR";
-- DROP POLICY IF EXISTS "github_repo_insert_all" ON "GITHUB REPO EVERY 2 HOUR";
-- DROP POLICY IF EXISTS "github_repo_update_all" ON "GITHUB REPO EVERY 2 HOUR";
-- DROP POLICY IF EXISTS "github_repo_delete_all" ON "GITHUB REPO EVERY 2 HOUR";

-- 如果需要完全禁用 RLS
-- ALTER TABLE "GITHUB REPO EVERY 2 HOUR" DISABLE ROW LEVEL SECURITY;