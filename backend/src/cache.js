const redis = require('redis');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 час по умолчанию
  }

  async connect() {
    try {
      // Проверяем, доступен ли Redis
      const redis = require('redis');
      
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('❌ Redis сервер недоступен, используем in-memory кэш');
            this.isConnected = false;
            this.memoryCache = new Map();
            return new Error('Redis сервер недоступен');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.log('❌ Время ожидания Redis превышено, используем in-memory кэш');
            this.isConnected = false;
            this.memoryCache = new Map();
            return new Error('Время ожидания Redis превышено');
          }
          if (options.attempt > 10) {
            console.log('❌ Превышено количество попыток подключения к Redis, используем in-memory кэш');
            this.isConnected = false;
            this.memoryCache = new Map();
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.log('❌ Redis ошибка:', err.message);
        this.isConnected = false;
        // Инициализируем in-memory кэш при ошибке
        if (!this.memoryCache) {
          this.memoryCache = new Map();
          console.log('🔄 Переключение на in-memory кэш');
        }
      });

      this.client.on('connect', () => {
        console.log('✅ Redis подключен');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis готов к работе');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.log('❌ Не удалось подключиться к Redis:', error.message);
      this.isConnected = false;
      // Инициализируем in-memory кэш как fallback
      this.memoryCache = new Map();
      console.log('🔄 Используем in-memory кэш как fallback');
    }
  }

  async get(key) {
    // Если Redis недоступен, используем in-memory кэш
    if (!this.isConnected || !this.client) {
      if (this.memoryCache && this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        // Проверяем TTL
        if (cached.expires && Date.now() > cached.expires) {
          this.memoryCache.delete(key);
          return null;
        }
        return cached.data;
      }
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.log('❌ Ошибка получения из Redis, переключаемся на in-memory кэш:', error.message);
      // Переключаемся на in-memory кэш при ошибке
      if (!this.memoryCache) {
        this.memoryCache = new Map();
      }
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);
        if (cached.expires && Date.now() > cached.expires) {
          this.memoryCache.delete(key);
          return null;
        }
        return cached.data;
      }
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    // Если Redis недоступен, используем in-memory кэш
    if (!this.isConnected || !this.client) {
      if (!this.memoryCache) {
        this.memoryCache = new Map();
      }
      this.memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    }

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      // Также сохраняем в in-memory кэш для резерва
      if (!this.memoryCache) {
        this.memoryCache = new Map();
      }
      this.memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      console.log('❌ Ошибка записи в Redis, используем in-memory кэш:', error.message);
      // Переключаемся на in-memory кэш при ошибке
      if (!this.memoryCache) {
        this.memoryCache = new Map();
      }
      this.memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttl * 1000)
      });
      return true;
    }
  }

  async del(key) {
    // Удаляем из in-memory кэша
    if (this.memoryCache && this.memoryCache.has(key)) {
      this.memoryCache.delete(key);
    }

    if (!this.isConnected || !this.client) {
      return true;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.log('❌ Ошибка удаления из Redis:', error.message);
      return true; // Возвращаем true, так как удалили из in-memory кэша
    }
  }

  async flush() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.log('❌ Ошибка очистки кэша:', error.message);
      return false;
    }
  }

  // Генерация ключей кэша
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }

  // Кэширование с автоматическим ключом
  async cache(key, fetchFunction, ttl = this.defaultTTL) {
    // Пытаемся получить из кэша
    const cached = await this.get(key);
    if (cached !== null) {
      console.log(`📦 Кэш HIT: ${key}`);
      return cached;
    }

    // Если нет в кэше, выполняем функцию и сохраняем результат
    console.log(`📦 Кэш MISS: ${key}`);
    try {
      const result = await fetchFunction();
      await this.set(key, result, ttl);
      return result;
    } catch (error) {
      console.log(`❌ Ошибка выполнения функции для кэша ${key}:`, error.message);
      throw error;
    }
  }

  // Инвалидация кэша по паттерну
  async invalidatePattern(pattern) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️ Удалено ${keys.length} ключей кэша по паттерну: ${pattern}`);
      }
      return true;
    } catch (error) {
      console.log('❌ Ошибка инвалидации кэша:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Создаем единственный экземпляр
const cacheManager = new CacheManager();

module.exports = cacheManager;
