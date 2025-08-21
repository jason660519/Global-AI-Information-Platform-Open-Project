import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function testSupabaseConnection() {
  console.log('測試Supabase連接...');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_KEY (前20字符):', process.env.SUPABASE_KEY?.substring(0, 20) + '...');
  
  try {
    // 使用anon key創建客戶端
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
    console.log('\n1. 測試基本連接...');
    const { data, error } = await supabase
      .from('GITHUB REPO EVERY 2 HOUR')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ 連接失敗:', error.message);
      console.log('錯誤詳情:', error);
      
      // 嘗試列出所有可用的表
      console.log('\n2. 嘗試獲取數據庫schema...');
      const { data: schemaData, error: schemaError } = await supabase.rpc('get_schema');
      if (schemaError) {
        console.log('無法獲取schema:', schemaError.message);
      } else {
        console.log('Schema數據:', schemaData);
      }
      
    } else {
      console.log('✅ 連接成功!');
      console.log('表格記錄數量:', data);
    }
    
    // 嘗試簡單的查詢
    console.log('\n3. 嘗試查詢前5條記錄...');
    const { data: records, error: queryError } = await supabase
      .from('GITHUB REPO EVERY 2 HOUR')
      .select('*')
      .limit(5);
    
    if (queryError) {
      console.log('❌ 查詢失敗:', queryError.message);
      console.log('錯誤詳情:', queryError);
    } else {
      console.log('✅ 查詢成功!');
      console.log('記錄數量:', records?.length || 0);
      if (records && records.length > 0) {
        console.log('第一條記錄的欄位:', Object.keys(records[0]));
      }
    }
    
  } catch (error) {
    console.error('測試過程中發生錯誤:', error.message);
    console.error('錯誤堆棧:', error.stack);
  }
}

testSupabaseConnection();