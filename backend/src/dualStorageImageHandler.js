const LocalImageHandler = require('./localImageHandler');
const CloudinaryImageHandler = require('./cloudinaryImageHandler');

class DualStorageImageHandler {
  constructor() {
    // Инициализируем оба обработчика
    this.localHandler = new LocalImageHandler();
    this.cloudinaryHandler = null;
    
    // Создаем Cloudinary handler только если есть настройки
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        this.cloudinaryHandler = new CloudinaryImageHandler();
        console.log('✅ DualStorage: Cloudinary handler инициализирован');
      } catch (error) {
        console.warn('⚠️ DualStorage: Cloudinary handler не удалось инициализировать:', error.message);
      }
    } else {
      console.log('⚠️ DualStorage: CLOUDINARY_CLOUD_NAME не найден, Cloudinary отключен');
    }
    
    console.log('🔧 DualStorageImageHandler: Режим двойного сохранения');
    console.log(`   Локальный обработчик: ${this.localHandler ? '✅' : '❌'}`);
    console.log(`   Cloudinary обработчик: ${this.cloudinaryHandler ? '✅' : '❌'}`);
  }

  /**
   * Обрабатывает изображение с двойным сохранением (Cloudinary + локально)
   * Всегда создает локальную резервную копию, но по умолчанию использует Cloudinary
   */
  async processImageFromBuffer(buffer, originalName) {
    console.log(`🖼️ DualStorage: Обработка ${originalName} с двойным сохранением...`);
    
    const results = {
      cloudinary: null,
      local: null
    };

    // 1. ВСЕГДА сохраняем локально как резерв (в сжатом качестве)
    try {
      console.log('💾 DualStorage: Создание локальной резервной копии...');
      
      // Создаем сжатую версию для локального хранения
      const compressedBuffer = await this.createCompressedVersion(buffer, originalName);
      results.local = await this.localHandler.processImageFromBuffer(compressedBuffer, originalName);
      
      if (results.local.success) {
        console.log('✅ DualStorage: Локальная резервная копия создана');
      } else {
        console.warn('⚠️ DualStorage: Локальная резервная копия не создана:', results.local.error);
      }
    } catch (error) {
      console.error('❌ DualStorage: Ошибка создания локальной резервной копии:', error.message);
      results.local = { success: false, error: error.message };
    }

    // 2. Пытаемся сохранить в Cloudinary (основное хранилище)
    if (this.cloudinaryHandler) {
      try {
        console.log('☁️ DualStorage: Сохранение в Cloudinary...');
        results.cloudinary = await this.cloudinaryHandler.processImageFromBuffer(buffer, originalName);
        
        if (results.cloudinary.success) {
          console.log('✅ DualStorage: Cloudinary сохранение успешно');
          
          // Cloudinary успешно - используем его как основной, но сохраняем информацию о резерве
          const result = {
            ...results.cloudinary,
            processedBy: 'DUAL_STORAGE',
            environment: 'production',
            storage: {
              primary: 'cloudinary',
              fallback: results.local && results.local.success ? 'local' : null,
              cloudinaryUrl: results.cloudinary.url,
              localUrl: results.local && results.local.success ? results.local.url : null
            }
          };
          
          console.log(`✅ DualStorage: Основной URL (Cloudinary): ${result.url}`);
          if (result.storage.localUrl) {
            console.log(`💾 DualStorage: Резервный URL (локальный): ${result.storage.localUrl}`);
          }
          
          return result;
        } else {
          console.warn('⚠️ DualStorage: Cloudinary сохранение не удалось:', results.cloudinary.error);
        }
      } catch (error) {
        console.error('❌ DualStorage: Ошибка Cloudinary:', error.message);
        results.cloudinary = { success: false, error: error.message };
      }
    }

    // 3. Если Cloudinary недоступен, используем локальную копию
    if (results.local && results.local.success) {
      console.log('🔄 DualStorage: Cloudinary недоступен, используем локальную резервную копию');
      
      const result = {
        ...results.local,
        processedBy: 'DUAL_STORAGE_FALLBACK',
        environment: 'production',
        storage: {
          primary: 'local',
          fallback: null,
          cloudinaryUrl: null,
          localUrl: results.local.url
        }
      };
      
      console.log(`💾 DualStorage: Используем локальную копию: ${result.url}`);
      return result;
    } else {
      // Ни один способ не работает
      return {
        success: false,
        error: 'Не удалось сохранить изображение ни в Cloudinary, ни локально',
        originalName,
        details: {
          cloudinary: results.cloudinary,
          local: results.local
        }
      };
    }
  }

  /**
   * Создает сжатую версию изображения для локального хранения
   */
  async createCompressedVersion(buffer, originalName) {
    const sharp = require('sharp');
    
    try {
      // Создаем сжатую версию (качество 70%, максимальная ширина 1200px)
      const compressedBuffer = await sharp(buffer)
        .resize(1200, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ 
          quality: 70,
          progressive: true
        })
        .toBuffer();
      
      console.log(`📦 DualStorage: Сжатие ${originalName}: ${buffer.length} -> ${compressedBuffer.length} байт`);
      return compressedBuffer;
    } catch (error) {
      console.warn('⚠️ DualStorage: Ошибка сжатия, используем оригинал:', error.message);
      return buffer;
    }
  }

  /**
   * Обрабатывает массив изображений с двойным сохранением
   */
  async processMultipleImages(files) {
    console.log(`🖼️ DualStorage: Обработка ${files.length} файлов с двойным сохранением...`);
    
    const results = [];
    
    for (const file of files) {
      if (this.isImageFile(file.originalname)) {
        const result = await this.processImageFromBuffer(file.buffer, file.originalname);
        results.push(result);
      } else {
        // Для не-изображений создаем запись без обработки
        results.push({
          success: false,
          error: 'Файл не является изображением',
          originalName: file.originalname
        });
      }
    }
    
    return results;
  }

  /**
   * Проверяет, является ли файл изображением
   */
  isImageFile(filename) {
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const ext = require('path').extname(filename).toLowerCase();
    return supportedFormats.includes(ext);
  }

  /**
   * Проверяет размеры файлов
   */
  checkFileSizes(files) {
    const errors = [];
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        errors.push(`Файл ${file.originalname} слишком большой: ${(file.size / 1024 / 1024).toFixed(2)}MB (максимум 50MB)`);
      }
    }
    
    return errors;
  }

  /**
   * Удаляет изображение из обоих хранилищ
   */
  async deleteImage(imageUrl) {
    console.log(`🗑️ DualStorage: Удаление ${imageUrl} из обоих хранилищ...`);
    
    const results = {
      cloudinary: { success: false },
      local: { success: false }
    };

    // Удаляем из Cloudinary
    if (this.cloudinaryHandler && imageUrl.includes('cloudinary.com')) {
      try {
        results.cloudinary = await this.cloudinaryHandler.deleteImage(imageUrl);
        console.log(`☁️ DualStorage: Cloudinary удаление: ${results.cloudinary.success ? 'успешно' : 'не удалось'}`);
      } catch (error) {
        console.error('❌ DualStorage: Ошибка удаления из Cloudinary:', error.message);
      }
    }

    // Удаляем локально
    if (imageUrl.startsWith('/uploads/')) {
      try {
        results.local = await this.localHandler.deleteImage(imageUrl);
        console.log(`💾 DualStorage: Локальное удаление: ${results.local.success ? 'успешно' : 'не удалось'}`);
      } catch (error) {
        console.error('❌ DualStorage: Ошибка локального удаления:', error.message);
      }
    }

    return {
      success: results.cloudinary.success || results.local.success,
      details: results
    };
  }

  /**
   * Получает информацию о конфигурации
   */
  getConfigInfo() {
    return {
      environment: 'production',
      mode: 'dual_storage',
      localHandler: !!this.localHandler,
      cloudinaryHandler: !!this.cloudinaryHandler,
      activeHandler: 'dual_storage',
      cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
      description: 'Двойное сохранение: Cloudinary (основное) + локальное (резерв)'
    };
  }
}

module.exports = DualStorageImageHandler;
