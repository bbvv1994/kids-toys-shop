const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

class FlexibleImageHandler {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    
    // Определяем режим хранения
    this.storageMode = this.getStorageMode();
    
    // Настройка Cloudinary только если используется
    if (this.storageMode === 'cloudinary') {
      this.setupCloudinary();
    }
    
    console.log(`🖼️ FlexibleImageHandler: Режим хранения - ${this.storageMode}`);
  }

  /**
   * Настройка Cloudinary
   */
  setupCloudinary() {
    // Проверяем CLOUDINARY_URL
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({
        url: process.env.CLOUDINARY_URL
      });
      console.log('🖼️ FlexibleImageHandler: Cloudinary настроен через CLOUDINARY_URL');
    } 
    // Fallback для отдельных переменных
    else if (process.env.CLOUDINARY_CLOUD_NAME && 
             process.env.CLOUDINARY_API_KEY && 
             process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      console.log('🖼️ FlexibleImageHandler: Cloudinary настроен через отдельные переменные');
    }
  }

  /**
   * Определяет режим хранения на основе переменных окружения
   */
  getStorageMode() {
    // Если есть CLOUDINARY_URL, используем Cloudinary
    if (process.env.CLOUDINARY_URL) {
      return 'cloudinary';
    }
    
    // Если есть все отдельные переменные Cloudinary, используем его
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET) {
      return 'cloudinary';
    }
    
    // Иначе используем локальное хранение
    return 'local';
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
   * Обрабатывает изображение
   */
  async processImageFromBuffer(buffer, originalName) {
    try {
      console.log(`🖼️ FlexibleImageHandler: Processing image: ${originalName}`);
      console.log(`🖼️ FlexibleImageHandler: Storage mode: ${this.storageMode}`);
      
      // Обрабатываем изображение с оптимизацией
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

      console.log(`✅ ${originalName} processed`);
      console.log(`   Size: ${(originalSize / 1024).toFixed(1)}KB -> ${(processedSize / 1024).toFixed(1)}KB`);
      console.log(`   Compression: ${compressionRatio}%`);

      // Сохраняем в зависимости от режима
      if (this.storageMode === 'cloudinary') {
        return await this.saveToCloudinary(processedBuffer, originalName, processedSize, compressionRatio);
      } else {
        return await this.saveToLocal(processedBuffer, originalName, processedSize, compressionRatio);
      }

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
   * Сохраняет в Cloudinary
   */
  async saveToCloudinary(buffer, originalName, processedSize, compressionRatio) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const publicId = `kids-toys-shop/${timestamp}-${randomString}`;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: 'kids-toys-shop',
            resource_type: 'image',
            transformation: [
              { width: 600, height: 600, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ],
            // Добавляем автоматическое удаление фона (если включено)
            ...(process.env.ENABLE_BG_REMOVAL === 'true' && {
              background_removal: 'auto'
            })
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              resolve({
                success: false,
                error: error.message
              });
            } else {
              console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
              if (process.env.ENABLE_BG_REMOVAL === 'true') {
                console.log('🎨 Background removal applied');
              }
              resolve({
                success: true,
                filename: `${timestamp}-${randomString}.webp`,
                url: result.secure_url,
                publicId: result.public_id,
                originalSize: buffer.length,
                processedSize,
                compressionRatio: parseFloat(compressionRatio),
                mimetype: 'image/webp',
                backgroundRemoved: process.env.ENABLE_BG_REMOVAL === 'true'
              });
            }
          }
        );

        uploadStream.end(buffer);
      });

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Сохраняет локально
   */
  async saveToLocal(buffer, originalName, processedSize, compressionRatio) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const filename = `${timestamp}-${randomString}.webp`;
      
      // Создаем папку uploads если её нет
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Сохраняем файл
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      console.log(`✅ Saved locally: ${filePath}`);
      
      return {
        success: true,
        filename,
        url: `/uploads/${filename}`,
        originalSize: buffer.length,
        processedSize,
        compressionRatio: parseFloat(compressionRatio),
        mimetype: 'image/webp'
      };

    } catch (error) {
      console.error('❌ Local save error:', error);
      return {
        success: false,
        error: error.message
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
        // Для не-изображений сохраняем как есть
        if (this.storageMode === 'cloudinary') {
          const uploadResult = await this.saveToCloudinary(file.buffer, file.originalname, file.buffer.length, 0);
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`;
          
          results.push({
            success: uploadResult.success,
            filename,
            url: uploadResult.success ? uploadResult.url : null,
            publicId: uploadResult.success ? uploadResult.publicId : null,
            originalSize: file.buffer.length,
            processedSize: file.buffer.length,
            compressionRatio: 0,
            mimetype: file.mimetype,
            error: uploadResult.success ? null : uploadResult.error
          });
        } else {
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`;
          const uploadsDir = path.join(__dirname, '..', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, file.buffer);
          
          results.push({
            success: true,
            filename,
            url: `/uploads/${filename}`,
            originalSize: file.buffer.length,
            processedSize: file.buffer.length,
            compressionRatio: 0,
            mimetype: file.mimetype
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
        errors.push(`File ${file.originalname} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
      }
    }

    return errors;
  }

  /**
   * Удаляет изображение
   */
  async deleteImage(identifier) {
    if (this.storageMode === 'cloudinary') {
      // Удаляем из Cloudinary
      try {
        const result = await cloudinary.uploader.destroy(identifier);
        console.log(`✅ Deleted from Cloudinary: ${identifier}`);
        return { success: true };
      } catch (error) {
        console.error(`❌ Error deleting from Cloudinary: ${identifier}`, error);
        return { success: false, error: error.message };
      }
    } else {
      // Удаляем локальный файл
      try {
        const filePath = path.join(__dirname, '..', 'uploads', identifier);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted locally: ${filePath}`);
          return { success: true };
        }
        return { success: false, error: 'File not found' };
      } catch (error) {
        console.error(`❌ Error deleting locally: ${identifier}`, error);
        return { success: false, error: error.message };
      }
    }
  }
}

module.exports = FlexibleImageHandler; 