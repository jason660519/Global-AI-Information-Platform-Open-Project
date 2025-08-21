/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 創建 owners 表
    .createTable('owners', function(table) {
      table.increments('id').primary();
      table.string('login', 255).notNullable().unique();
      table.string('type', 50).notNullable(); // 'user' or 'organization'
      table.string('name', 255);
      table.text('bio');
      table.string('company', 255);
      table.string('location', 255);
      table.string('email', 255);
      table.string('blog', 500);
      table.string('twitter_username', 255);
      table.integer('public_repos').defaultTo(0);
      table.integer('public_gists').defaultTo(0);
      table.integer('followers').defaultTo(0);
      table.integer('following').defaultTo(0);
      table.string('avatar_url', 500);
      table.string('html_url', 500);
      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').notNullable();
      table.timestamps(true, true);
      
      // 索引
      table.index(['type']);
      table.index(['followers']);
      table.index(['public_repos']);
      table.index(['created_at']);
    })
    
    // 創建 repositories 表
    .createTable('repositories', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('full_name', 255).notNullable().unique();
      table.text('description');
      table.string('homepage', 500);
      table.string('clone_url', 500);
      table.string('ssh_url', 500);
      table.string('html_url', 500);
      table.integer('owner_id').unsigned().notNullable();
      table.string('primary_language', 100);
      table.integer('size').defaultTo(0);
      table.integer('stars_count').defaultTo(0);
      table.integer('watchers_count').defaultTo(0);
      table.integer('forks_count').defaultTo(0);
      table.integer('open_issues_count').defaultTo(0);
      table.string('default_branch', 100).defaultTo('main');
      table.boolean('is_fork').defaultTo(false);
      table.boolean('is_archived').defaultTo(false);
      table.boolean('is_disabled').defaultTo(false);
      table.boolean('is_private').defaultTo(false);
      table.boolean('has_issues').defaultTo(true);
      table.boolean('has_projects').defaultTo(true);
      table.boolean('has_wiki').defaultTo(true);
      table.boolean('has_pages').defaultTo(false);
      table.boolean('has_downloads').defaultTo(true);
      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').notNullable();
      table.timestamp('pushed_at');
      table.timestamps(true, true);
      
      // 外鍵
      table.foreign('owner_id').references('id').inTable('owners').onDelete('CASCADE');
      
      // 索引
      table.index(['owner_id']);
      table.index(['primary_language']);
      table.index(['stars_count']);
      table.index(['forks_count']);
      table.index(['created_at']);
      table.index(['updated_at']);
      table.index(['is_fork']);
      table.index(['is_archived']);
      table.index(['is_private']);
    })
    
    // 創建 languages 表
    .createTable('languages', function(table) {
      table.increments('id').primary();
      table.integer('repository_id').unsigned().notNullable();
      table.string('language', 100).notNullable();
      table.integer('bytes').defaultTo(0);
      table.decimal('percentage', 5, 2).defaultTo(0);
      table.timestamps(true, true);
      
      // 外鍵
      table.foreign('repository_id').references('id').inTable('repositories').onDelete('CASCADE');
      
      // 索引
      table.index(['repository_id']);
      table.index(['language']);
      table.index(['percentage']);
      
      // 唯一約束
      table.unique(['repository_id', 'language']);
    })
    
    // 創建 topics 表
    .createTable('topics', function(table) {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.text('description');
      table.integer('repositories_count').defaultTo(0);
      table.timestamps(true, true);
      
      // 索引
      table.index(['repositories_count']);
    })
    
    // 創建 repository_topics 關聯表
    .createTable('repository_topics', function(table) {
      table.increments('id').primary();
      table.integer('repository_id').unsigned().notNullable();
      table.integer('topic_id').unsigned().notNullable();
      table.timestamps(true, true);
      
      // 外鍵
      table.foreign('repository_id').references('id').inTable('repositories').onDelete('CASCADE');
      table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');
      
      // 索引
      table.index(['repository_id']);
      table.index(['topic_id']);
      
      // 唯一約束
      table.unique(['repository_id', 'topic_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('repository_topics')
    .dropTableIfExists('topics')
    .dropTableIfExists('languages')
    .dropTableIfExists('repositories')
    .dropTableIfExists('owners');
};