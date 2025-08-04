const fetch = require('node-fetch');

async function triggerImport() {
  try {
    console.log('🚀 Вызываем импорт данных через API...');
    
    const response = await fetch('https://kids-toys-backend.onrender.com/api/debug/import-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

console.log('✅ Готово! Теперь можно запустить импорт без токена.');

triggerImport(); // Запускаем импорт 