const ImageProcessor = require('./imageProcessor');

class ImageMiddleware {
  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  /**
   * Middleware для обработки изображений после загрузки
   */
  async processUploadedImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      console.log(`Обработка ${req.files.length} загруженных файлов...`);

      // Фильтруем только изображения
      const imageFiles = req.files.filter(file => 
        this.imageProcessor.isImageFile(file.originalname)
      );

      if (imageFiles.length === 0) {
        console.log('Нет изображений для обработки');
        return next();
      }

      console.log(`Найдено ${imageFiles.length} изображений для обработки`);

      // Обрабатываем изображения
      const results = await this.imageProcessor.processMultipleImages(imageFiles);

      // Логируем результаты
      let totalOriginalSize = 0;
      let totalProcessedSize = 0;
      let successCount = 0;

      results.forEach(result => {
        if (result.success) {
          totalOriginalSize += result.originalSize;
          totalProcessedSize += result.processedSize;
          successCount++;
          
          console.log(`✅ ${result.originalName} -> ${result.processedName}`);
          console.log(`   Размер: ${(result.originalSize / 1024).toFixed(1)}KB -> ${(result.processedSize / 1024).toFixed(1)}KB`);
          console.log(`   Сжатие: ${result.compressionRatio}%`);
        } else {
          console.log(`❌ Ошибка обработки ${result.originalName}: ${result.error}`);
        }
      });

      if (successCount > 0) {
        const totalCompression = ((totalOriginalSize - totalProcessedSize) / totalOriginalSize * 100).toFixed(1);
        console.log(`\n📊 Итоги обработки:`);
        console.log(`   Обработано: ${successCount}/${imageFiles.length} файлов`);
        console.log(`   Общий размер: ${(totalOriginalSize / 1024).toFixed(1)}KB -> ${(totalProcessedSize / 1024).toFixed(1)}KB`);
        console.log(`   Общее сжатие: ${totalCompression}%`);
      }

      // Добавляем информацию о результатах в req для возможного использования
      req.imageProcessingResults = results;

    } catch (error) {
      console.error('Ошибка в middleware обработки изображений:', error);
      // Не прерываем выполнение запроса, даже если обработка изображений не удалась
    }

    next();
  }

  /**
   * Middleware для обработки одного изображения
   */
  async processSingleImage(req, res, next) {
    try {
      if (!req.file) {
        return next();
      }

      if (!this.imageProcessor.isImageFile(req.file.originalname)) {
        return next();
      }

      console.log(`Обработка изображения: ${req.file.originalname}`);

      const result = await this.imageProcessor.processImage(req.file.path, req.file.path.replace(/\.[^.]+$/, '.webp'));

      if (result.success) {
        // Обновляем информацию о файле
        req.file.filename = req.file.filename.replace(/\.[^.]+$/, '.webp');
        req.file.mimetype = 'image/webp';
        
        console.log(`✅ Обработка завершена: ${(result.processedSize / 1024).toFixed(1)}KB (сжатие: ${result.compressionRatio}%)`);
      } else {
        console.log(`❌ Ошибка обработки: ${result.error}`);
      }

      req.imageProcessingResult = result;

    } catch (error) {
      console.error('Ошибка в middleware обработки одного изображения:', error);
    }

    next();
  }

  /**
   * Middleware для проверки размера файлов перед обработкой
   */
  checkFileSizes(req, res, next) {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = req.files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.originalname).join(', ');
      return res.status(400).json({ 
        error: `Следующие файлы слишком большие (максимум 10MB): ${fileNames}` 
      });
    }

    next();
  }
}

module.exports = ImageMiddleware; 