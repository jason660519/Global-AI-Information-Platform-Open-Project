import 'dotenv/config';
import SupabaseUploader from './src/uploaders/supabase-uploader.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

/**
 * 測試Supabase連接和上傳功能
 */
async function testSupabaseConnection() {
  try {
    console.log('開始測試Supabase連接...');
    console.log('Supabase URL:', config.supabase.url);
    console.log('Supabase Key (前10字符):', config.supabase.key.substring(0, 10) + '...');
    console.log('目標表格:', config.supabase.tables.repositories);

    const uploader = new SupabaseUploader();

    // 測試連接
    console.log('\n1. 測試Supabase連接...');
    const connectionTest = await uploader.testConnection();
    console.log('連接測試結果:', connectionTest ? '成功' : '失敗');

    if (!connectionTest) {
      console.error('Supabase連接失敗，請檢查配置');
      return;
    }

    // 測試表格記錄數量
    console.log('\n2. 檢查表格記錄數量...');
    try {
      const recordCount = await uploader.getRecordCount(config.supabase.tables.repositories);
      console.log(`當前表格記錄數量: ${recordCount}`);
    } catch (error) {
      console.error('獲取記錄數量失敗:', error.message);
    }

    // 測試上傳一條測試數據
    console.log('\n3. 測試上傳功能...');
    const testData = [{
      Name: 'test-repo',
      'Full Name': 'test-user/test-repo',
      Description: 'Test repository for Supabase upload',
      'HTML URL': 'https://github.com/test-user/test-repo',
      Stars: '100',
      Forks: '20',
      Language: 'JavaScript',
      Topics: 'test,supabase'
    }];
    
    console.log('測試數據:', testData[0]);

    try {
      const uploadResult = await uploader.uploadRepositories(testData, config.supabase.tables.repositories);
      console.log('上傳測試結果:', {
        總數: uploadResult.total,
        成功: uploadResult.successful,
        失敗: uploadResult.failed,
        錯誤: uploadResult.errors
      });

      if (uploadResult.successful > 0) {
        console.log('✅ Supabase上傳功能正常！');
      } else {
        console.log('❌ Supabase上傳功能異常');
        console.log('錯誤詳情:', uploadResult.errors);
      }
    } catch (error) {
      console.error('上傳測試失敗:', error.message);
      console.error('錯誤詳情:', error);
    }

    // 再次檢查記錄數量
    console.log('\n4. 檢查上傳後的記錄數量...');
    try {
      const newRecordCount = await uploader.getRecordCount(config.supabase.tables.repositories);
      console.log(`上傳後表格記錄數量: ${newRecordCount}`);
    } catch (error) {
      console.error('獲取記錄數量失敗:', error.message);
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error.message);
    console.error('錯誤堆疊:', error.stack);
  }
}

// 執行測試
testSupabaseConnection().then(() => {
  console.log('\n測試完成');
  process.exit(0);
}).catch(error => {
  console.error('測試失敗:', error);
  process.exit(1);
});