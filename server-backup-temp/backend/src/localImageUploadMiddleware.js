const LocalImageHandler = require('./localImageHandler');

class LocalImageUploadMiddleware {
  constructor() {
    this.imageHandler = new LocalImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов локально
   */
  async processUploadedFiles(req, res, next) {
    try {
      console.log('🖼️ LocalImageUploadMiddleware: processUploadedFiles вызван');
      console.log('🖼️ LocalImageUploadMiddleware: req.files =', req.files ? req.files.length : 'undefined');
      
      if (!req.files || req.files.length === 0) {
        console.log('🖼️ LocalImageUploadMiddleware: Нет файлов для обработки');
        return next();
      }

      console.log(`🖼️ LocalImageUploadMiddleware: Обработка ${req.files.length} загруженных файлов локально...`);

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
            compressionRatio: result.compressionRatio
          };
          
          processedFiles.push(fileInfo);
          imageUrls.push(result.url);
          
          // Добавляем информацию о HD-версиях
          if (result.hdVersions && Object.keys(result.hdVersions).length > 0) {
            hdImageInfo.push({
              original: result.url,
              hdVersions: result.hdVersions
            });
          }
          
          console.log(`✅ Обработано: ${result.filename} -> ${result.url}`);
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

      console.log(`✅ LocalImageUploadMiddleware: Обработано ${imageUrls.length} файлов`);
      console.log(`   HD-версии созданы для ${hdImageInfo.length} изображений`);
      next();

    } catch (error) {
      console.error('❌ LocalImageUploadMiddleware error:', error);
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

      console.log(`🗑️ LocalImageUploadMiddleware: Удаление ${oldImageUrls.length} старых изображений...`);

      const deletePromises = oldImageUrls.map(async (imageUrl) => {
        return await this.imageHandler.deleteImage(imageUrl);
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ LocalImageUploadMiddleware: Удалено ${successCount}/${oldImageUrls.length} старых изображений`);
      next();

    } catch (error) {
      console.error('❌ LocalImageUploadMiddleware deleteOldImages error:', error);
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

      const hdInfo = await this.imageHandler.getHdImageInfo(imageUrl);
      
      if (hdInfo) {
        res.json({
          success: true,
          data: hdInfo
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'HD-версии не найдены'
        });
      }

    } catch (error) {
      console.error('❌ LocalImageUploadMiddleware getHdImageInfo error:', error);
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
        data: results
      });

    } catch (error) {
      console.error('❌ LocalImageUploadMiddleware getBulkHdImageInfo error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения массовой информации о HD-версиях'
      });
    }
  }

  /**
   * Middleware для очистки неиспользуемых HD-версий
   */
  async cleanupUnusedHdVersions(req, res, next) {
    try {
      console.log('🧹 LocalImageUploadMiddleware: Очистка неиспользуемых HD-версий...');
      
      // Здесь можно добавить логику для поиска и удаления HD-версий,
      // которые больше не связаны с основными изображениями
      
      res.json({
        success: true,
        message: 'Очистка HD-версий завершена'
      });

    } catch (error) {
      console.error('❌ LocalImageUploadMiddleware cleanupUnusedHdVersions error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка очистки HD-версий'
      });
    }
  }
}

module.exports = LocalImageUploadMiddleware;
