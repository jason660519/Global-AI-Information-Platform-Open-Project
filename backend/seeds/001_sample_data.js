/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 清空現有數據（按依賴順序）
  await knex('repository_topics').del();
  await knex('topics').del();
  await knex('languages').del();
  await knex('repositories').del();
  await knex('owners').del();

  // 插入示例 owners 數據
  const owners = await knex('owners').insert([
    {
      id: 1,
      login: 'facebook',
      type: 'organization',
      name: 'Meta',
      bio: 'We are working to build community through open source technology.',
      company: null,
      location: 'Menlo Park, California',
      email: null,
      blog: 'https://opensource.fb.com',
      twitter_username: 'fbopensource',
      public_repos: 180,
      public_gists: 0,
      followers: 15000,
      following: 0,
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
      html_url: 'https://github.com/facebook',
      created_at: '2009-04-02T03:35:22Z',
      updated_at: '2023-12-01T10:00:00Z'
    },
    {
      id: 2,
      login: 'microsoft',
      type: 'organization',
      name: 'Microsoft',
      bio: 'Open source projects and samples from Microsoft',
      company: null,
      location: 'Redmond, WA',
      email: null,
      blog: 'https://opensource.microsoft.com',
      twitter_username: 'OpenAtMicrosoft',
      public_repos: 6000,
      public_gists: 0,
      followers: 25000,
      following: 0,
      avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
      html_url: 'https://github.com/microsoft',
      created_at: '2014-02-19T18:42:30Z',
      updated_at: '2023-12-01T10:00:00Z'
    },
    {
      id: 3,
      login: 'torvalds',
      type: 'user',
      name: 'Linus Torvalds',
      bio: null,
      company: 'Linux Foundation',
      location: 'Portland, OR',
      email: null,
      blog: null,
      twitter_username: null,
      public_repos: 6,
      public_gists: 0,
      followers: 180000,
      following: 0,
      avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      html_url: 'https://github.com/torvalds',
      created_at: '2011-09-03T15:26:22Z',
      updated_at: '2023-12-01T10:00:00Z'
    },
    {
      id: 4,
      login: 'google',
      type: 'organization',
      name: 'Google',
      bio: 'Google ❤️ Open Source',
      company: null,
      location: null,
      email: null,
      blog: 'https://opensource.google/',
      twitter_username: 'GoogleOSS',
      public_repos: 2500,
      public_gists: 0,
      followers: 20000,
      following: 0,
      avatar_url: 'https://avatars.githubusercontent.com/u/1342004?v=4',
      html_url: 'https://github.com/google',
      created_at: '2012-01-18T01:30:18Z',
      updated_at: '2023-12-01T10:00:00Z'
    },
    {
      id: 5,
      login: 'vercel',
      type: 'organization',
      name: 'Vercel',
      bio: 'Develop. Preview. Ship.',
      company: null,
      location: 'San Francisco, CA',
      email: null,
      blog: 'https://vercel.com',
      twitter_username: 'vercel',
      public_repos: 150,
      public_gists: 0,
      followers: 8000,
      following: 0,
      avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4',
      html_url: 'https://github.com/vercel',
      created_at: '2015-10-29T16:12:31Z',
      updated_at: '2023-12-01T10:00:00Z'
    }
  ]).returning('id');

  // 插入示例 repositories 數據
  const repositories = await knex('repositories').insert([
    {
      id: 1,
      name: 'react',
      full_name: 'facebook/react',
      description: 'The library for web and native user interfaces.',
      homepage: 'https://react.dev',
      clone_url: 'https://github.com/facebook/react.git',
      ssh_url: 'git@github.com:facebook/react.git',
      html_url: 'https://github.com/facebook/react',
      owner_id: 1,
      primary_language: 'JavaScript',
      size: 20000,
      stars_count: 220000,
      watchers_count: 220000,
      forks_count: 45000,
      open_issues_count: 800,
      default_branch: 'main',
      is_fork: false,
      is_archived: false,
      is_disabled: false,
      is_private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: false,
      has_downloads: true,
      created_at: '2013-05-24T16:15:54Z',
      updated_at: '2023-12-01T10:00:00Z',
      pushed_at: '2023-12-01T09:30:00Z'
    },
    {
      id: 2,
      name: 'vscode',
      full_name: 'microsoft/vscode',
      description: 'Visual Studio Code',
      homepage: 'https://code.visualstudio.com',
      clone_url: 'https://github.com/microsoft/vscode.git',
      ssh_url: 'git@github.com:microsoft/vscode.git',
      html_url: 'https://github.com/microsoft/vscode',
      owner_id: 2,
      primary_language: 'TypeScript',
      size: 300000,
      stars_count: 155000,
      watchers_count: 155000,
      forks_count: 28000,
      open_issues_count: 5000,
      default_branch: 'main',
      is_fork: false,
      is_archived: false,
      is_disabled: false,
      is_private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: false,
      has_downloads: true,
      created_at: '2015-09-03T20:23:21Z',
      updated_at: '2023-12-01T10:00:00Z',
      pushed_at: '2023-12-01T09:45:00Z'
    },
    {
      id: 3,
      name: 'linux',
      full_name: 'torvalds/linux',
      description: 'Linux kernel source tree',
      homepage: null,
      clone_url: 'https://github.com/torvalds/linux.git',
      ssh_url: 'git@github.com:torvalds/linux.git',
      html_url: 'https://github.com/torvalds/linux',
      owner_id: 3,
      primary_language: 'C',
      size: 1000000,
      stars_count: 165000,
      watchers_count: 165000,
      forks_count: 52000,
      open_issues_count: 0,
      default_branch: 'master',
      is_fork: false,
      is_archived: false,
      is_disabled: false,
      is_private: false,
      has_issues: false,
      has_projects: false,
      has_wiki: false,
      has_pages: false,
      has_downloads: true,
      created_at: '2011-09-04T22:48:12Z',
      updated_at: '2023-12-01T10:00:00Z',
      pushed_at: '2023-12-01T08:00:00Z'
    },
    {
      id: 4,
      name: 'tensorflow',
      full_name: 'google/tensorflow',
      description: 'An Open Source Machine Learning Framework for Everyone',
      homepage: 'https://tensorflow.org',
      clone_url: 'https://github.com/tensorflow/tensorflow.git',
      ssh_url: 'git@github.com:tensorflow/tensorflow.git',
      html_url: 'https://github.com/tensorflow/tensorflow',
      owner_id: 4,
      primary_language: 'C++',
      size: 250000,
      stars_count: 180000,
      watchers_count: 180000,
      forks_count: 88000,
      open_issues_count: 2000,
      default_branch: 'master',
      is_fork: false,
      is_archived: false,
      is_disabled: false,
      is_private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: false,
      has_downloads: true,
      created_at: '2015-11-07T01:19:20Z',
      updated_at: '2023-12-01T10:00:00Z',
      pushed_at: '2023-12-01T09:15:00Z'
    },
    {
      id: 5,
      name: 'next.js',
      full_name: 'vercel/next.js',
      description: 'The React Framework',
      homepage: 'https://nextjs.org',
      clone_url: 'https://github.com/vercel/next.js.git',
      ssh_url: 'git@github.com:vercel/next.js.git',
      html_url: 'https://github.com/vercel/next.js',
      owner_id: 5,
      primary_language: 'JavaScript',
      size: 180000,
      stars_count: 118000,
      watchers_count: 118000,
      forks_count: 25000,
      open_issues_count: 1500,
      default_branch: 'canary',
      is_fork: false,
      is_archived: false,
      is_disabled: false,
      is_private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: false,
      has_pages: false,
      has_downloads: true,
      created_at: '2016-10-05T00:12:10Z',
      updated_at: '2023-12-01T10:00:00Z',
      pushed_at: '2023-12-01T09:50:00Z'
    }
  ]).returning('id');

  // 插入示例 topics 數據
  const topics = await knex('topics').insert([
    { id: 1, name: 'react', description: 'A JavaScript library for building user interfaces', repositories_count: 50000 },
    { id: 2, name: 'javascript', description: 'Programming language', repositories_count: 200000 },
    { id: 3, name: 'typescript', description: 'TypeScript programming language', repositories_count: 80000 },
    { id: 4, name: 'frontend', description: 'Frontend development', repositories_count: 30000 },
    { id: 5, name: 'editor', description: 'Code editor', repositories_count: 5000 },
    { id: 6, name: 'ide', description: 'Integrated development environment', repositories_count: 3000 },
    { id: 7, name: 'kernel', description: 'Operating system kernel', repositories_count: 500 },
    { id: 8, name: 'linux', description: 'Linux operating system', repositories_count: 10000 },
    { id: 9, name: 'machine-learning', description: 'Machine learning and AI', repositories_count: 25000 },
    { id: 10, name: 'tensorflow', description: 'TensorFlow machine learning framework', repositories_count: 8000 },
    { id: 11, name: 'nextjs', description: 'Next.js React framework', repositories_count: 15000 },
    { id: 12, name: 'framework', description: 'Software framework', repositories_count: 40000 }
  ]).returning('id');

  // 插入示例 languages 數據
  await knex('languages').insert([
    // React repository languages
    { repository_id: 1, language: 'JavaScript', bytes: 15000000, percentage: 75.0 },
    { repository_id: 1, language: 'TypeScript', bytes: 3000000, percentage: 15.0 },
    { repository_id: 1, language: 'HTML', bytes: 1500000, percentage: 7.5 },
    { repository_id: 1, language: 'CSS', bytes: 500000, percentage: 2.5 },
    
    // VSCode repository languages
    { repository_id: 2, language: 'TypeScript', bytes: 240000000, percentage: 80.0 },
    { repository_id: 2, language: 'JavaScript', bytes: 30000000, percentage: 10.0 },
    { repository_id: 2, language: 'CSS', bytes: 18000000, percentage: 6.0 },
    { repository_id: 2, language: 'HTML', bytes: 12000000, percentage: 4.0 },
    
    // Linux repository languages
    { repository_id: 3, language: 'C', bytes: 900000000, percentage: 90.0 },
    { repository_id: 3, language: 'Assembly', bytes: 50000000, percentage: 5.0 },
    { repository_id: 3, language: 'Shell', bytes: 30000000, percentage: 3.0 },
    { repository_id: 3, language: 'Makefile', bytes: 20000000, percentage: 2.0 },
    
    // TensorFlow repository languages
    { repository_id: 4, language: 'C++', bytes: 150000000, percentage: 60.0 },
    { repository_id: 4, language: 'Python', bytes: 62500000, percentage: 25.0 },
    { repository_id: 4, language: 'C', bytes: 25000000, percentage: 10.0 },
    { repository_id: 4, language: 'Java', bytes: 12500000, percentage: 5.0 },
    
    // Next.js repository languages
    { repository_id: 5, language: 'JavaScript', bytes: 108000000, percentage: 60.0 },
    { repository_id: 5, language: 'TypeScript', bytes: 54000000, percentage: 30.0 },
    { repository_id: 5, language: 'CSS', bytes: 10800000, percentage: 6.0 },
    { repository_id: 5, language: 'HTML', bytes: 7200000, percentage: 4.0 }
  ]);

  // 插入示例 repository_topics 關聯數據
  await knex('repository_topics').insert([
    // React topics
    { repository_id: 1, topic_id: 1 }, // react
    { repository_id: 1, topic_id: 2 }, // javascript
    { repository_id: 1, topic_id: 4 }, // frontend
    
    // VSCode topics
    { repository_id: 2, topic_id: 3 }, // typescript
    { repository_id: 2, topic_id: 5 }, // editor
    { repository_id: 2, topic_id: 6 }, // ide
    
    // Linux topics
    { repository_id: 3, topic_id: 7 }, // kernel
    { repository_id: 3, topic_id: 8 }, // linux
    
    // TensorFlow topics
    { repository_id: 4, topic_id: 9 }, // machine-learning
    { repository_id: 4, topic_id: 10 }, // tensorflow
    
    // Next.js topics
    { repository_id: 5, topic_id: 1 }, // react
    { repository_id: 5, topic_id: 2 }, // javascript
    { repository_id: 5, topic_id: 11 }, // nextjs
    { repository_id: 5, topic_id: 12 } // framework
  ]);
};