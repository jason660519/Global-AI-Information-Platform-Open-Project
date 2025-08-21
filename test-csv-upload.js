import { SupabaseUploader } from './src/uploaders/supabase-uploader.js';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import 'dotenv/config';

async function testCSVUpload() {
  try {
    console.log('測試CSV文件上傳到Supabase...');
    
    // 找到最新的CSV文件
    const exportsDir = './exports';
    const files = await fs.readdir(exportsDir);
    const csvFiles = files.filter(file => file.endsWith('.csv')).sort().reverse();
    
    if (csvFiles.length === 0) {
      console.log('❌ 未找到CSV文件');
      return;
    }
    
    const latestCSV = csvFiles[0];
    const csvPath = path.join(exportsDir, latestCSV);
    
    console.log(`找到最新CSV文件: ${latestCSV}`);
    
    // 檢查文件大小
    const stats = await fs.stat(csvPath);
    console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // 創建上傳器實例
    const uploader = new SupabaseUploader();
    
    // 直接創建supabase客戶端用於測試
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
    // 測試連接
    console.log('\n1. 測試Supabase連接...');
    try {
      const { data, error } = await supabase
         .from('GITHUB REPO EVERY 2 HOUR')
         .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log('❌ 連接失敗:', error.message);
        return;
      }
      console.log('✅ 連接成功');
    } catch (error) {
      console.log('❌ 連接失敗:', error.message);
      return;
    }
    
    // 檢查表格記錄數量
    console.log('\n2. 檢查表格當前記錄數量...');
    const { count: beforeCount } = await supabase
       .from('GITHUB REPO EVERY 2 HOUR')
       .select('*', { count: 'exact', head: true });
    console.log(`當前記錄數量: ${beforeCount || 0}`);
    
    // 讀取CSV文件的前幾行來檢查結構
    console.log('\n3. 檢查CSV文件結構...');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    console.log('CSV標題行:', lines[0]);
    if (lines.length > 1) {
      console.log('第一行數據:', lines[1]);
    }
    console.log(`總行數: ${lines.length - 1}`);
    
    // 嘗試上傳CSV文件
    console.log('\n4. 開始上傳CSV文件...');
    const uploadResult = await uploader.uploadFromCSV(csvPath, 'GITHUB REPO EVERY 2 HOUR');
    
    console.log('\n上傳結果:');
    console.log(`總數: ${uploadResult.total}`);
    console.log(`成功: ${uploadResult.successful}`);
    console.log(`失敗: ${uploadResult.failed}`);
    
    if (uploadResult.errors.length > 0) {
      console.log('\n錯誤詳情:');
      uploadResult.errors.forEach((error, index) => {
        console.log(`${index + 1}. Batch ${error.batch}: ${error.error} (${error.records} records)`);
      });
    }
    
    // 檢查上傳後的記錄數量
    console.log('\n5. 檢查上傳後記錄數量...');
    const { count: afterCount } = await supabase
       .from('GITHUB REPO EVERY 2 HOUR')
       .select('*', { count: 'exact', head: true });
    console.log(`上傳後記錄數量: ${afterCount || 0}`);
    console.log(`新增記錄: ${(afterCount || 0) - (beforeCount || 0)}`);
    
    if (uploadResult.successful > 0) {
      console.log('\n✅ CSV文件上傳成功!');
    } else {
      console.log('\n❌ CSV文件上傳失敗');
    }
    
  } catch (error) {
    console.error('測試過程中發生錯誤:', error.message);
    console.error('錯誤堆棧:', error.stack);
  }
}

testCSVUpload();