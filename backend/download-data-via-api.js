const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('📥 Скачивание данных с сервера через API...\n');

// Конфигурация
const SERVER_URL = process.env.SERVER_URL || 'https://kids-toys-backend.onrender.com';
const API_ENDPOINT = '/api/export-data';
const OUTPUT_FILE = path.join(__dirname, '..', 'server-export.json');
const BACKUP_FILE = path.join(__dirname, '..', `server-backup-${new Date().toISOString().split('T')[0]}.json`);

async function downloadData() {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}${API_ENDPOINT}`;
    console.log(`🔗 Подключение к: ${url}`);
    
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`📊 Статус ответа: ${res.statusCode}`);
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Ошибка парсинга JSON: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Ошибка запроса: ${error.message}`));
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Таймаут запроса (30 секунд)'));
    });
  });
}

async function saveData(data) {
  try {
    // Сохраняем основную копию
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Данные сохранены в: ${OUTPUT_FILE}`);
    
    // Создаем резервную копию
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
    console.log(`📦 Резервная копия создана: ${BACKUP_FILE}`);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении данных:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Скачиваем данные
    console.log('🔄 Скачивание данных...');
    const data = await downloadData();
    
    // Проверяем структуру данных
    console.log('\n📊 Статистика скачанных данных:');
    console.log(`   - Категории: ${data.categories?.length || 0}`);
    console.log(`   - Товары: ${data.products?.length || 0}`);
    console.log(`   - Пользователи: ${data.users?.length || 0}`);
    console.log(`   - Заказы: ${data.orders?.length || 0}`);
    console.log(`   - Вопросы: ${data.productQuestions?.length || 0}`);
    console.log(`   - Отзывы: ${data.reviews?.length || 0}`);
    console.log(`   - Отзывы магазина: ${data.shopReviews?.length || 0}`);
    console.log(`   - Избранное: ${data.wishlists?.length || 0}`);
    console.log(`   - Уведомления: ${data.notifications?.length || 0}`);
    console.log(`   - Дата экспорта: ${data.exportDate || 'не указана'}`);
    
    // Сохраняем данные
    console.log('\n💾 Сохранение данных...');
    const saved = await saveData(data);
    
    if (saved) {
      console.log('\n🎉 Данные успешно скачаны и сохранены!');
      console.log('\n📋 Следующие шаги:');
      console.log('1. Запустите npm run restore-server для восстановления данных');
      console.log('2. Или используйте данные для тестирования локально');
    } else {
      console.log('\n❌ Ошибка при сохранении данных');
    }
    
  } catch (error) {
    console.error('\n❌ Ошибка при скачивании данных:', error.message);
    console.log('\n🔗 Альтернативные способы получения данных:');
    console.log('1. Откройте в браузере:', `${SERVER_URL}${API_ENDPOINT}`);
    console.log('2. Скопируйте JSON и сохраните в файл server-export.json');
    console.log('3. Поместите файл в корневую папку проекта');
  }
}

// Запускаем скрипт
main(); 