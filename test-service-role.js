import { createClient } from '@supabase/supabase-js';
import config from './src/config/index.js';

async function testServiceRole() {
  try {
    console.log('測試Service Role Key...');
    console.log('當前SUPABASE_KEY:', process.env.SUPABASE_KEY?.substring(0, 20) + '...');
    
    // 檢查環境變數中是否有service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.log('❌ 未找到SUPABASE_SERVICE_ROLE_KEY環境變數');
      console.log('請在.env文件中添加SUPABASE_SERVICE_ROLE_KEY');
      return;
    }
    
    console.log('找到Service Role Key:', serviceRoleKey.substring(0, 20) + '...');
    
    // 使用service role key創建客戶端
    const supabaseServiceRole = createClient(
      config.supabase.url,
      serviceRoleKey
    );
    
    // 測試插入數據
    const testData = {
      'Name': 'test-service-role',
      'Full Name': 'test-user/test-service-role',
      'Description': 'Test with service role key',
      'HTML URL': 'https://github.com/test-user/test-service-role',
      'Stars': 50,
      'Forks': 10,
      'Language': 'TypeScript',
      'Topics': 'test,service-role'
    };
    
    console.log('\n嘗試使用Service Role Key插入數據...');
    const { data, error } = await supabaseServiceRole
      .from('GITHUB REPO EVERY 2 HOUR')
      .insert(testData)
      .select();
    
    if (error) {
      console.log('❌ Service Role插入失敗:', error.message);
      console.log('錯誤詳情:', error);
    } else {
      console.log('✅ Service Role插入成功!');
      console.log('插入的數據:', data);
      
      // 清理測試數據
      console.log('\n清理測試數據...');
      const { error: deleteError } = await supabaseServiceRole
        .from('GITHUB REPO EVERY 2 HOUR')
        .delete()
        .eq('Name', 'test-service-role');
      
      if (deleteError) {
        console.log('清理失敗:', deleteError.message);
      } else {
        console.log('測試數據已清理');
      }
    }
    
  } catch (error) {
    console.error('測試過程中發生錯誤:', error.message);
  }
}

testServiceRole();