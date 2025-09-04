const redis = require('redis');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 час по умолчанию
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('❌ Redis сервер недоступен, кэширование отключено');
            return new Error('Redis сервер недоступен');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Время ожидания Redis превышено');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.log('❌ Redis ошибка:', err.message);
        this.isConnected = false;
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
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.log('❌ Ошибка получения из кэша:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.log('❌ Ошибка записи в кэш:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.log('❌ Ошибка удаления из кэша:', error.message);
      return false;
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
