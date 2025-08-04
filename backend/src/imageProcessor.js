const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ImageProcessor {
  constructor() {
    this.maxFileSize = 30 * 1024; // 30KB в байтах
    this.minFileSize = 15 * 1024; // 15KB в байтах
    this.qualityRange = { min: 60, max: 90 };
    this.maxWidth = 800;
    this.maxHeight = 800;
  }

  /**
   * Обрабатывает изображение: конвертирует в WebP и сжимает до нужного размера
   * @param {string} inputPath - путь к исходному файлу
   * @param {string} outputPath - путь для сохранения обработанного файла
   * @returns {Promise<Object>} - информация о результатах обработки
   */
  async processImage(inputPath, outputPath) {
    try {
      console.log(`Обработка изображения: ${inputPath}`);
      
      // Читаем исходное изображение
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      console.log(`Исходные размеры: ${metadata.width}x${metadata.height}, формат: ${metadata.format}`);
      
      // Определяем новые размеры с сохранением пропорций
      const { width, height } = this.calculateDimensions(metadata.width, metadata.height);
      
      // Начинаем с высокого качества и постепенно снижаем
      let quality = this.qualityRange.max;
      let processedBuffer;
      let fileSize;
      
      do {
        processedBuffer = await image
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ 
            quality: quality,
            effort: 6, // максимальное качество сжатия
            nearLossless: false
          })
          .toBuffer();
        
        fileSize = processedBuffer.length;
        console.log(`Качество: ${quality}%, размер: ${(fileSize / 1024).toFixed(1)}KB`);
        
        // Если файл слишком большой, уменьшаем качество
        if (fileSize > this.maxFileSize && quality > this.qualityRange.min) {
          quality -= 5;
        }
        
      } while (fileSize > this.maxFileSize && quality > this.qualityRange.min);
      
      // Если файл все еще слишком большой, уменьшаем размеры
      if (fileSize > this.maxFileSize) {
        console.log('Файл все еще слишком большой, уменьшаем размеры...');
        const scaleFactor = Math.sqrt(this.maxFileSize / fileSize);
        const newWidth = Math.round(width * scaleFactor);
        const newHeight = Math.round(height * scaleFactor);
        
        processedBuffer = await image
          .resize(newWidth, newHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ 
            quality: this.qualityRange.min,
            effort: 6
          })
          .toBuffer();
        
        fileSize = processedBuffer.length;
        console.log(`Новые размеры: ${newWidth}x${newHeight}, размер: ${(fileSize / 1024).toFixed(1)}KB`);
      }
      
      // Сохраняем обработанное изображение
      await fs.promises.writeFile(outputPath, processedBuffer);
      
      const result = {
        success: true,
        originalSize: metadata.size || 0,
        processedSize: fileSize,
        compressionRatio: metadata.size ? ((metadata.size - fileSize) / metadata.size * 100).toFixed(1) : 0,
        dimensions: {
          original: { width: metadata.width, height: metadata.height },
          processed: { width, height }
        },
        format: 'webp',
        quality: quality
      };
      
      console.log(`✅ Обработка завершена: ${(fileSize / 1024).toFixed(1)}KB (сжатие: ${result.compressionRatio}%)`);
      console.log(`📁 Файл сохранен как: ${path.basename(outputPath)}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Ошибка обработки изображения ${inputPath}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Вычисляет новые размеры изображения с сохранением пропорций
   */
  calculateDimensions(originalWidth, originalHeight) {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Если изображение больше максимальных размеров, уменьшаем его
    if (width > this.maxWidth || height > this.maxHeight) {
      if (width > height) {
        width = this.maxWidth;
        height = Math.round(width / aspectRatio);
      } else {
        height = this.maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }
    
    return { width, height };
  }

  /**
   * Обрабатывает массив файлов
   */
  async processMultipleImages(files) {
    const results = [];
    
    for (const file of files) {
      const inputPath = file.path;
      const outputPath = inputPath.replace(/\.[^.]+$/, '.webp');
      
      const result = await this.processImage(inputPath, outputPath);
      
      if (result.success) {
        // Удаляем исходный файл
        await fs.promises.unlink(inputPath);
        
        // Переименовываем обработанный файл с правильным расширением
        const newFilename = path.basename(inputPath).replace(/\.[^.]+$/, '.webp');
        const newPath = path.join(path.dirname(inputPath), newFilename);
        await fs.promises.rename(outputPath, newPath);
        
        // Обновляем информацию о файле
        file.filename = newFilename;
        file.path = newPath;
        file.mimetype = 'image/webp';
        
        console.log(`🔄 Файл переименован: ${path.basename(inputPath)} -> ${newFilename}`);
      }
      
      results.push({
        originalName: file.originalname,
        processedName: file.filename,
        ...result
      });
    }
    
    return results;
  }

  /**
   * Проверяет, является ли файл изображением
   */
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }
}

module.exports = ImageProcessor; 