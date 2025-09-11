const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Создает HD версии для всех изображений в Cloudinary
 */
async function createHdVersionsForAllImages() {
  try {
    console.log('🖼️ Начинаем создание HD версий для всех изображений в Cloudinary...');
    console.log(`🔧 Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    
    // Получаем список всех изображений в папке kids-toys-shop
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'kids-toys-shop/',
      max_results: 1000, // Увеличиваем лимит
      resource_type: 'image'
    });
    
    console.log(`📋 Найдено ${result.resources.length} изображений`);
    
    if (result.resources.length === 0) {
      console.log('⚠️ Изображения не найдены. Проверьте настройки Cloudinary.');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    let hdVersionsCreated = 0;
    
    for (const resource of result.resources) {
      try {
        console.log(`\n🔄 Обрабатываем: ${resource.public_id}`);
        console.log(`   URL: ${resource.secure_url}`);
        console.log(`   Формат: ${resource.format}`);
        console.log(`   Размер: ${resource.width}x${resource.height}`);
        
        // Создаем HD версии - реально загружаем их в Cloudinary
        console.log(`   🔄 Загружаем HD @2x версию...`);
        const hd2xResult = await cloudinary.uploader.upload(
          cloudinary.url(resource.public_id, {
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          }),
          {
            public_id: `${resource.public_id}_hd2x`,
            resource_type: 'image',
            overwrite: true
          }
        );
        
        console.log(`   🔄 Загружаем HD @4x версию...`);
        const hd4xResult = await cloudinary.uploader.upload(
          cloudinary.url(resource.public_id, {
            transformation: [
              { width: 2400, height: 2400, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          }),
          {
            public_id: `${resource.public_id}_hd4x`,
            resource_type: 'image',
            overwrite: true
          }
        );
        
        // Проверяем, что HD версии загружены
        console.log(`✅ HD версии загружены для ${resource.public_id}:`);
        console.log(`   HD @2x: ${hd2xResult.secure_url}`);
        console.log(`   HD @4x: ${hd4xResult.secure_url}`);
        
        // Проверяем доступность HD версий
        try {
          const hd2xResponse = await fetch(hd2xResult.secure_url);
          const hd4xResponse = await fetch(hd4xResult.secure_url);
          
          if (hd2xResponse.ok && hd4xResponse.ok) {
            console.log(`   ✅ HD версии доступны и загружаются`);
            hdVersionsCreated += 2;
          } else {
            console.log(`   ⚠️ HD версии загружены, но могут быть недоступны`);
          }
        } catch (fetchError) {
          console.log(`   ⚠️ Не удалось проверить доступность HD версий: ${fetchError.message}`);
        }
        
        successCount++;
        
        // Небольшая задержка, чтобы не перегружать Cloudinary API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Ошибка при создании HD версий для ${resource.public_id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎯 Итоговый результат:');
    console.log(`✅ Успешно обработано: ${successCount}`);
    console.log(`❌ Ошибки: ${errorCount}`);
    console.log(`📊 Всего изображений: ${result.resources.length}`);
    console.log(`🖼️ HD версий создано: ${hdVersionsCreated}`);
    
    if (hdVersionsCreated > 0) {
      console.log('\n🎉 HD версии успешно созданы! Теперь лупа должна работать с высоким качеством.');
    } else {
      console.log('\n⚠️ HD версии не были созданы. Проверьте настройки Cloudinary.');
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error('Стек ошибки:', error.stack);
  }
}

/**
 * Проверяет настройки Cloudinary
 */
async function checkCloudinaryConfig() {
  try {
    console.log('🔧 Проверка настроек Cloudinary...');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('CLOUDINARY_CLOUD_NAME не установлен');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error('CLOUDINARY_API_KEY не установлен');
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('CLOUDINARY_API_SECRET не установлен');
    }
    
    console.log('✅ Все переменные окружения установлены');
    
    // Проверяем подключение к Cloudinary
    const result = await cloudinary.api.ping();
    console.log('✅ Подключение к Cloudinary успешно');
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка проверки настроек Cloudinary:', error.message);
    return false;
  }
}

// Основная функция
async function main() {
  console.log('🚀 Запуск скрипта создания HD версий...');
  
  const configOk = await checkCloudinaryConfig();
  if (!configOk) {
    console.error('❌ Настройки Cloudinary неверны. Завершение работы.');
    process.exit(1);
  }
  
  await createHdVersionsForAllImages();
  
  console.log('\n🏁 Скрипт завершен.');
}

// Запускаем скрипт
main().catch(error => {
  console.error('❌ Неожиданная ошибка:', error);
  process.exit(1);
});
