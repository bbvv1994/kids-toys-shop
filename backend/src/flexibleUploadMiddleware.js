const FlexibleImageHandler = require('./flexibleImageHandler');

class FlexibleUploadMiddleware {
  constructor() {
    this.imageHandler = new FlexibleImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов
   */
  async processUploadedFiles(req, res, next) {
    try {
      console.log('🖼️ FlexibleUploadMiddleware: processUploadedFiles вызван');
      console.log('🖼️ FlexibleUploadMiddleware: req.files =', req.files ? req.files.length : 'undefined');
      console.log('🖼️ FlexibleUploadMiddleware: Storage mode =', this.imageHandler.storageMode);
      
      if (!req.files || req.files.length === 0) {
        console.log('🖼️ FlexibleUploadMiddleware: Нет файлов для обработки');
        return next();
      }

      console.log(`🖼️ FlexibleUploadMiddleware: Processing ${req.files.length} uploaded files...`);

      // Проверяем размеры файлов
      const sizeErrors = this.imageHandler.checkFileSizes(req.files);
      if (sizeErrors.length > 0) {
        return res.status(400).json({ 
          error: 'File size validation failed', 
          details: sizeErrors 
        });
      }

      // Обрабатываем изображения
      const results = await this.imageHandler.processMultipleImages(req.files);

      // Подготавливаем данные для сохранения в базу
      const imageUrls = [];
      const processedFiles = [];

      results.forEach(result => {
        if (result.success) {
          const fileInfo = {
            filename: result.filename,
            originalName: result.originalName || 'unknown',
            size: result.processedSize,
            mimetype: result.mimetype,
            url: result.url,
            storageMode: this.imageHandler.storageMode
          };
          
          // Добавляем publicId для Cloudinary
          if (result.publicId) {
            fileInfo.publicId = result.publicId;
          }
          
          processedFiles.push(fileInfo);
          imageUrls.push(result.url);
          
          console.log(`✅ Processed: ${result.filename} -> ${result.url} (${this.imageHandler.storageMode})`);
        } else {
          console.error(`❌ Failed to process: ${result.originalName} - ${result.error}`);
        }
      });

      // Добавляем обработанные данные в request
      req.imageUrls = imageUrls;
      req.processedFiles = processedFiles;

      console.log(`✅ FlexibleUploadMiddleware: Обработано ${imageUrls.length} файлов в режиме ${this.imageHandler.storageMode}`);
      next();

    } catch (error) {
      console.error('❌ FlexibleUploadMiddleware error:', error);
      res.status(500).json({ 
        error: 'Image processing failed', 
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

      console.log(`🗑️ FlexibleUploadMiddleware: Deleting ${oldImageUrls.length} old images...`);

      const deletePromises = oldImageUrls.map(async (imageUrl) => {
        if (this.imageHandler.storageMode === 'cloudinary') {
          // Извлекаем publicId из URL Cloudinary
          const publicId = this.extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            return await this.imageHandler.deleteImage(publicId);
          }
        } else {
          // Извлекаем имя файла из локального URL
          const filename = this.extractFilenameFromUrl(imageUrl);
          if (filename) {
            return await this.imageHandler.deleteImage(filename);
          }
        }
        return { success: false, error: 'Invalid URL' };
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ FlexibleUploadMiddleware: Deleted ${successCount}/${oldImageUrls.length} old images`);
      next();

    } catch (error) {
      console.error('❌ FlexibleUploadMiddleware deleteOldImages error:', error);
      next(); // Продолжаем даже если удаление не удалось
    }
  }

  /**
   * Извлекает publicId из URL Cloudinary
   */
  extractPublicIdFromUrl(url) {
    try {
      if (!url || !url.includes('cloudinary.com')) {
        return null;
      }
      
      // Пример URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/kids-toys-shop/1234567890-abc123.webp
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
        // Пропускаем версию и берем путь к файлу
        return urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting publicId from URL:', error);
      return null;
    }
  }

  /**
   * Извлекает имя файла из локального URL
   */
  extractFilenameFromUrl(url) {
    try {
      if (!url || !url.startsWith('/uploads/')) {
        return null;
      }
      
      // Пример URL: /uploads/1234567890-abc123.webp
      return url.split('/').pop();
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return null;
    }
  }
}

module.exports = FlexibleUploadMiddleware; 