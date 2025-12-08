const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class LocalImageHandler {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    
    // Папки для хранения изображений
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.hdDir = path.join(__dirname, '..', 'uploads', 'hd');
    
    this.ensureDirectories();
  }

  /**
   * Создает необходимые папки
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.hdDir, { recursive: true });
    } catch (error) {
      console.error('❌ LocalImageHandler: Ошибка создания папок:', error.message);
    }
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
   * Обрабатывает изображение и создает HD-версии
   */
  async processImageFromBuffer(buffer, originalName) {
    try {
      console.log(`🖼️ LocalImageHandler: Обработка изображения: ${originalName}`);
      console.log(`🖼️ LocalImageHandler: Размер буфера: ${buffer.length} bytes`);
      
      // Создаем имя файла
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const baseFilename = `${timestamp}-${randomString}`;
      
      // Обрабатываем изображение с оптимизацией для веб
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

      // Создаем HD-версии
      const hdVersions = await this.createHdVersions(buffer, baseFilename);
      
      // Сохраняем обычную версию
      const normalFilename = `${baseFilename}.webp`;
      const normalPath = path.join(this.uploadsDir, normalFilename);
      await fs.writeFile(normalPath, processedBuffer);

      const originalSize = buffer.length;
      const processedSize = processedBuffer.length;
      const compressionRatio = ((originalSize - processedSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${originalName} обработано`);
      console.log(`   Размер: ${(originalSize / 1024).toFixed(1)}KB -> ${(processedSize / 1024).toFixed(1)}KB`);
      console.log(`   Сжатие: ${compressionRatio}%`);
      console.log(`   HD-версии: ${Object.keys(hdVersions).length} создано`);

      return {
        success: true,
        filename: normalFilename,
        url: `/uploads/${normalFilename}`,
        originalSize,
        processedSize,
        compressionRatio: parseFloat(compressionRatio),
        mimetype: 'image/webp',
        hdVersions
      };

    } catch (error) {
      console.error(`❌ Ошибка обработки ${originalName}:`, error.message);
      return {
        success: false,
        error: error.message,
        originalName
      };
    }
  }

  /**
   * Создает HD-версии изображения
   */
  async createHdVersions(buffer, baseFilename) {
    try {
      console.log(`🖼️ Создание HD-версий для: ${baseFilename}`);
      
      const hdVersions = {};
      
      // HD @2x версия (1200x1200)
      try {
        const hd2xBuffer = await sharp(buffer)
          .resize(1200, 1200, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .webp({ 
            quality: 85,
            effort: 4 
          })
          .toBuffer();

        const hd2xFilename = `${baseFilename}@2x.webp`;
        const hd2xPath = path.join(this.hdDir, hd2xFilename);
        await fs.writeFile(hd2xPath, hd2xBuffer);
        
        hdVersions.hd2x = {
          filename: hd2xFilename,
          url: `/uploads/hd/${hd2xFilename}`,
          size: '1200x1200'
        };
        
        console.log(`✅ HD @2x создано: ${hd2xFilename}`);
      } catch (error) {
        console.warn(`⚠️ Ошибка создания HD @2x:`, error.message);
      }

      // HD @4x версия (2400x2400)
      try {
        const hd4xBuffer = await sharp(buffer)
          .resize(2400, 2400, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .webp({ 
            quality: 90,
            effort: 5 
          })
          .toBuffer();

        const hd4xFilename = `${baseFilename}@4x.webp`;
        const hd4xPath = path.join(this.hdDir, hd4xFilename);
        await fs.writeFile(hd4xPath, hd4xBuffer);
        
        hdVersions.hd4x = {
          filename: hd4xFilename,
          url: `/uploads/hd/${hd4xFilename}`,
          size: '2400x2400'
        };
        
        console.log(`✅ HD @4x создано: ${hd4xFilename}`);
      } catch (error) {
        console.warn(`⚠️ Ошибка создания HD @4x:`, error.message);
      }

      return hdVersions;

    } catch (error) {
      console.error(`❌ Ошибка создания HD-версий для ${baseFilename}:`, error.message);
      return {};
    }
  }

  /**
   * Получает HD-версию изображения по URL
   */
  getHdImageUrl(originalUrl, quality = '2x') {
    try {
      if (!originalUrl) return '';
      
      // Если это локальное изображение, создаем HD-URL
      if (originalUrl.startsWith('/uploads/') && !originalUrl.includes('@')) {
        const filename = path.basename(originalUrl, path.extname(originalUrl));
        const hdFilename = quality === '4x' ? `${filename}@4x.webp` : `${filename}@2x.webp`;
        const hdUrl = `/uploads/hd/${hdFilename}`;
        
        console.log(`🔧 Локальная HD ${quality} версия:`, hdUrl);
        return hdUrl;
      }
      
      // Если это Cloudinary URL, используем оригинальную логику
      if (originalUrl.includes('cloudinary.com')) {
        // Здесь можно добавить логику для Cloudinary, если нужно
        console.log('🔧 Cloudinary URL, возвращаем оригинал');
        return originalUrl;
      }
      
      // Возвращаем оригинал для других случаев
      console.log('✅ Используем оригинальное изображение');
      return originalUrl;

    } catch (error) {
      console.error('❌ Ошибка получения HD URL:', error.message);
      return originalUrl;
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
        // Для не-изображений создаем запись без обработки
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`;
        const filePath = path.join(this.uploadsDir, filename);
        
        try {
          await fs.writeFile(filePath, file.buffer);
          results.push({
            success: true,
            filename,
            url: `/uploads/${filename}`,
            originalSize: file.buffer.length,
            processedSize: file.buffer.length,
            compressionRatio: 0,
            mimetype: file.mimetype,
            hdVersions: {}
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
            originalName: file.originalname
          });
        }
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
        errors.push(`Файл ${file.originalname} слишком большой (${(file.size / 1024 / 1024).toFixed(1)}MB). Максимальный размер: ${this.maxFileSize / 1024 / 1024}MB`);
      }
    }

    return errors;
  }

  /**
   * Удаляет изображение и его HD-версии
   */
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
        return { success: false, error: 'Неверный URL изображения' };
      }

      const filename = path.basename(imageUrl);
      const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Убираем расширение
      
      // Удаляем обычную версию
      const normalPath = path.join(this.uploadsDir, filename);
      try {
        await fs.unlink(normalPath);
        console.log(`✅ Удалено: ${filename}`);
      } catch (error) {
        console.warn(`⚠️ Файл не найден: ${filename}`);
      }

      // Удаляем HD-версии
      const hd2xPath = path.join(this.hdDir, `${baseFilename}@2x.webp`);
      const hd4xPath = path.join(this.hdDir, `${baseFilename}@4x.webp`);

      try {
        await fs.unlink(hd2xPath);
        console.log(`✅ Удалено HD @2x: ${baseFilename}@2x.webp`);
      } catch (error) {
        // HD-версия может не существовать
      }

      try {
        await fs.unlink(hd4xPath);
        console.log(`✅ Удалено HD @4x: ${baseFilename}@4x.webp`);
      } catch (error) {
        // HD-версия может не существовать
      }

      return { success: true };

    } catch (error) {
      console.error(`❌ Ошибка удаления изображения:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получает информацию о HD-версиях изображения
   */
  async getHdImageInfo(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
        return null;
      }

      const filename = path.basename(imageUrl);
      const baseFilename = filename.replace(/\.[^/.]+$/, '');
      
      const hd2xPath = path.join(this.hdDir, `${baseFilename}@2x.webp`);
      const hd4xPath = path.join(this.hdDir, `${baseFilename}@4x.webp`);

      const hd2xExists = await fs.access(hd2xPath).then(() => true).catch(() => false);
      const hd4xExists = await fs.access(hd4xPath).then(() => true).catch(() => false);

      return {
        original: imageUrl,
        hd2x: hd2xExists ? `/uploads/hd/${baseFilename}@2x.webp` : null,
        hd4x: hd4xExists ? `/uploads/hd/${baseFilename}@4x.webp` : null,
        hasHdVersions: hd2xExists || hd4xExists
      };

    } catch (error) {
      console.error('❌ Ошибка получения информации о HD-версиях:', error.message);
      return null;
    }
  }
}

module.exports = LocalImageHandler;
