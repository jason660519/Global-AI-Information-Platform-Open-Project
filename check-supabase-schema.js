import { createClient } from '@supabase/supabase-js';
import config from './src/config/index.js';

async function checkTableSchema() {
  try {
    console.log('檢查Supabase表格結構...');
    
    const supabase = createClient(
      config.supabase.url,
      config.supabase.key
    );
    
    // 嘗試使用SQL查詢來獲取表格結構
    console.log('\n1. 使用SQL查詢表格結構...');
    const { data, error } = await supabase
      .rpc('sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'GITHUB REPO EVERY 2 HOUR'
          ORDER BY ordinal_position;
        `
      });
    
    if (error) {
      console.log('SQL查詢錯誤:', error.message);
      
      // 嘗試另一種方法：直接查詢PostgreSQL系統表
      console.log('\n2. 嘗試直接查詢系統表...');
      const { data: sysData, error: sysError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'GITHUB REPO EVERY 2 HOUR');
      
      if (sysError) {
        console.log('系統表查詢錯誤:', sysError.message);
        
        // 最後嘗試：使用PostgREST的內省功能
        console.log('\n3. 嘗試使用PostgREST內省...');
        try {
          const response = await fetch(`${config.supabase.url}/rest/v1/`, {
            headers: {
              'apikey': config.supabase.key,
              'Authorization': `Bearer ${config.supabase.key}`
            }
          });
          
          if (response.ok) {
            const schema = await response.json();
            console.log('PostgREST schema:', schema);
          } else {
            console.log('PostgREST請求失敗:', response.status, response.statusText);
          }
        } catch (fetchError) {
          console.log('Fetch錯誤:', fetchError.message);
        }
      } else {
        console.log('系統表查詢成功:', sysData);
      }
    } else {
      console.log('SQL查詢成功:', data);
    }
    
    // 嘗試查看表格的OpenAPI規範
    console.log('\n4. 嘗試獲取OpenAPI規範...');
    try {
      const response = await fetch(`${config.supabase.url}/rest/v1/`, {
        headers: {
          'apikey': config.supabase.key,
          'Authorization': `Bearer ${config.supabase.key}`,
          'Accept': 'application/openapi+json'
        }
      });
      
      if (response.ok) {
        const openapi = await response.json();
        console.log('OpenAPI規範獲取成功');
        
        // 查找表格定義
        if (openapi.definitions && openapi.definitions['GITHUB REPO EVERY 2 HOUR']) {
      console.log('找到表格定義:', openapi.definitions['GITHUB REPO EVERY 2 HOUR']);
        } else {
          console.log('可用的表格定義:', Object.keys(openapi.definitions || {}));
        }
      } else {
        console.log('OpenAPI請求失敗:', response.status, response.statusText);
      }
    } catch (fetchError) {
      console.log('OpenAPI Fetch錯誤:', fetchError.message);
    }
    
  } catch (error) {
    console.error('檢查過程中發生錯誤:', error.message);
  }
}

checkTableSchema();