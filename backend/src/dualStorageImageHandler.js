const LocalImageHandler = require('./localImageHandler');
const CloudinaryImageHandler = require('./cloudinaryImageHandler');

class DualStorageImageHandler {
  constructor() {
    // Инициализируем оба обработчика
    this.localHandler = new LocalImageHandler();
    this.cloudinaryHandler = null;
    
    // Создаем Cloudinary handler только если есть настройки
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        this.cloudinaryHandler = new CloudinaryImageHandler();
        console.log('✅ DualStorage: Cloudinary handler инициализирован');
      } catch (error) {
        console.warn('⚠️ DualStorage: Cloudinary handler не удалось инициализировать:', error.message);
      }
    } else {
      console.log('⚠️ DualStorage: CLOUDINARY_CLOUD_NAME не найден, Cloudinary отключен');
    }
    
    console.log('🔧 DualStorageImageHandler: Режим тройного сохранения');
    console.log(`   Локальный обработчик: ${this.localHandler ? '✅' : '❌'}`);
    console.log(`   Cloudinary обработчик: ${this.cloudinaryHandler ? '✅' : '❌'}`);
    console.log('📦 Версии: Cloudinary (CDN) + HD локально + сжатое локально');
  }

  /**
   * Обрабатывает изображение с тройным сохранением (Cloudinary + HD локально + сжатое локально)
   * Всегда создает 2 локальные копии: HD для галереи и сжатую для превью
   */
  async processImageFromBuffer(buffer, originalName) {
    console.log(`🖼️ DualStorage: Обработка ${originalName} с тройным сохранением...`);
    
    const results = {
      cloudinary: null,
      localHD: null,
      localCompressed: null
    };

    // 1. Сохраняем HD версию локально (для галереи с зумом)
    try {
      console.log('💎 DualStorage: Создание HD версии...');
      
      const hdBuffer = await this.createHDVersion(buffer, originalName);
      results.localHD = await this.saveLocalHD(hdBuffer, originalName);
      
      if (results.localHD.success) {
        console.log('✅ DualStorage: HD версия создана:', results.localHD.url);
      } else {
        console.warn('⚠️ DualStorage: HD версия не создана:', results.localHD.error);
      }
    } catch (error) {
      console.error('❌ DualStorage: Ошибка создания HD версии:', error.message);
      results.localHD = { success: false, error: error.message };
    }

    // 2. Сохраняем сжатую версию локально (для списков/превью)
    try {
      console.log('📦 DualStorage: Создание сжатой версии...');
      
      const compressedBuffer = await this.createCompressedVersion(buffer, originalName);
      // Сохраняем напрямую БЕЗ создания дополнительных HD версий
      results.localCompressed = await this.saveLocalCompressed(compressedBuffer, originalName);
      
      if (results.localCompressed.success) {
        console.log('✅ DualStorage: Сжатая версия создана:', results.localCompressed.url);
      } else {
        console.warn('⚠️ DualStorage: Сжатая версия не создана:', results.localCompressed.error);
      }
    } catch (error) {
      console.error('❌ DualStorage: Ошибка создания сжатой версии:', error.message);
      results.localCompressed = { success: false, error: error.message };
    }

    // 3. Пытаемся сохранить в Cloudinary (основное хранилище для CDN)
    if (this.cloudinaryHandler) {
      try {
        console.log('☁️ DualStorage: Сохранение в Cloudinary...');
        results.cloudinary = await this.cloudinaryHandler.processImageFromBuffer(buffer, originalName);
        
        if (results.cloudinary.success) {
          console.log('✅ DualStorage: Cloudinary сохранение успешно');
          
          // Cloudinary успешно - используем его как основной, с резервными локальными копиями
          const result = {
            ...results.cloudinary,
            processedBy: 'TRIPLE_STORAGE',
            environment: 'production',
            storage: {
              primary: 'cloudinary',
              cloudinaryUrl: results.cloudinary.url,
              localHDUrl: results.localHD && results.localHD.success ? results.localHD.url : null,
              localCompressedUrl: results.localCompressed && results.localCompressed.success ? results.localCompressed.url : null,
              hdVersion: results.localHD && results.localHD.success ? results.localHD.url : null,
              previewVersion: results.localCompressed && results.localCompressed.success ? results.localCompressed.url : null
            }
          };
          
          console.log(`✅ DualStorage: Основной URL (Cloudinary): ${result.url}`);
          if (result.storage.localHDUrl) {
            console.log(`💎 DualStorage: HD версия (локально): ${result.storage.localHDUrl}`);
          }
          if (result.storage.localCompressedUrl) {
            console.log(`📦 DualStorage: Сжатая версия (локально): ${result.storage.localCompressedUrl}`);
          }
          
          return result;
        } else {
          console.warn('⚠️ DualStorage: Cloudinary сохранение не удалось:', results.cloudinary.error);
        }
      } catch (error) {
        console.error('❌ DualStorage: Ошибка Cloudinary:', error.message);
        results.cloudinary = { success: false, error: error.message };
      }
    }

    // 4. Если Cloudinary недоступен, используем локальную HD копию
    if (results.localHD && results.localHD.success) {
      console.log('🔄 DualStorage: Cloudinary недоступен, используем локальную HD копию');
      
      const result = {
        ...results.localHD,
        processedBy: 'TRIPLE_STORAGE_FALLBACK_HD',
        environment: 'production',
        storage: {
          primary: 'local_hd',
          cloudinaryUrl: null,
          localHDUrl: results.localHD.url,
          localCompressedUrl: results.localCompressed && results.localCompressed.success ? results.localCompressed.url : null,
          hdVersion: results.localHD.url,
          previewVersion: results.localCompressed && results.localCompressed.success ? results.localCompressed.url : null
        }
      };
      
      console.log(`💎 DualStorage: Используем HD копию: ${result.url}`);
      return result;
    } 
    
    // 5. Если HD недоступна, используем сжатую версию
    if (results.localCompressed && results.localCompressed.success) {
      console.log('🔄 DualStorage: HD недоступна, используем сжатую копию');
      
      const result = {
        ...results.localCompressed,
        processedBy: 'TRIPLE_STORAGE_FALLBACK_COMPRESSED',
        environment: 'production',
        storage: {
          primary: 'local_compressed',
          cloudinaryUrl: null,
          localHDUrl: null,
          localCompressedUrl: results.localCompressed.url,
          hdVersion: null,
          previewVersion: results.localCompressed.url
        }
      };
      
      console.log(`📦 DualStorage: Используем сжатую копию: ${result.url}`);
      return result;
    }
    
    // Ни один способ не сработал
    return {
      success: false,
      error: 'Не удалось сохранить изображение никаким способом',
      originalName,
      details: {
        cloudinary: results.cloudinary,
        localHD: results.localHD,
        localCompressed: results.localCompressed
      }
    };
  }

  /**
   * Создает HD версию изображения для галереи с зумом
   */
  async createHDVersion(buffer, originalName) {
    const sharp = require('sharp');
    
    try {
      // Создаем HD версию (качество 95%, максимальная ширина 2400px)
      const hdBuffer = await sharp(buffer)
        .resize(2400, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: 95,
          effort: 6
        })
        .toBuffer();
      
      console.log(`💎 DualStorage: HD версия ${originalName}: ${buffer.length} -> ${hdBuffer.length} байт`);
      return hdBuffer;
    } catch (error) {
      console.warn('⚠️ DualStorage: Ошибка создания HD, используем оригинал:', error.message);
      return buffer;
    }
  }

  /**
   * Сохраняет HD версию в специальную папку
   */
  async saveLocalHD(buffer, originalName) {
    const fs = require('fs').promises;
    const path = require('path');
    const crypto = require('crypto');
    
    try {
      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(5).toString('hex');
      const ext = '.webp'; // HD всегда в WebP
      const filename = `${timestamp}-${randomString}${ext}`;
      
      // Путь к HD папке
      const hdDir = path.join(process.cwd(), 'uploads', 'hd');
      const filepath = path.join(hdDir, filename);
      
      // Создаем папку если не существует
      await fs.mkdir(hdDir, { recursive: true });
      
      // Сохраняем файл
      await fs.writeFile(filepath, buffer);
      
      const url = `/uploads/hd/${filename}`;
      
      return {
        success: true,
        url,
        filename,
        size: buffer.length,
        type: 'hd_local'
      };
    } catch (error) {
      console.error('❌ Ошибка сохранения HD версии:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Сохраняет сжатую версию локально (для списков/превью)
   * БЕЗ создания дополнительных HD версий
   */
  async saveLocalCompressed(buffer, originalName) {
    const fs = require('fs').promises;
    const path = require('path');
    const crypto = require('crypto');
    
    try {
      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(5).toString('hex');
      const ext = '.webp';
      const filename = `${timestamp}-${randomString}${ext}`;
      
      // Путь к обычной папке uploads
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filepath = path.join(uploadsDir, filename);
      
      // Создаем папку если не существует
      await fs.mkdir(uploadsDir, { recursive: true });
      
      // Сохраняем файл
      await fs.writeFile(filepath, buffer);
      
      const url = `/uploads/${filename}`;
      
      return {
        success: true,
        url,
        filename,
        size: buffer.length,
        type: 'compressed_local'
      };
    } catch (error) {
      console.error('❌ Ошибка сохранения сжатой версии:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Создает сжатую версию изображения для превью
   */
  async createCompressedVersion(buffer, originalName) {
    const sharp = require('sharp');
    
    try {
      // Создаем сжатую версию (качество 75%, максимальная ширина 800px)
      const compressedBuffer = await sharp(buffer)
        .resize(800, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: 75,
          effort: 4
        })
        .toBuffer();
      
      console.log(`📦 DualStorage: Сжатие ${originalName}: ${buffer.length} -> ${compressedBuffer.length} байт`);
      return compressedBuffer;
    } catch (error) {
      console.warn('⚠️ DualStorage: Ошибка сжатия, используем оригинал:', error.message);
      return buffer;
    }
  }

  /**
   * Обрабатывает массив изображений с двойным сохранением
   */
  async processMultipleImages(files) {
    console.log(`🖼️ DualStorage: Обработка ${files.length} файлов с двойным сохранением...`);
    
    const results = [];
    
    for (const file of files) {
      if (this.isImageFile(file.originalname)) {
        const result = await this.processImageFromBuffer(file.buffer, file.originalname);
        results.push(result);
      } else {
        // Для не-изображений создаем запись без обработки
        results.push({
          success: false,
          error: 'Файл не является изображением',
          originalName: file.originalname
        });
      }
    }
    
    return results;
  }

  /**
   * Проверяет, является ли файл изображением
   */
  isImageFile(filename) {
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const ext = require('path').extname(filename).toLowerCase();
    return supportedFormats.includes(ext);
  }

  /**
   * Проверяет размеры файлов
   */
  checkFileSizes(files) {
    const errors = [];
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        errors.push(`Файл ${file.originalname} слишком большой: ${(file.size / 1024 / 1024).toFixed(2)}MB (максимум 50MB)`);
      }
    }
    
    return errors;
  }

  /**
   * Удаляет изображение из обоих хранилищ
   */
  async deleteImage(imageUrl) {
    console.log(`🗑️ DualStorage: Удаление ${imageUrl} из обоих хранилищ...`);
    
    const results = {
      cloudinary: { success: false },
      local: { success: false }
    };

    // Удаляем из Cloudinary
    if (this.cloudinaryHandler && imageUrl.includes('cloudinary.com')) {
      try {
        results.cloudinary = await this.cloudinaryHandler.deleteImage(imageUrl);
        console.log(`☁️ DualStorage: Cloudinary удаление: ${results.cloudinary.success ? 'успешно' : 'не удалось'}`);
      } catch (error) {
        console.error('❌ DualStorage: Ошибка удаления из Cloudinary:', error.message);
      }
    }

    // Удаляем локально
    if (imageUrl.startsWith('/uploads/')) {
      try {
        results.local = await this.localHandler.deleteImage(imageUrl);
        console.log(`💾 DualStorage: Локальное удаление: ${results.local.success ? 'успешно' : 'не удалось'}`);
      } catch (error) {
        console.error('❌ DualStorage: Ошибка локального удаления:', error.message);
      }
    }

    return {
      success: results.cloudinary.success || results.local.success,
      details: results
    };
  }

  /**
   * Получает информацию о конфигурации
   */
  getConfigInfo() {
    return {
      environment: 'production',
      mode: 'triple_storage',
      localHandler: !!this.localHandler,
      cloudinaryHandler: !!this.cloudinaryHandler,
      activeHandler: 'triple_storage',
      cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
      description: 'Тройное сохранение: Cloudinary (CDN) + HD локально (галерея) + сжатое локально (превью)',
      versions: {
        cloudinary: 'Основное хранилище для быстрой загрузки через CDN',
        localHD: 'HD версия (2400px, WebP 95%) для галереи с зумом',
        localCompressed: 'Сжатая версия (800px, WebP 75%) для списков и превью'
      }
    };
  }
}

module.exports = DualStorageImageHandler;
