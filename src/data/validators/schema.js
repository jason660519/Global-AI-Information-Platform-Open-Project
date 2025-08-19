const z = require('zod');

/**
 * 文章數據驗證模式
 */
const articleSchema = z.object({
  title: z.string().min(1, { message: '標題不能為空' }),
  content: z.string().min(1, { message: '內容不能為空' }),
  url: z.string().url({ message: 'URL格式不正確' }),
  source: z.string().min(1, { message: '來源不能為空' }),
  author: z.string().optional(),
  published_at: z.string().datetime({ message: '發布時間格式不正確' }).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  content_hash: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * 開源項目數據驗證模式
 */
const repositorySchema = z.object({
  name: z.string().min(1, { message: '名稱不能為空' }),
  full_name: z.string().min(1, { message: '完整名稱不能為空' }),
  description: z.string().optional(),
  url: z.string().url({ message: 'URL格式不正確' }),
  homepage: z.string().url({ message: '主頁URL格式不正確' }).optional().nullable(),
  stars: z.number().int().nonnegative().optional(),
  forks: z.number().int().nonnegative().optional(),
  language: z.string().optional().nullable(),
  topics: z.array(z.string()).optional(),
  owner: z.object({
    login: z.string(),
    type: z.string(),
    url: z.string().url({ message: '擁有者URL格式不正確' })
  }),
  created_at: z.string().datetime({ message: '創建時間格式不正確' }),
  updated_at: z.string().datetime({ message: '更新時間格式不正確' }),
  license: z.object({
    key: z.string(),
    name: z.string(),
    url: z.string().url().nullable()
  }).optional().nullable(),
  metadata: z.record(z.any()).optional()
});

/**
 * 學習資源數據驗證模式
 */
const learningResourceSchema = z.object({
  title: z.string().min(1, { message: '標題不能為空' }),
  description: z.string().optional(),
  url: z.string().url({ message: 'URL格式不正確' }),
  source: z.string().min(1, { message: '來源不能為空' }),
  type: z.enum(['course', 'tutorial', 'documentation', 'book', 'video', 'other']),
  language: z.string().optional(),
  topics: z.array(z.string()).optional(),
  author: z.string().optional(),
  published_at: z.string().datetime({ message: '發布時間格式不正確' }).optional(),
  rating: z.number().min(0).max(5).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * 排名數據驗證模式
 */
const rankingSchema = z.object({
  name: z.string().min(1, { message: '名稱不能為空' }),
  category: z.string().min(1, { message: '類別不能為空' }),
  rank: z.number().int().positive(),
  score: z.number().optional(),
  url: z.string().url({ message: 'URL格式不正確' }).optional(),
  source: z.string().min(1, { message: '來源不能為空' }),
  date: z.string().datetime({ message: '日期格式不正確' }),
  previous_rank: z.number().int().positive().optional(),
  change: z.number().int().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * 爬蟲日誌數據驗證模式
 */
const crawlerLogSchema = z.object({
  crawler_name: z.string().min(1, { message: '爬蟲名稱不能為空' }),
  status: z.enum(['success', 'error', 'warning', 'info']),
  message: z.string(),
  details: z.record(z.any()).optional(),
  created_at: z.string().datetime({ message: '創建時間格式不正確' })
});

module.exports = {
  articleSchema,
  repositorySchema,
  learningResourceSchema,
  rankingSchema,
  crawlerLogSchema
};