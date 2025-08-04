const ProductionImageHandler = require('./productionImageHandler');

class ProductionUploadMiddleware {
  constructor() {
    this.imageHandler = new ProductionImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов в production
   */
  async processUploadedFiles(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      console.log(`Processing ${req.files.length} uploaded files in production...`);

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
          // В production мы не сохраняем файлы на диск
          // Вместо этого сохраняем информацию о файле
          const fileInfo = {
            filename: result.filename,
            originalName: result.originalName || 'unknown',
            size: result.processedSize,
            mimetype: result.mimetype,
            buffer: result.buffer // Временное хранение в памяти
          };
          
          processedFiles.push(fileInfo);
          imageUrls.push(`/uploads/${result.filename}`);
        }
      });

      // Добавляем обработанные файлы в req для дальнейшего использования
      req.processedFiles = processedFiles;
      req.imageUrls = imageUrls;
      req.imageProcessingResults = results;

      console.log(`✅ Successfully processed ${processedFiles.length} files`);
      console.log(`📁 Image URLs:`, imageUrls);

    } catch (error) {
      console.error('Error in production upload middleware:', error);
      return res.status(500).json({ 
        error: 'File processing failed', 
        details: error.message 
      });
    }

    next();
  }

  /**
   * Middleware для обработки одного файла
   */
  async processSingleFile(req, res, next) {
    try {
      if (!req.file) {
        return next();
      }

      console.log(`Processing single file: ${req.file.originalname}`);

      // Проверяем размер файла
      const sizeErrors = this.imageHandler.checkFileSizes([req.file]);
      if (sizeErrors.length > 0) {
        return res.status(400).json({ 
          error: 'File size validation failed', 
          details: sizeErrors 
        });
      }

      // Обрабатываем файл
      const results = await this.imageHandler.processMultipleImages([req.file]);
      const result = results[0];

      if (result.success) {
        req.processedFile = {
          filename: result.filename,
          originalName: req.file.originalname,
          size: result.processedSize,
          mimetype: result.mimetype,
          buffer: result.buffer
        };
        req.imageUrl = `/uploads/${result.filename}`;
        req.imageProcessingResult = result;
        
        console.log(`✅ Successfully processed single file: ${result.filename}`);
      } else {
        console.error(`❌ Failed to process file: ${result.error}`);
        return res.status(400).json({ 
          error: 'File processing failed', 
          details: result.error 
        });
      }

    } catch (error) {
      console.error('Error in production single file middleware:', error);
      return res.status(500).json({ 
        error: 'File processing failed', 
        details: error.message 
      });
    }

    next();
  }
}

module.exports = ProductionUploadMiddleware; 