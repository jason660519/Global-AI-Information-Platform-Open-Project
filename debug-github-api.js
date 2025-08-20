import config from './src/config/index.js';
import axios from 'axios';

async function debugGitHubAPI() {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: 'stars:>=100 created:>=2025-08-19',
        sort: 'stars',
        order: 'desc',
        per_page: 1
      },
      headers: {
        Authorization: `token ${config.sources.github.token}`,
        'User-Agent': config.crawler.userAgent,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    console.log('API Response Status:', response.status);
    console.log('Total Count:', response.data.total_count);
    
    if (response.data.items && response.data.items.length > 0) {
      const repo = response.data.items[0];
      console.log('\n=== 第一個倉庫的完整數據結構 ===');
      console.log('ID:', repo.id);
      console.log('Node ID:', repo.node_id);
      console.log('Name:', repo.name);
      console.log('Full Name:', repo.full_name);
      console.log('HTML URL:', repo.html_url);
      console.log('API URL:', repo.url);
      console.log('Clone URL:', repo.clone_url);
      console.log('Git URL:', repo.git_url);
      console.log('SSH URL:', repo.ssh_url);
      console.log('\n=== 所有可用的鍵 ===');
      console.log(Object.keys(repo).sort());
      
      console.log('\n=== Owner 數據結構 ===');
      if (repo.owner) {
        console.log('Owner Keys:', Object.keys(repo.owner).sort());
        console.log('Owner ID:', repo.owner.id);
        console.log('Owner Login:', repo.owner.login);
        console.log('Owner Type:', repo.owner.type);
      }
      
      console.log('\n=== License 數據結構 ===');
      if (repo.license) {
        console.log('License Keys:', Object.keys(repo.license).sort());
        console.log('License:', repo.license);
      }
    }
  } catch (error) {
    console.error('API 請求錯誤:', error.message);
    if (error.response) {
      console.error('響應狀態:', error.response.status);
      console.error('響應數據:', error.response.data);
    }
  }
}

debugGitHubAPI();