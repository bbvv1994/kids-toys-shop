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

    console.log(`🔍 cacheMiddleware: Проверяем кэш для ключа: ${cacheKey}`);
    
    try {
      // Пытаемся получить из кэша
      const cached = await cacheManager.get(cacheKey);
      
      if (cached !== null) {
        console.log(`📦 Кэш HIT: ${cacheKey}`);
        console.log(`📦 Возвращаем кэшированные данные, размер: ${JSON.stringify(cached).length} символов`);
        
        // Добавляем заголовки кэширования для кэшированных ответов
        // В HTTP заголовках разрешены только ASCII-символы, поэтому делаем безопасный ключ/etag
        const crypto = require('crypto');
        const safeEtag = crypto.createHash('md5').update(cacheKey, 'utf8').digest('hex');
        const safeCacheKeyHeader = Buffer.from(cacheKey, 'utf8').toString('base64');

        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 минут
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', safeCacheKeyHeader);
        res.setHeader('ETag', `"${safeEtag}"`);
        
        return res.json(cached);
      }
      
      console.log(`📦 Кэш MISS: ${cacheKey}`);

      // Если нет в кэше, перехватываем res.json
      const originalJson = res.json;
      res.json = function(data) {
        // Добавляем заголовки кэширования для новых ответов
        // В HTTP заголовках разрешены только ASCII-символы, поэтому делаем безопасный ключ/etag
        const crypto = require('crypto');
        const safeEtag = crypto.createHash('md5').update(cacheKey, 'utf8').digest('hex');
        const safeCacheKeyHeader = Buffer.from(cacheKey, 'utf8').toString('base64');

        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 минут
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', safeCacheKeyHeader);
        res.setHeader('ETag', `"${safeEtag}"`);
        
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
  ORDERS: 'orders:*',
  USERS: 'users:*',
  IMAGES: 'images:*',
  SEARCH: 'search:*',
  ALL: '*'
};

// Функция для умной инвалидации кэша
const smartInvalidateCache = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Инвалидируем кэш после успешного выполнения
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const method = req.method;
      const path = req.path;
      
      // Определяем паттерны для инвалидации на основе пути и метода
      const patterns = [];
      
      if (path.includes('/products')) {
        patterns.push(CACHE_PATTERNS.PRODUCTS);
        patterns.push(CACHE_PATTERNS.SEARCH); // Поиск тоже зависит от товаров
      }
      
      if (path.includes('/categories')) {
        patterns.push(CACHE_PATTERNS.CATEGORIES);
        patterns.push(CACHE_PATTERNS.PRODUCTS); // Товары могут измениться при изменении категорий
      }
      
      if (path.includes('/reviews')) {
        patterns.push(CACHE_PATTERNS.REVIEWS);
        patterns.push(CACHE_PATTERNS.PRODUCTS); // Рейтинг товара может измениться
      }
      
      if (path.includes('/questions')) {
        patterns.push(CACHE_PATTERNS.QUESTIONS);
        patterns.push(CACHE_PATTERNS.PRODUCTS);
      }
      
      if (path.includes('/orders')) {
        patterns.push(CACHE_PATTERNS.ORDERS);
      }
      
      if (path.includes('/users')) {
        patterns.push(CACHE_PATTERNS.USERS);
      }
      
      if (path.includes('/images')) {
        patterns.push(CACHE_PATTERNS.IMAGES);
      }
      
      // Инвалидируем кэш асинхронно
      if (patterns.length > 0) {
        setImmediate(async () => {
          for (const pattern of patterns) {
            try {
              await cacheManager.invalidatePattern(pattern);
              console.log(`🗑️ Инвалидирован кэш по паттерну: ${pattern}`);
            } catch (error) {
              console.log(`❌ Ошибка инвалидации кэша ${pattern}:`, error.message);
            }
          }
        });
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  smartInvalidateCache,
  CACHE_PATTERNS
};
