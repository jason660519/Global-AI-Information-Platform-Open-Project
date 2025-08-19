const cheerio = require('cheerio');
const crypto = require('crypto');

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
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of',
      'that', 'this', 'these', 'those', 'it', 'its', 'from', 'be', 'have',
      '的', '了', '和', '是', '在', '我', '有', '你', '他', '她', '們',
      '個', '與', '及', '或', '但', '就', '也', '要', '會', '對'
    ]);
    
    // 分割文本為單詞並計算頻率
    const words = text.toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 保留英文、數字、中文和空白
      .split(/\s+/)
      .filter(word => 
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

module.exports = DataCleaner;