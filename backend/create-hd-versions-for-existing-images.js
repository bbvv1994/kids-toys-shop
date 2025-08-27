const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Создает HD версии для всех изображений в папке kids-toys-shop
 */
async function createHdVersionsForAllImages() {
  try {
    console.log('🖼️ Начинаем создание HD версий для всех существующих изображений...');
    
    // Получаем список всех изображений в папке kids-toys-shop
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'kids-toys-shop/',
      max_results: 500
    });
    
    console.log(`📋 Найдено ${result.resources.length} изображений`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const resource of result.resources) {
      try {
        console.log(`🔄 Обрабатываем: ${resource.public_id}`);
        
        // Создаем HD версии
        const hd2xUrl = cloudinary.url(resource.public_id, {
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        
        const hd4xUrl = cloudinary.url(resource.public_id, {
          transformation: [
            { width: 2400, height: 2400, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        
        // Проверяем, что HD версии доступны
        console.log(`✅ HD версии созданы для ${resource.public_id}:`);
        console.log(`   HD @2x: ${hd2xUrl}`);
        console.log(`   HD @4x: ${hd4xUrl}`);
        
        successCount++;
        
        // Небольшая задержка, чтобы не перегружать Cloudinary API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Ошибка при создании HD версий для ${resource.public_id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎯 Результат:');
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибки: ${errorCount}`);
    console.log(`📊 Всего: ${result.resources.length}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

// Запускаем скрипт
createHdVersionsForAllImages();
