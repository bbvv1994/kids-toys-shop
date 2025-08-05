const CloudinaryImageHandler = require('./cloudinaryImageHandler');

class CloudinaryUploadMiddleware {
  constructor() {
    this.imageHandler = new CloudinaryImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов с Cloudinary
   */
  async processUploadedFiles(req, res, next) {
    try {
      console.log('🖼️ CloudinaryUploadMiddleware: processUploadedFiles вызван');
      console.log('🖼️ CloudinaryUploadMiddleware: req.files =', req.files ? req.files.length : 'undefined');
      console.log('🖼️ CloudinaryUploadMiddleware: NODE_ENV =', process.env.NODE_ENV);
      
      if (!req.files || req.files.length === 0) {
        console.log('🖼️ CloudinaryUploadMiddleware: Нет файлов для обработки');
        return next();
      }

      console.log(`🖼️ CloudinaryUploadMiddleware: Processing ${req.files.length} uploaded files with Cloudinary...`);

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
            publicId: result.publicId
          };
          
          processedFiles.push(fileInfo);
          imageUrls.push(result.url); // Используем URL из Cloudinary
          
          console.log(`✅ Processed: ${result.filename} -> ${result.url}`);
        } else {
          console.error(`❌ Failed to process: ${result.originalName} - ${result.error}`);
        }
      });

      // Добавляем обработанные данные в request
      req.imageUrls = imageUrls;
      req.processedFiles = processedFiles;

      console.log(`✅ CloudinaryUploadMiddleware: Обработано ${imageUrls.length} файлов`);
      next();

    } catch (error) {
      console.error('❌ CloudinaryUploadMiddleware error:', error);
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

      console.log(`🗑️ CloudinaryUploadMiddleware: Deleting ${oldImageUrls.length} old images...`);

      const deletePromises = oldImageUrls.map(async (imageUrl) => {
        // Извлекаем publicId из URL Cloudinary
        const publicId = this.extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          return await this.imageHandler.deleteImage(publicId);
        }
        return { success: false, error: 'Invalid URL' };
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ CloudinaryUploadMiddleware: Deleted ${successCount}/${oldImageUrls.length} old images`);
      next();

    } catch (error) {
      console.error('❌ CloudinaryUploadMiddleware deleteOldImages error:', error);
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
}

module.exports = CloudinaryUploadMiddleware; 