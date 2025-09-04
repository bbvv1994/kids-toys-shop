const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cacheManager = require('./cache');

class ImageCacheMiddleware {
  constructor() {
    this.cacheDir = path.join(__dirname, '../cache/images');
    this.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 дней
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  // Генерация ключа кэша для изображения
  generateImageKey(imagePath, options = {}) {
    const { width, height, quality, format } = options;
    const keyData = `${imagePath}-${width || 'original'}-${height || 'original'}-${quality || 'original'}-${format || 'original'}`;
    return crypto.createHash('md5').update(keyData).digest('hex');
  }

  // Проверка существования кэшированного изображения
  async getCachedImage(imageKey) {
    const cachePath = path.join(this.cacheDir, `${imageKey}.cache`);
    
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      const now = Date.now();
      
      // Проверяем, не устарел ли кэш
      if (now - stats.mtime.getTime() < this.maxAge) {
        return {
          exists: true,
          path: cachePath,
          size: stats.size,
          mtime: stats.mtime
        };
      } else {
        // Удаляем устаревший файл
        fs.unlinkSync(cachePath);
      }
    }
    
    return { exists: false };
  }

  // Сохранение изображения в кэш
  async cacheImage(imageKey, imageBuffer, metadata = {}) {
    try {
      const cachePath = path.join(this.cacheDir, `${imageKey}.cache`);
      fs.writeFileSync(cachePath, imageBuffer);
      
      // Сохраняем метаданные
      const metaPath = path.join(this.cacheDir, `${imageKey}.meta`);
      fs.writeFileSync(metaPath, JSON.stringify(metadata));
      
      return true;
    } catch (error) {
      console.log('❌ Ошибка кэширования изображения:', error.message);
      return false;
    }
  }

  // Middleware для кэширования изображений
  middleware() {
    return async (req, res, next) => {
      // Обрабатываем только запросы к изображениям
      if (!req.path.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        return next();
      }

      try {
        const imagePath = req.path;
        const options = {
          width: req.query.w ? parseInt(req.query.w) : null,
          height: req.query.h ? parseInt(req.query.h) : null,
          quality: req.query.q ? parseInt(req.query.q) : null,
          format: req.query.f || null
        };

        const imageKey = this.generateImageKey(imagePath, options);
        const cached = await this.getCachedImage(imageKey);

        if (cached.exists) {
          // Отправляем кэшированное изображение
          res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 дней
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('Content-Type', this.getContentType(imagePath));
          res.setHeader('Content-Length', cached.size);
          
          const stream = fs.createReadStream(cached.path);
          stream.pipe(res);
          return;
        }

        // Если нет в кэше, перехватываем ответ
        const originalEnd = res.end;
        const chunks = [];

        res.end = function(chunk) {
          if (chunk) {
            chunks.push(chunk);
          }

          if (chunks.length > 0) {
            const imageBuffer = Buffer.concat(chunks);
            
            // Кэшируем изображение асинхронно
            setImmediate(async () => {
              await this.cacheImage(imageKey, imageBuffer, {
                originalPath: imagePath,
                options,
                cachedAt: new Date().toISOString()
              });
            });
          }

          return originalEnd.call(this, chunk);
        }.bind(this);

        next();
      } catch (error) {
        console.log('❌ Ошибка middleware кэширования изображений:', error.message);
        next();
      }
    };
  }

  // Определение MIME типа
  getContentType(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const types = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return types[ext] || 'application/octet-stream';
  }

  // Очистка устаревших файлов кэша
  async cleanup() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();
      let cleaned = 0;

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > this.maxAge) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Очищено ${cleaned} устаревших файлов кэша изображений`);
      }

      return cleaned;
    } catch (error) {
      console.log('❌ Ошибка очистки кэша изображений:', error.message);
      return 0;
    }
  }
}

module.exports = ImageCacheMiddleware;
