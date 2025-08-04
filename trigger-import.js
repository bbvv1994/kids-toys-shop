const fetch = require('node-fetch');

async function triggerImport() {
  try {
    console.log('🚀 Вызываем импорт данных через API...');
    
    // Получаем токен администратора (нужно будет заменить на реальный токен)
    const adminToken = 'your-admin-token-here'; // Замените на реальный токен
    
    const response = await fetch('https://kids-toys-backend.onrender.com/api/debug/import-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Импорт успешно завершен!');
      console.log('📊 Статистика:', result.stats);
    } else {
      console.log('❌ Ошибка при импорте:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при вызове API:', error.message);
  }
}

console.log('⚠️ ВНИМАНИЕ: Нужно заменить "your-admin-token-here" на реальный токен администратора!');
console.log('Для получения токена:');
console.log('1. Войдите в приложение как администратор');
console.log('2. Откройте DevTools (F12)');
console.log('3. Перейдите в Application/Storage -> Local Storage');
console.log('4. Найдите токен и скопируйте его');
console.log('5. Замените "your-admin-token-here" на скопированный токен');
console.log('6. Запустите скрипт снова');

// triggerImport(); // Раскомментируйте после замены токена 