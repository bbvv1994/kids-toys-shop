const sharp = require('sharp');
const path = require('path');

class ProductionImageHandler {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  }

  /**
   * Проверяет, является ли файл изображением
   */
  isImageFile(filename) {
    if (!filename) return false;
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Обрабатывает изображение из буфера памяти
   */
  async processImageFromBuffer(buffer, originalName) {
    try {
      console.log(`🖼️ ProductionImageHandler: Processing image: ${originalName}`);
      console.log(`🖼️ ProductionImageHandler: Buffer size: ${buffer.length} bytes`);
      
      // Определяем формат выходного файла
      const outputFormat = 'webp';
      const outputFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${outputFormat}`;
      
      // Обрабатываем изображение с оптимизированными настройками для скорости
      const processedBuffer = await sharp(buffer)
        .resize(600, 600, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 70,
          effort: 3 
        })
        .toBuffer();

      const originalSize = buffer.length;
      const processedSize = processedBuffer.length;
      const compressionRatio = ((originalSize - processedSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${originalName} -> ${outputFilename}`);
      console.log(`   Size: ${(originalSize / 1024).toFixed(1)}KB -> ${(processedSize / 1024).toFixed(1)}KB`);
      console.log(`   Compression: ${compressionRatio}%`);

      return {
        success: true,
        filename: outputFilename,
        buffer: processedBuffer,
        originalSize,
        processedSize,
        compressionRatio: parseFloat(compressionRatio),
        mimetype: 'image/webp'
      };

    } catch (error) {
      console.error(`❌ Error processing ${originalName}:`, error.message);
      return {
        success: false,
        error: error.message,
        originalName
      };
    }
  }

  /**
   * Обрабатывает массив изображений
   */
  async processMultipleImages(files) {
    const results = [];
    
    for (const file of files) {
      if (this.isImageFile(file.originalname)) {
        const result = await this.processImageFromBuffer(file.buffer, file.originalname);
        results.push(result);
      } else {
        // Для не-изображений просто сохраняем как есть
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`;
        results.push({
          success: true,
          filename,
          buffer: file.buffer,
          originalSize: file.buffer.length,
          processedSize: file.buffer.length,
          compressionRatio: 0,
          mimetype: file.mimetype
        });
      }
    }

    return results;
  }

  /**
   * Проверяет размеры файлов
   */
  checkFileSizes(files) {
    const errors = [];
    
    for (const file of files) {
      if (file.size > this.maxFileSize) {
        errors.push(`File ${file.originalname} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
      }
    }

    return errors;
  }
}

module.exports = ProductionImageHandler; 