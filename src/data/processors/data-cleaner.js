import * as cheerio from 'cheerio';
import crypto from 'crypto';
import logger from '../../utils/logger.js';

/**
 * 數據清理類
 * 用於清理和處理爬取的原始數據
 */
class DataCleaner {
  /**
   * 清理HTML內容
   * @param {string} html - 原始HTML內容
   * @returns {string} - 清理後的文本
   */
  static cleanHtml(html) {
    if (!html) return '';

    try {
      const $ = cheerio.load(html);

      // 移除腳本和樣式
      $('script, style, iframe, noscript').remove();

      // 獲取文本並清理
      let text = $.text();

      // 清理空白字符
      text = this.normalizeText(text);

      return text;
    } catch (error) {
      console.error('清理HTML時發生錯誤:', error);
      return html; // 發生錯誤時返回原始內容
    }
  }

  /**
   * 標準化文本
   * @param {string} text - 原始文本
   * @returns {string} - 標準化後的文本
   */
  static normalizeText(text) {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ') // 將多個空白字符替換為單個空格
      .replace(/\n+/g, '\n') // 將多個換行符替換為單個換行符
      .trim(); // 移除首尾空白
  }

  /**
   * 驗證URL格式
   * @param {string} url - 要驗證的URL
   * @returns {boolean} - 是否為有效URL
   */
  static isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 從HTML中提取所有鏈接
   * @param {string} html - 原始HTML內容
   * @returns {Array<Object>} - 提取的鏈接數組，每個元素包含url和text
   */
  static extractLinks(html) {
    if (!html) return [];

    try {
      const $ = cheerio.load(html);
      const links = [];

      $('a').each((i, el) => {
        const url = $(el).attr('href');
        const text = $(el).text().trim();

        if (url) {
          links.push({ url, text });
        }
      });

      return links;
    } catch (error) {
      console.error('提取鏈接時發生錯誤:', error);
      return [];
    }
  }

  /**
   * 從HTML中提取所有圖片
   * @param {string} html - 原始HTML內容
   * @returns {Array<Object>} - 提取的圖片數組，每個元素包含url和alt
   */
  static extractImages(html) {
    if (!html) return [];

    try {
      const $ = cheerio.load(html);
      const images = [];

      $('img').each((i, el) => {
        const url = $(el).attr('src');
        const alt = $(el).attr('alt') || '';

        if (url) {
          images.push({ url, alt });
        }
      });

      return images;
    } catch (error) {
      console.error('提取圖片時發生錯誤:', error);
      return [];
    }
  }

  /**
   * 計算文本的MD5哈希值
   * @param {string} text - 輸入文本
   * @returns {string} - MD5哈希值
   */
  static calculateMd5(text) {
    if (!text) return '';
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * 計算兩個文本之間的Jaccard相似度
   * @param {string} text1 - 第一個文本
   * @param {string} text2 - 第二個文本
   * @returns {number} - 相似度，範圍從0到1
   */
  static calculateJaccardSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    // 將文本分割為單詞集合
    const set1 = new Set(text1.toLowerCase().split(/\s+/));
    const set2 = new Set(text2.toLowerCase().split(/\s+/));

    // 計算交集大小
    const intersection = new Set([...set1].filter(x => set2.has(x)));

    // 計算並集大小
    const union = new Set([...set1, ...set2]);

    // 計算Jaccard相似度
    return intersection.size / union.size;
  }

  /**
   * 從文本中提取關鍵詞
   * @param {string} text - 輸入文本
   * @param {number} limit - 最大關鍵詞數量
   * @returns {Array<string>} - 關鍵詞數組
   */
  static extractKeywords(text, limit = 10) {
    if (!text) return [];

    // 簡單的關鍵詞提取實現，基於詞頻
    // 在實際應用中，可以使用更複雜的算法或NLP庫

    // 移除常見的停用詞
    const stopwords = new Set([
      'a',
      'an',
      'the',
      'and',
      'or',
      'but',
      'is',
      'are',
      'was',
      'were',
      'in',
      'on',
      'at',
      'to',
      'for',
      'with',
      'by',
      'about',
      'as',
      'of',
      'that',
      'this',
      'these',
      'those',
      'it',
      'its',
      'from',
      'be',
      'have',
      '的',
      '了',
      '和',
      '是',
      '在',
      '我',
      '有',
      '你',
      '他',
      '她',
      '們',
      '個',
      '與',
      '及',
      '或',
      '但',
      '就',
      '也',
      '要',
      '會',
      '對',
    ]);

    // 分割文本為單詞並計算頻率
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 保留英文、數字、中文和空白
      .split(/\s+/)
      .filter(
        word =>
          word.length > 1 && // 忽略單個字符
          !stopwords.has(word) && // 忽略停用詞
          !/^\d+$/.test(word) // 忽略純數字
      );

    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // 按頻率排序並返回前N個關鍵詞
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  }
}

export default DataCleaner;

/**
 * 清理GitHub倉庫數據的專用函數
 * @param {Object} rawRepo - 原始GitHub API返回的倉庫數據
 * @returns {Object} 清理後的倉庫數據
 */
export function cleanRepositoryData(rawRepo) {
  try {
    // 保留所有欄位，只進行基本的數據清理和類型轉換
    const cleanedRepo = {
      // 基本信息
      id: rawRepo.id || null,
      node_id: rawRepo.node_id || null,
      name: DataCleaner.normalizeText(rawRepo.name || ''),
      full_name: DataCleaner.normalizeText(rawRepo.full_name || ''),
      description: rawRepo.description ? DataCleaner.normalizeText(rawRepo.description) : null,
      url: rawRepo.url || '',
      homepage: rawRepo.homepage || null,
      clone_url: rawRepo.clone_url || null,
      git_url: rawRepo.git_url || null,
      ssh_url: rawRepo.ssh_url || null,
      svn_url: rawRepo.svn_url || null,
      mirror_url: rawRepo.mirror_url || null,
      
      // 統計數據
      stars: parseInt(rawRepo.stars) || 0,
      forks: parseInt(rawRepo.forks) || 0,
      watchers: parseInt(rawRepo.watchers) || 0,
      subscribers_count: parseInt(rawRepo.subscribers_count) || 0,
      network_count: parseInt(rawRepo.network_count) || 0,
      open_issues: parseInt(rawRepo.open_issues) || 0,
      size: parseInt(rawRepo.size) || 0,
      
      // 技術信息
      language: rawRepo.language || null,
      topics: Array.isArray(rawRepo.topics)
        ? rawRepo.topics.filter(topic => topic && typeof topic === 'string')
        : [],
      default_branch: rawRepo.default_branch || 'main',
      
      // 時間信息
      created_at: rawRepo.created_at || new Date().toISOString(),
      updated_at: rawRepo.updated_at || new Date().toISOString(),
      pushed_at: rawRepo.pushed_at || null,
      
      // 設置信息
      private: Boolean(rawRepo.private),
      fork: Boolean(rawRepo.fork),
      archived: Boolean(rawRepo.archived),
      disabled: Boolean(rawRepo.disabled),
      has_issues: Boolean(rawRepo.has_issues),
      has_projects: Boolean(rawRepo.has_projects),
      has_wiki: Boolean(rawRepo.has_wiki),
      has_pages: Boolean(rawRepo.has_pages),
      has_downloads: Boolean(rawRepo.has_downloads),
      has_discussions: Boolean(rawRepo.has_discussions),
      
      // 許可證信息
      license: rawRepo.license
        ? {
            key: rawRepo.license.key || null,
            name: rawRepo.license.name || null,
            spdx_id: rawRepo.license.spdx_id || null,
            url: rawRepo.license.url || null,
            node_id: rawRepo.license.node_id || null
          }
        : null,
      visibility: rawRepo.visibility || null,
      
      // 所有者信息
      owner: rawRepo.owner ? {
        id: rawRepo.owner.id || null,
        node_id: rawRepo.owner.node_id || null,
        login: rawRepo.owner.login || '',
        type: rawRepo.owner.type || 'User',
        site_admin: Boolean(rawRepo.owner.site_admin),
        url: rawRepo.owner.url || '',
        avatar_url: rawRepo.owner.avatar_url || null,
        gravatar_id: rawRepo.owner.gravatar_id || null,
        followers_url: rawRepo.owner.followers_url || null,
        following_url: rawRepo.owner.following_url || null,
        gists_url: rawRepo.owner.gists_url || null,
        starred_url: rawRepo.owner.starred_url || null,
        subscriptions_url: rawRepo.owner.subscriptions_url || null,
        organizations_url: rawRepo.owner.organizations_url || null,
        repos_url: rawRepo.owner.repos_url || null,
        events_url: rawRepo.owner.events_url || null,
        received_events_url: rawRepo.owner.received_events_url || null,
      } : null,
      
      // API URLs
      api_url: rawRepo.api_url || null,
      archive_url: rawRepo.archive_url || null,
      assignees_url: rawRepo.assignees_url || null,
      blobs_url: rawRepo.blobs_url || null,
      branches_url: rawRepo.branches_url || null,
      collaborators_url: rawRepo.collaborators_url || null,
      comments_url: rawRepo.comments_url || null,
      commits_url: rawRepo.commits_url || null,
      compare_url: rawRepo.compare_url || null,
      contents_url: rawRepo.contents_url || null,
      contributors_url: rawRepo.contributors_url || null,
      deployments_url: rawRepo.deployments_url || null,
      downloads_url: rawRepo.downloads_url || null,
      events_url: rawRepo.events_url || null,
      forks_url: rawRepo.forks_url || null,
      git_commits_url: rawRepo.git_commits_url || null,
      git_refs_url: rawRepo.git_refs_url || null,
      git_tags_url: rawRepo.git_tags_url || null,
      hooks_url: rawRepo.hooks_url || null,
      issue_comment_url: rawRepo.issue_comment_url || null,
      issue_events_url: rawRepo.issue_events_url || null,
      issues_url: rawRepo.issues_url || null,
      keys_url: rawRepo.keys_url || null,
      labels_url: rawRepo.labels_url || null,
      languages_url: rawRepo.languages_url || null,
      merges_url: rawRepo.merges_url || null,
      milestones_url: rawRepo.milestones_url || null,
      notifications_url: rawRepo.notifications_url || null,
      pulls_url: rawRepo.pulls_url || null,
      releases_url: rawRepo.releases_url || null,
      stargazers_url: rawRepo.stargazers_url || null,
      statuses_url: rawRepo.statuses_url || null,
      subscribers_url: rawRepo.subscribers_url || null,
      subscription_url: rawRepo.subscription_url || null,
      tags_url: rawRepo.tags_url || null,
      teams_url: rawRepo.teams_url || null,
      trees_url: rawRepo.trees_url || null,
      
      // 額外的元數據
      allow_forking: Boolean(rawRepo.allow_forking),
      is_template: Boolean(rawRepo.is_template),
      web_commit_signoff_required: Boolean(rawRepo.web_commit_signoff_required),
      delete_branch_on_merge: Boolean(rawRepo.delete_branch_on_merge),
      use_squash_pr_title_as_default: Boolean(rawRepo.use_squash_pr_title_as_default),
      squash_merge_commit_title: rawRepo.squash_merge_commit_title || null,
      squash_merge_commit_message: rawRepo.squash_merge_commit_message || null,
      merge_commit_title: rawRepo.merge_commit_title || null,
      merge_commit_message: rawRepo.merge_commit_message || null,
      allow_merge_commit: Boolean(rawRepo.allow_merge_commit),
      allow_squash_merge: Boolean(rawRepo.allow_squash_merge),
      allow_rebase_merge: Boolean(rawRepo.allow_rebase_merge),
      allow_auto_merge: Boolean(rawRepo.allow_auto_merge),
      allow_update_branch: Boolean(rawRepo.allow_update_branch),
      
      // 分數和排名
      score: parseFloat(rawRepo.score) || 0,
      
      // 爬取時間戳
      crawled_at: rawRepo.crawled_at || new Date().toISOString()
    };

    // 清理描述中的HTML標籤（如果有）
    if (cleanedRepo.description) {
      cleanedRepo.description = DataCleaner.cleanHtml(cleanedRepo.description);
    }

    // 驗證URL格式
    if (cleanedRepo.url && !DataCleaner.isValidUrl(cleanedRepo.url)) {
      logger.warn(`無效的倉庫URL: ${cleanedRepo.url}`);
      cleanedRepo.url = '';
    }

    if (cleanedRepo.homepage && !DataCleaner.isValidUrl(cleanedRepo.homepage)) {
      logger.warn(`無效的主頁URL: ${cleanedRepo.homepage}`);
      cleanedRepo.homepage = null;
    }

    // 清理topics數組
    cleanedRepo.topics = cleanedRepo.topics
      .map(topic => DataCleaner.normalizeText(topic))
      .filter(topic => topic.length > 0 && topic.length <= 50)
      .slice(0, 20); // 限制最多20個topics

    logger.debug('倉庫數據清理完成', {
      name: cleanedRepo.full_name,
      stars: cleanedRepo.stars,
      topics: cleanedRepo.topics.length,
    });

    return cleanedRepo;
  } catch (error) {
    logger.error('清理倉庫數據時發生錯誤', {
      error: error.message,
      stack: error.stack,
      rawRepo: JSON.stringify(rawRepo, null, 2),
    });
    throw error;
  }
}
