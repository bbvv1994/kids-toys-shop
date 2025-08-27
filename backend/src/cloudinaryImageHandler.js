const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const path = require('path');

class CloudinaryImageHandler {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    
    // Настройка Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
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
   * Обрабатывает изображение и загружает в Cloudinary
   */
  async processImageFromBuffer(buffer, originalName) {
    try {
      console.log(`🖼️ CloudinaryImageHandler: Processing image: ${originalName}`);
      console.log(`🖼️ CloudinaryImageHandler: Buffer size: ${buffer.length} bytes`);
      
      // Сохраняем оригинальный буфер для HD версий
      const originalBuffer = buffer;
      
      // Обрабатываем изображение с оптимизацией (только для основного изображения)
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

      // Загружаем в Cloudinary
      const uploadResult = await this.uploadToCloudinary(processedBuffer, originalName);
      
      if (uploadResult.success) {
        // Создаем HD версии для экранной лупы (используем оригинальный буфер)
        const hdVersions = await this.createHdVersionsFromBuffer(originalBuffer, uploadResult.publicId);
        
        return {
          success: true,
          filename: uploadResult.filename,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          originalSize,
          processedSize,
          compressionRatio: parseFloat(compressionRatio),
          mimetype: 'image/webp',
          hdVersions: hdVersions.success ? {
            hd2x: hdVersions.hd2x,
            hd4x: hdVersions.hd4x
          } : null
        };
      } else {
        return {
          success: false,
          error: uploadResult.error,
          originalName
        };
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
   * Загружает изображение в Cloudinary
   */
  async uploadToCloudinary(buffer, originalName) {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const publicId = `kids-toys-shop/${timestamp}-${randomString}`;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: 'image',
            transformation: [
              { width: 600, height: 600, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
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
              resolve({
                success: true,
                filename: `${timestamp}-${randomString}.webp`,
                url: result.secure_url,
                publicId: result.public_id
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
   * Создает HD-версии изображения для экранной лупы
   */
  async createHdVersions(publicId) {
    try {
      console.log(`🖼️ Creating HD versions for: ${publicId}`);
      
      // Создаем @2x версию (1200x1200) - загружаем реальное изображение
      const hd2xResult = await cloudinary.uploader.upload(
        cloudinary.url(publicId, {
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        }),
        {
          public_id: `${publicId}_hd2x`,
          resource_type: 'image',
          overwrite: true
        }
      );

      // Создаем @4x версию (2400x2400) - загружаем реальное изображение
      const hd4xResult = await cloudinary.uploader.upload(
        cloudinary.url(publicId, {
          transformation: [
            { width: 2400, height: 2400, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        }),
        {
          public_id: `${publicId}_hd4x`,
          resource_type: 'image',
          overwrite: true
        }
      );

      console.log(`✅ HD versions created and uploaded for: ${publicId}`);
      console.log(`   HD @2x: ${hd2xResult.secure_url}`);
      console.log(`   HD @4x: ${hd4xResult.secure_url}`);
      
      return {
        success: true,
        hd2x: hd2xResult.secure_url,
        hd4x: hd4xResult.secure_url,
        publicId,
        hd2xPublicId: hd2xResult.public_id,
        hd4xPublicId: hd4xResult.public_id
      };

    } catch (error) {
      console.error(`❌ Error creating HD versions for ${publicId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Создает HD-версии изображения из оригинального буфера (без сжатия Sharp)
   */
  async createHdVersionsFromBuffer(originalBuffer, publicId) {
    try {
      console.log(`🖼️ Creating HD versions from buffer for: ${publicId}`);
      
      // Создаем @2x версию (1200x1200) из оригинального буфера
      const hd2xBuffer = await sharp(originalBuffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 85,
          effort: 3 
        })
        .toBuffer();

      // Создаем @4x версию (2400x2400) из оригинального буфера
      const hd4xBuffer = await sharp(originalBuffer)
        .resize(2400, 2400, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 90,
          effort: 3 
        })
        .toBuffer();

      // Загружаем HD версии в Cloudinary
      const hd2xResult = await cloudinary.uploader.upload_stream(
        {
          public_id: `${publicId}_hd2x`,
          resource_type: 'image',
          overwrite: true
        },
        (error, result) => {
          if (error) {
            console.error('❌ HD @2x upload error:', error);
          } else {
            console.log(`✅ HD @2x uploaded: ${result.secure_url}`);
          }
        }
      );
      hd2xResult.end(hd2xBuffer);

      const hd4xResult = await cloudinary.uploader.upload_stream(
        {
          public_id: `${publicId}_hd4x`,
          resource_type: 'image',
          overwrite: true
        },
        (error, result) => {
          if (error) {
            console.error('❌ HD @4x upload error:', error);
          } else {
            console.log(`✅ HD @4x uploaded: ${result.secure_url}`);
          }
        }
      );
      hd4xResult.end(hd4xBuffer);

      console.log(`✅ HD versions created and uploaded from buffer for: ${publicId}`);
      
      // Получаем полные URL для HD версий
      const hd2xUrl = cloudinary.url(`${publicId}_hd2x`);
      const hd4xUrl = cloudinary.url(`${publicId}_hd4x`);

      return {
        success: true,
        hd2x: hd2xUrl,
        hd4x: hd4xUrl,
        publicId
      };

    } catch (error) {
      console.error(`❌ Error creating HD versions from buffer for ${publicId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
      }
    }

  /**
   * Получает HD-версию изображения по URL
   */
  async getHdImageUrl(originalUrl, quality = '2x') {
    try {
      if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
        return originalUrl; // Возвращаем оригинал, если не Cloudinary
      }

      // Извлекаем publicId из URL
      const urlParts = originalUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return originalUrl;

      const publicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
      
      // Сначала проверяем, есть ли уже загруженная HD версия
      const hdPublicId = `${publicId}_hd${quality}`;
      
      try {
        // Проверяем, существует ли HD версия
        const hdResource = await cloudinary.api.resource(hdPublicId);
        if (hdResource && hdResource.secure_url) {
          console.log(`✅ Найдена существующая HD ${quality} версия: ${hdPublicId}`);
          return hdResource.secure_url;
        }
      } catch (error) {
        // HD версия не найдена, создаем через transformation
        console.log(`🔧 HD ${quality} версия не найдена, используем transformation`);
      }
      
      // Если HD версии нет, создаем через transformation
      const hdUrl = cloudinary.url(publicId, {
        transformation: [
          { 
            width: quality === '4x' ? 2400 : 1200, 
            height: quality === '4x' ? 2400 : 1200, 
            crop: 'limit' 
          },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return hdUrl;

    } catch (error) {
      console.error('❌ Error getting HD image URL:', error.message);
      return originalUrl; // Возвращаем оригинал в случае ошибки
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
        // Для не-изображений загружаем как есть
        const uploadResult = await this.uploadToCloudinary(file.buffer, file.originalname);
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
   * Удаляет изображение из Cloudinary
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Deleted from Cloudinary: ${publicId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting from Cloudinary: ${publicId}`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = CloudinaryImageHandler; 