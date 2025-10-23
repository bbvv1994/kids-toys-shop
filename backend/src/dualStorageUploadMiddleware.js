const DualStorageImageHandler = require('./dualStorageImageHandler');

class DualStorageUploadMiddleware {
  constructor() {
    this.imageHandler = new DualStorageImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов с двойным сохранением
   */
  async processUploadedFiles(req, res, next) {
    try {
      console.log('🖼️ DualStorageUploadMiddleware: processUploadedFiles вызван');
      console.log('🖼️ DualStorageUploadMiddleware: req.files =', req.files ? req.files.length : 'undefined');
      
      if (!req.files || req.files.length === 0) {
        console.log('🖼️ DualStorageUploadMiddleware: Нет файлов для обработки');
        return next();
      }

      // Получаем информацию о конфигурации
      const configInfo = this.imageHandler.getConfigInfo();
      console.log('🔧 Конфигурация DualStorage:', configInfo);

      console.log(`🖼️ DualStorageUploadMiddleware: Обработка ${req.files.length} загруженных файлов...`);

      // Проверяем размеры файлов
      const sizeErrors = this.imageHandler.checkFileSizes(req.files);
      if (sizeErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Проверка размера файла не пройдена', 
          details: sizeErrors 
        });
      }

      // Обрабатываем изображения с двойным сохранением
      const results = await this.imageHandler.processMultipleImages(req.files);

      // Подготавливаем данные для сохранения в базу
      const imageUrls = [];
      const processedFiles = [];
      const storageInfo = [];

      for (const result of results) {
        if (result.success) {
          const fileInfo = {
            filename: result.filename,
            originalName: result.originalName || 'unknown',
            size: result.processedSize,
            mimetype: result.mimetype,
            url: result.url, // Основной URL (обычно Cloudinary)
            originalSize: result.originalSize,
            compressionRatio: result.compressionRatio,
            processedBy: result.processedBy || 'dual_storage',
            environment: result.environment || 'production',
            storage: result.storage || {}
          };
          
          processedFiles.push(fileInfo);
          imageUrls.push(result.url);
          
          // Добавляем информацию о хранилищах
          if (result.storage) {
            storageInfo.push({
              primary: result.storage.primary,
              fallback: result.storage.fallback,
              cloudinaryUrl: result.storage.cloudinaryUrl,
              localUrl: result.storage.localUrl
            });
          }
          
          console.log(`✅ Обработано: ${result.filename} -> ${result.url}`);
          console.log(`   Обработчик: ${result.processedBy || 'dual_storage'}`);
          console.log(`   Основное хранилище: ${result.storage?.primary || 'unknown'}`);
          console.log(`   Резервное хранилище: ${result.storage?.fallback || 'none'}`);
        } else {
          console.error(`❌ Ошибка обработки: ${result.originalName} - ${result.error}`);
        }
      }

      // Добавляем обработанные данные в request
      req.imageUrls = imageUrls;
      req.processedFiles = processedFiles;
      req.storageInfo = storageInfo;
      req.imageProcessingConfig = configInfo;

      console.log(`✅ DualStorageUploadMiddleware: Обработано ${imageUrls.length} файлов`);
      console.log(`   Основное хранилище: Cloudinary`);
      console.log(`   Резервное хранилище: Локальное (сжатое)`);
      next();

    } catch (error) {
      console.error('❌ DualStorageUploadMiddleware error:', error);
      res.status(500).json({ 
        error: 'Обработка изображений не удалась', 
        details: error.message 
      });
    }
  }

  /**
   * Middleware для удаления старых изображений при обновлении
   */
  async deleteOldImages(req, res, next) {
    try {
      const { oldImageUrls } = req.body;
      
      if (!oldImageUrls || !Array.isArray(oldImageUrls)) {
        return next();
      }

      console.log(`🗑️ DualStorageUploadMiddleware: Удаление ${oldImageUrls.length} старых изображений...`);

      const deletePromises = oldImageUrls.map(async (imageUrl) => {
        return await this.imageHandler.deleteImage(imageUrl);
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ DualStorageUploadMiddleware: Удалено ${successCount}/${oldImageUrls.length} старых изображений`);
      next();

    } catch (error) {
      console.error('❌ DualStorageUploadMiddleware deleteOldImages error:', error);
      next(); // Продолжаем даже если удаление не удалось
    }
  }

  /**
   * Middleware для получения информации о конфигурации
   */
  async getConfigInfo(req, res, next) {
    try {
      const configInfo = this.imageHandler.getConfigInfo();
      
      res.json({
        success: true,
        data: configInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ DualStorageUploadMiddleware getConfigInfo error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения информации о конфигурации'
      });
    }
  }

  /**
   * Middleware для получения статистики хранилищ
   */
  async getStorageStats(req, res, next) {
    try {
      const configInfo = this.imageHandler.getConfigInfo();
      
      // Здесь можно добавить логику для подсчета файлов в каждом хранилище
      const stats = {
        cloudinary: {
          enabled: configInfo.cloudinaryHandler,
          configured: configInfo.cloudinaryConfigured
        },
        local: {
          enabled: configInfo.localHandler
        },
        mode: 'dual_storage'
      };
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ DualStorageUploadMiddleware getStorageStats error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения статистики хранилищ'
      });
    }
  }
}

module.exports = DualStorageUploadMiddleware;

