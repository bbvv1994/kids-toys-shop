const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📥 Скачивание данных с сервера Render...\n');

// Проверяем, есть ли файл с данными сервера
const serverExportPath = path.join(__dirname, '..', 'server-export.json');
const serverBackupPath = path.join(__dirname, '..', 'server-backup-2025-08-07.json');

if (fs.existsSync(serverExportPath)) {
  console.log('✅ Файл server-export.json найден');
  console.log(`📁 Путь: ${serverExportPath}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(serverExportPath, 'utf8'));
    console.log('\n📊 Статистика данных:');
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
    
    console.log('\n✅ Данные сервера успешно загружены!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Запустите npm run restore-server для восстановления данных');
    console.log('2. Или используйте данные для тестирования локально');
    
  } catch (error) {
    console.error('❌ Ошибка при чтении файла server-export.json:', error.message);
  }
  
} else if (fs.existsSync(serverBackupPath)) {
  console.log('✅ Файл server-backup-2025-08-07.json найден');
  console.log(`📁 Путь: ${serverBackupPath}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(serverBackupPath, 'utf8'));
    console.log('\n📊 Статистика данных:');
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
    
    console.log('\n✅ Данные сервера успешно загружены!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Запустите npm run restore-server для восстановления данных');
    console.log('2. Или используйте данные для тестирования локально');
    
  } catch (error) {
    console.error('❌ Ошибка при чтении файла server-backup-2025-08-07.json:', error.message);
  }
  
} else {
  console.log('❌ Файлы с данными сервера не найдены');
  console.log('\n📋 Для получения данных с сервера:');
  console.log('1. Подключитесь к Render через SSH или веб-консоль');
  console.log('2. Перейдите в директорию: cd /opt/render/project/src/backend');
  console.log('3. Запустите: npm run export-server');
  console.log('4. Скачайте файлы server-export.json и server-backup-YYYY-MM-DD.json');
  console.log('5. Поместите их в корневую папку проекта');
  console.log('6. Запустите этот скрипт снова');
  
  console.log('\n🔗 Альтернативные способы получения данных:');
  console.log('- Используйте панель управления Render для доступа к файлам');
  console.log('- Или выполните команды напрямую на сервере');
} 