const LocalImageHandler = require('./localImageHandler');
const CloudinaryImageHandler = require('./cloudinaryImageHandler');

class SmartImageHandler {
  constructor() {
    // Определяем среду по переменным окружения
    this.isDevelopment = process.env.NODE_ENV === 'development' || 
                        process.env.NODE_ENV === 'test' ||
                        !process.env.CLOUDINARY_CLOUD_NAME;
    
    // Инициализируем обработчики
    this.localHandler = new LocalImageHandler();
    this.cloudinaryHandler = null;
    
    // Создаем Cloudinary handler только если есть настройки
    console.log('🔍 Cloudinary настройки:');
    console.log('  - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'Missing');
    console.log('  - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
    console.log('  - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        this.cloudinaryHandler = new CloudinaryImageHandler();
        console.log('✅ Cloudinary handler инициализирован');
      } catch (error) {
        console.warn('⚠️ Cloudinary handler не удалось инициализировать:', error.message);
        console.warn('⚠️ Error stack:', error.stack);
      }
    } else {
      console.log('⚠️ CLOUDINARY_CLOUD_NAME не найден, Cloudinary отключен');
    }
    
    console.log(`🔧 SmartImageHandler: ${this.isDevelopment ? 'LOCAL' : 'PRODUCTION'} режим`);
    console.log(`   Локальный обработчик: ${this.localHandler ? '✅' : '❌'}`);
    console.log(`   Cloudinary обработчик: ${this.cloudinaryHandler ? '✅' : '❌'}`);
  }

  /**
   * Получает активный обработчик для текущей среды
   */
  getActiveHandler() {
    if (this.isDevelopment) {
      return this.localHandler;
    }
    
    // В продакшене предпочитаем Cloudinary, но fallback на локальный
    if (this.cloudinaryHandler) {
      return this.cloudinaryHandler;
    }
    
    console.warn('⚠️ Cloudinary недоступен, используем локальный обработчик');
    return this.localHandler;
  }

  /**
   * Обрабатывает изображение с автоматическим выбором обработчика
   */
  async processImageFromBuffer(buffer, originalName) {
    const handler = this.getActiveHandler();
    const handlerName = handler === this.localHandler ? 'LOCAL' : 'CLOUDINARY';
    
    console.log(`🖼️ SmartImageHandler: Обработка через ${handlerName} handler`);
    
    try {
      const result = await handler.processImageFromBuffer(buffer, originalName);
      
      if (result.success) {
        console.log(`✅ ${originalName} обработано через ${handlerName}`);
        
        // Добавляем информацию о том, какой обработчик использовался
        result.processedBy = handlerName;
        result.environment = this.isDevelopment ? 'development' : 'production';
        
        return result;
      } else {
        console.error(`❌ Ошибка обработки через ${handlerName}:`, result.error);
        return result;
      }
    } catch (error) {
      console.error(`❌ Критическая ошибка в ${handlerName} handler:`, error.message);
      
      // Fallback на другой обработчик, если возможно
      if (handler === this.cloudinaryHandler && this.localHandler) {
        console.log('🔄 Fallback на локальный обработчик...');
        return await this.localHandler.processImageFromBuffer(buffer, originalName);
      } else if (handler === this.localHandler && this.cloudinaryHandler) {
        console.log('🔄 Fallback на Cloudinary обработчик...');
        return await this.cloudinaryHandler.processImageFromBuffer(buffer, originalName);
      }
      
      return {
        success: false,
        error: `Ошибка во всех обработчиках: ${error.message}`,
        originalName
      };
    }
  }

  /**
   * Создает HD-версии изображения
   */
  async createHdVersions(buffer, baseFilename) {
    const handler = this.getActiveHandler();
    const handlerName = handler === this.localHandler ? 'LOCAL' : 'CLOUDINARY';
    
    console.log(`🖼️ SmartImageHandler: Создание HD-версий через ${handlerName}`);
    
    try {
      if (handler === this.localHandler) {
        return await handler.createHdVersions(buffer, baseFilename);
      } else if (handler === this.cloudinaryHandler) {
        return await handler.createHdVersions(buffer, baseFilename);
      }
    } catch (error) {
      console.error(`❌ Ошибка создания HD-версий через ${handlerName}:`, error.message);
      return {};
    }
  }

  /**
   * Получает HD-версию изображения по URL
   */
  getHdImageUrl(originalUrl, quality = '2x') {
    const handler = this.getActiveHandler();
    const handlerName = handler === this.localHandler ? 'LOCAL' : 'CLOUDINARY';
    
    console.log(`🔧 SmartImageHandler: getHdImageUrl через ${handlerName}`);
    
    try {
      if (handler === this.localHandler) {
        return handler.getHdImageUrl(originalUrl, quality);
      } else if (handler === this.cloudinaryHandler) {
        return handler.getHdImageUrl(originalUrl, quality);
      }
    } catch (error) {
      console.error(`❌ Ошибка getHdImageUrl через ${handlerName}:`, error.message);
      return originalUrl;
    }
    
    return originalUrl;
  }

  /**
   * Обрабатывает массив изображений
   */
  async processMultipleImages(files) {
    const handler = this.getActiveHandler();
    const handlerName = handler === this.localHandler ? 'LOCAL' : 'CLOUDINARY';
    
    console.log(`🖼️ SmartImageHandler: Обработка ${files.length} файлов через ${handlerName}`);
    
    try {
      if (handler === this.localHandler) {
        return await handler.processMultipleImages(files);
      } else if (handler === this.cloudinaryHandler) {
        return await handler.processMultipleImages(files);
      }
    } catch (error) {
      console.error(`❌ Ошибка processMultipleImages через ${handlerName}:`, error.message);
      return [];
    }
    
    return [];
  }

  /**
   * Проверяет размеры файлов
   */
  checkFileSizes(files) {
    const handler = this.getActiveHandler();
    
    try {
      if (handler === this.localHandler) {
        return handler.checkFileSizes(files);
      } else if (handler === this.cloudinaryHandler) {
        return handler.checkFileSizes(files);
      }
    } catch (error) {
      console.error('❌ Ошибка checkFileSizes:', error.message);
      return [];
    }
    
    return [];
  }

  /**
   * Удаляет изображение и его HD-версии
   */
  async deleteImage(imageUrl) {
    const handler = this.getActiveHandler();
    const handlerName = handler === this.localHandler ? 'LOCAL' : 'CLOUDINARY';
    
    console.log(`🗑️ SmartImageHandler: Удаление через ${handlerName}`);
    
    try {
      if (handler === this.localHandler) {
        return await handler.deleteImage(imageUrl);
      } else if (handler === this.cloudinaryHandler) {
        return await handler.deleteImage(imageUrl);
      }
    } catch (error) {
      console.error(`❌ Ошибка удаления через ${handlerName}:`, error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Неизвестный обработчик' };
  }

  /**
   * Получает информацию о HD-версиях изображения
   */
  async getHdImageInfo(imageUrl) {
    const handler = this.getActiveHandler();
    const handlerName = handler === this.localHandler ? 'LOCAL' : 'CLOUDINARY';
    
    console.log(`🔍 SmartImageHandler: getHdImageInfo через ${handlerName}`);
    
    try {
      if (handler === this.localHandler) {
        return await handler.getHdImageInfo(imageUrl);
      } else if (handler === this.cloudinaryHandler) {
        return await handler.getHdImageInfo(imageUrl);
      }
    } catch (error) {
      console.error(`❌ Ошибка getHdImageInfo через ${handlerName}:`, error.message);
      return null;
    }
    
    return null;
  }

  /**
   * Получает информацию о текущей конфигурации
   */
  getConfigInfo() {
    return {
      environment: this.isDevelopment ? 'development' : 'production',
      localHandler: !!this.localHandler,
      cloudinaryHandler: !!this.cloudinaryHandler,
      activeHandler: this.getActiveHandler() === this.localHandler ? 'local' : 'cloudinary',
      cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME
    };
  }

  /**
   * Принудительно переключает на локальный обработчик
   */
  forceLocalMode() {
    this.isDevelopment = true;
    console.log('🔧 SmartImageHandler: Принудительно переключен на LOCAL режим');
  }

  /**
   * Принудительно переключает на Cloudinary обработчик
   */
  forceCloudinaryMode() {
    this.isDevelopment = false;
    console.log('🔧 SmartImageHandler: Принудительно переключен на CLOUDINARY режим');
  }
}

module.exports = SmartImageHandler;
