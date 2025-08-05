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

      // Загружаем в Cloudinary
      const uploadResult = await this.uploadToCloudinary(processedBuffer, originalName);
      
      if (uploadResult.success) {
        return {
          success: true,
          filename: uploadResult.filename,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          originalSize,
          processedSize,
          compressionRatio: parseFloat(compressionRatio),
          mimetype: 'image/webp'
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
            folder: 'kids-toys-shop',
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