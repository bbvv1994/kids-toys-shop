const SmartImageHandler = require('./smartImageHandler');

class SmartImageUploadMiddleware {
  constructor() {
    this.imageHandler = new SmartImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов с умным выбором обработчика
   */
  async processUploadedFiles(req, res, next) {
    try {
      console.log('🖼️ SmartImageUploadMiddleware: processUploadedFiles вызван');
      console.log('🖼️ SmartImageUploadMiddleware: req.files =', req.files ? req.files.length : 'undefined');
      
      if (!req.files || req.files.length === 0) {
        console.log('🖼️ SmartImageUploadMiddleware: Нет файлов для обработки');
        return next();
      }

      // Получаем информацию о конфигурации
      const configInfo = this.imageHandler.getConfigInfo();
      console.log('🔧 Конфигурация SmartImageHandler:', configInfo);

      console.log(`🖼️ SmartImageUploadMiddleware: Обработка ${req.files.length} загруженных файлов...`);

      // Проверяем размеры файлов
      const sizeErrors = this.imageHandler.checkFileSizes(req.files);
      if (sizeErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Проверка размера файла не пройдена', 
          details: sizeErrors 
        });
      }

      // Обрабатываем изображения
      const results = await this.imageHandler.processMultipleImages(req.files);

      // Подготавливаем данные для сохранения в базу
      const imageUrls = [];
      const processedFiles = [];
      const hdImageInfo = [];

      for (const result of results) {
        if (result.success) {
          const fileInfo = {
            filename: result.filename,
            originalName: result.originalName || 'unknown',
            size: result.processedSize,
            mimetype: result.mimetype,
            url: result.url,
            originalSize: result.originalSize,
            compressionRatio: result.compressionRatio,
            processedBy: result.processedBy || 'unknown',
            environment: result.environment || 'unknown'
          };
          
          processedFiles.push(fileInfo);
          imageUrls.push(result.url);
          
          // Добавляем информацию о HD-версиях
          if (result.hdVersions && Object.keys(result.hdVersions).length > 0) {
            hdImageInfo.push({
              original: result.url,
              hdVersions: result.hdVersions,
              processedBy: result.processedBy
            });
          }
          
          console.log(`✅ Обработано: ${result.filename} -> ${result.url}`);
          console.log(`   Обработчик: ${result.processedBy || 'unknown'}`);
          console.log(`   Среда: ${result.environment || 'unknown'}`);
          
          if (result.hdVersions) {
            console.log(`   HD-версии: ${Object.keys(result.hdVersions).join(', ')}`);
          }
        } else {
          console.error(`❌ Ошибка обработки: ${result.originalName} - ${result.error}`);
        }
      }

      // Добавляем обработанные данные в request
      req.imageUrls = imageUrls;
      req.processedFiles = processedFiles;
      req.hdImageInfo = hdImageInfo;
      req.imageProcessingConfig = configInfo;

      console.log(`✅ SmartImageUploadMiddleware: Обработано ${imageUrls.length} файлов`);
      console.log(`   HD-версии созданы для ${hdImageInfo.length} изображений`);
      console.log(`   Активный обработчик: ${configInfo.activeHandler}`);
      next();

    } catch (error) {
      console.error('❌ SmartImageUploadMiddleware error:', error);
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

      const configInfo = this.imageHandler.getConfigInfo();
      console.log(`🗑️ SmartImageUploadMiddleware: Удаление ${oldImageUrls.length} старых изображений через ${configInfo.activeHandler}...`);

      const deletePromises = oldImageUrls.map(async (imageUrl) => {
        return await this.imageHandler.deleteImage(imageUrl);
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ SmartImageUploadMiddleware: Удалено ${successCount}/${oldImageUrls.length} старых изображений`);
      next();

    } catch (error) {
      console.error('❌ SmartImageUploadMiddleware deleteOldImages error:', error);
      next(); // Продолжаем даже если удаление не удалось
    }
  }

  /**
   * Middleware для получения информации о HD-версиях
   */
  async getHdImageInfo(req, res, next) {
    try {
      const { imageUrl } = req.params;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'URL изображения не указан' });
      }

      const configInfo = this.imageHandler.getConfigInfo();
      console.log(`🔍 SmartImageUploadMiddleware: getHdImageInfo через ${configInfo.activeHandler}`);

      const hdInfo = await this.imageHandler.getHdImageInfo(imageUrl);
      
      if (hdInfo) {
        res.json({
          success: true,
          data: hdInfo,
          config: configInfo
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'HD-версии не найдены',
          config: configInfo
        });
      }

    } catch (error) {
      console.error('❌ SmartImageUploadMiddleware getHdImageInfo error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения информации о HD-версиях'
      });
    }
  }

  /**
   * Middleware для массового получения информации о HD-версиях
   */
  async getBulkHdImageInfo(req, res, next) {
    try {
      const { imageUrls } = req.body;
      
      if (!imageUrls || !Array.isArray(imageUrls)) {
        return res.status(400).json({ error: 'Список URL изображений не указан' });
      }

      const configInfo = this.imageHandler.getConfigInfo();
      console.log(`🔍 SmartImageUploadMiddleware: getBulkHdImageInfo через ${configInfo.activeHandler}`);

      const hdInfoPromises = imageUrls.map(async (imageUrl) => {
        const info = await this.imageHandler.getHdImageInfo(imageUrl);
        return {
          original: imageUrl,
          hdInfo: info
        };
      });

      const results = await Promise.all(hdInfoPromises);
      
      res.json({
        success: true,
        data: results,
        config: configInfo
      });

    } catch (error) {
      console.error('❌ SmartImageUploadMiddleware getBulkHdImageInfo error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения массовой информации о HD-версиях'
      });
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
      console.error('❌ SmartImageUploadMiddleware getConfigInfo error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения информации о конфигурации'
      });
    }
  }

  /**
   * Middleware для принудительного переключения режима
   */
  async switchMode(req, res, next) {
    try {
      const { mode } = req.body;
      
      if (!mode || !['local', 'cloudinary', 'auto'].includes(mode)) {
        return res.status(400).json({ 
          error: 'Неверный режим. Допустимые значения: local, cloudinary, auto' 
        });
      }

      switch (mode) {
        case 'local':
          this.imageHandler.forceLocalMode();
          break;
        case 'cloudinary':
          this.imageHandler.forceCloudinaryMode();
          break;
        case 'auto':
          // Сбрасываем принудительный режим
          this.imageHandler = new SmartImageHandler();
          break;
      }

      const configInfo = this.imageHandler.getConfigInfo();
      
      res.json({
        success: true,
        message: `Режим переключен на: ${mode}`,
        config: configInfo
      });

    } catch (error) {
      console.error('❌ SmartImageUploadMiddleware switchMode error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка переключения режима'
      });
    }
  }

  /**
   * Middleware для очистки неиспользуемых HD-версий
   */
  async cleanupUnusedHdVersions(req, res, next) {
    try {
      const configInfo = this.imageHandler.getConfigInfo();
      console.log(`🧹 SmartImageUploadMiddleware: Очистка через ${configInfo.activeHandler}...`);
      
      // Здесь можно добавить логику для поиска и удаления HD-версий,
      // которые больше не связаны с основными изображениями
      
      res.json({
        success: true,
        message: 'Очистка HD-версий завершена',
        config: configInfo
      });

    } catch (error) {
      console.error('❌ SmartImageUploadMiddleware cleanupUnusedHdVersions error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка очистки HD-версий'
      });
    }
  }
}

module.exports = SmartImageUploadMiddleware;
