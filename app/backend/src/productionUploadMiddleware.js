const ProductionImageHandler = require('./productionImageHandler');
const path = require('path');
const fs = require('fs');

class ProductionUploadMiddleware {
  constructor() {
    this.imageHandler = new ProductionImageHandler();
  }

  /**
   * Middleware для обработки загруженных файлов в production
   */
  async processUploadedFiles(req, res, next) {
    try {
      console.log('🖼️ ProductionUploadMiddleware: processUploadedFiles вызван');
      console.log('🖼️ ProductionUploadMiddleware: req.files =', req.files ? req.files.length : 'undefined');
      console.log('🖼️ ProductionUploadMiddleware: NODE_ENV =', process.env.NODE_ENV);
      
      if (!req.files || req.files.length === 0) {
        console.log('🖼️ ProductionUploadMiddleware: Нет файлов для обработки');
        return next();
      }

      console.log(`🖼️ ProductionUploadMiddleware: Processing ${req.files.length} uploaded files in production...`);

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

      // Создаем папку uploads если её нет
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      results.forEach(result => {
        if (result.success) {
          // Сохраняем файл на диск
          const filePath = path.join(uploadsDir, result.filename);
          fs.writeFileSync(filePath, result.buffer);
          
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
    return this.processSingleImage(req, res, next);
  }

  /**
   * Middleware для обработки одного изображения (алиас для processSingleFile)
   */
  async processSingleImage(req, res, next) {
    try {
      if (!req.file) {
        return next();
      }

      console.log(`Processing single file: ${req.file.originalname}`);

      // Проверяем, есть ли buffer (production) или нужно читать с диска (development)
      let fileBuffer = req.file.buffer;
      if (!fileBuffer && req.file.path) {
        // В development режиме читаем файл с диска
        console.log(`Reading file from disk: ${req.file.path}`);
        fileBuffer = fs.readFileSync(req.file.path);
      }

      if (!fileBuffer) {
        console.error('No file buffer or path available');
        return res.status(400).json({ 
          error: 'File processing failed', 
          details: 'No file data available' 
        });
      }

      // Создаем временный объект файла для проверки размера
      const tempFile = {
        ...req.file,
        buffer: fileBuffer
      };

      // Проверяем размер файла
      const sizeErrors = this.imageHandler.checkFileSizes([tempFile]);
      if (sizeErrors.length > 0) {
        return res.status(400).json({ 
          error: 'File size validation failed', 
          details: sizeErrors 
        });
      }

      // Обрабатываем файл
      const results = await this.imageHandler.processMultipleImages([tempFile]);
      const result = results[0];

      if (result.success) {
        // Сохраняем файл на диск
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filePath = path.join(uploadsDir, result.filename);
        fs.writeFileSync(filePath, result.buffer);
        
        // Обновляем информацию о файле
        req.file.filename = result.filename;
        req.file.mimetype = result.mimetype;
        
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