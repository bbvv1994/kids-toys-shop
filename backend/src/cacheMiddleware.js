const cacheManager = require('./cache');

// Middleware для кэширования GET запросов
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Кэшируем только GET запросы
    if (req.method !== 'GET') {
      return next();
    }

    // Генерируем ключ кэша
    let cacheKey;
    if (keyGenerator && typeof keyGenerator === 'function') {
      cacheKey = keyGenerator(req);
    } else {
      // Стандартная генерация ключа
      const baseKey = req.originalUrl.replace('/api/', '');
      const params = { ...req.query, ...req.params };
      cacheKey = cacheManager.generateKey(baseKey, params);
    }

    try {
      // Пытаемся получить из кэша
      const cached = await cacheManager.get(cacheKey);
      
      if (cached !== null) {
        console.log(`📦 Кэш HIT: ${cacheKey}`);
        return res.json(cached);
      }

      // Если нет в кэше, перехватываем res.json
      const originalJson = res.json;
      res.json = function(data) {
        // Сохраняем в кэш
        cacheManager.set(cacheKey, data, ttl)
          .then(() => {
            console.log(`📦 Кэш SET: ${cacheKey} (TTL: ${ttl}s)`);
          })
          .catch(err => {
            console.log(`❌ Ошибка сохранения в кэш: ${err.message}`);
          });

        // Вызываем оригинальный res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.log(`❌ Ошибка кэширования: ${error.message}`);
      next();
    }
  };
};

// Middleware для инвалидации кэша
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Выполняем оригинальный запрос
    const originalJson = res.json;
    res.json = function(data) {
      // Инвалидируем кэш после успешного выполнения
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(async (pattern) => {
          await cacheManager.invalidatePattern(pattern);
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

// Предустановленные паттерны для инвалидации
const CACHE_PATTERNS = {
  PRODUCTS: 'products:*',
  CATEGORIES: 'categories:*',
  REVIEWS: 'reviews:*',
  QUESTIONS: 'questions:*',
  ALL: '*'
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  CACHE_PATTERNS
};
