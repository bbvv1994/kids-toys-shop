// Универсальная конфигурация для автоматического определения среды
const config = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001',
    FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'
  },
  production: {
    // В продакшене предпочитаем тот же origin, чтобы избежать CORS, env — как запасной вариант
    API_BASE_URL: (typeof window !== 'undefined' && window.location.origin) || process.env.REACT_APP_API_BASE_URL || '',
    FRONTEND_URL: (typeof window !== 'undefined' && window.location.origin) || process.env.REACT_APP_FRONTEND_URL || ''
  }
};

// Автоматическое определение среды
const getEnvironment = () => {
  // Оптимизация: убираем console.log в продакшене для улучшения производительности
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Определение среды...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
    console.log('window.location.hostname:', typeof window !== 'undefined' ? window.location.hostname : 'undefined');
  }
  
  // Если есть переменная окружения NODE_ENV
  if (process.env.NODE_ENV) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Используем NODE_ENV:', process.env.NODE_ENV);
    }
    return process.env.NODE_ENV;
  }
  
  // Если запущено на localhost - development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Определено как development (localhost)');
    }
    return 'development';
  }
  
  // Если есть переменные окружения для production
  if (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_FRONTEND_URL) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Определено как production (есть env переменные)');
    }
    return 'production';
  }
  
  // Если запущено на Vercel или Netlify - production
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app'))) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Определено как production (Vercel/Netlify)');
    }
    return 'production';
  }
  
  // По умолчанию - development
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ По умолчанию используем development');
  }
  return 'development';
};

const environment = getEnvironment();

// Экспортируем конфигурацию для текущей среды
export const API_BASE_URL = config[environment].API_BASE_URL;
export const FRONTEND_URL = config[environment].FRONTEND_URL;

// Функция для получения полного URL API
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}/api${cleanEndpoint}`;
};

// Функция для получения URL загруженных файлов
export const getUploadUrl = (filename) => {
  if (!filename) return '';
  return `${API_BASE_URL}/uploads/${filename}`;
};

// Функция для получения URL изображений
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }
  
  // Если это уже полный URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Если это путь /uploads/...
  if (imagePath.startsWith('/uploads/')) {
    const url = `${API_BASE_URL}${imagePath}`;
    return url;
  }
  
  // Если это загруженный файл (начинается с цифр)
  if (/^\d+/.test(imagePath)) {
    const url = getUploadUrl(imagePath);
    return url;
  }
  
  // Если это статический файл из public папки (PNG, JPG, etc.)
  if (imagePath.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
    // Статические файлы из public папки доступны напрямую через корень
    return `/${imagePath}`;
  }
  
  // Если это статический файл
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // По умолчанию считаем загруженным файлом
  const url = getUploadUrl(imagePath);
  return url;
};

// Определяем, в какой среде мы работаем
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Более надежное определение продакшена
const isProduction = !isDevelopment || 
                    window.location.hostname.includes('vercel.app') ||
                    window.location.hostname.includes('netlify.app') ||
                    window.location.hostname.includes('render.com') ||
                    window.location.hostname.includes('herokuapp.com') ||
                    process.env.NODE_ENV === 'production';

// Экспортируем переменные среды для использования в других компонентах
export { isDevelopment, isProduction };

// Функция для получения HD-версии изображения для экранной лупы
// В локальной среде возвращает оригинальное изображение (HD качество достигается через CSS scale)
// В продакшене пытается найти или создать HD версии
export const getHdImageUrl = (imagePath, quality = '2x') => {
  if (!imagePath) {
    return '';
  }
  
  // Если изображение уже является HD версией, возвращаем его как есть
  if (imagePath.includes('@') && (imagePath.includes('@2x') || imagePath.includes('@4x'))) {
    return imagePath;
  }
  
  // В локальной среде проверяем, есть ли HD версии
  if (isDevelopment) {
    // Если это локальное изображение, попробуем найти HD версию
    if (imagePath.startsWith('/uploads/') || imagePath.includes('/uploads/')) {
      // Извлекаем имя файла из пути
      let filename;
      if (imagePath.startsWith('/uploads/')) {
        filename = imagePath.split('/').pop(); // Получаем имя файла
      } else {
        // Если это полный URL, извлекаем имя файла
        const urlParts = imagePath.split('/');
        const uploadsIndex = urlParts.findIndex(part => part === 'uploads');
        if (uploadsIndex !== -1 && urlParts[uploadsIndex + 1]) {
          filename = urlParts[uploadsIndex + 1];
        }
      }
      
      if (filename) {
        const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Убираем расширение
        
        // Пробуем найти HD версию в папке uploads/hd
        // HD файлы имеют формат: filename@4x.webp, filename@2x.webp
        const fileExtension = imagePath.split('.').pop(); // Получаем расширение файла
        const hdFilename = `${baseFilename}@${quality}.${fileExtension}`;
        
        // Для экранной лупы (4x) всегда возвращаем HD путь
        // Если HD версия не существует, браузер покажет ошибку 404
        if (quality === '4x') {
          return `/uploads/hd/${hdFilename}`;
        }
        
        // Для 2x качества также возвращаем HD версию
        if (quality === '2x') {
          return `/uploads/hd/${hdFilename}`;
        }
        
        // Для других случаев возвращаем оригинал
        return imagePath;
      }
    }
    
    // Для других изображений в локальной среде возвращаем оригинал
    return imagePath;
  }
  
  // В продакшене используем Cloudinary или создаем HD версии
  if (isProduction) {
    // Если это Cloudinary URL
    if (imagePath.includes('cloudinary.com')) {
      try {
        // Извлекаем publicId из URL Cloudinary
        const urlParts = imagePath.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
          // Пропускаем версию и берем путь к файлу
          const publicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
          
          // Создаем HD-версию используя реальные HD изображения из Cloudinary
          const hdSuffix = quality === '4x' ? '_hd4x' : '_hd2x';
          const hdPublicId = `${publicId}${hdSuffix}`;
          
          // Создаем URL для реального HD изображения
          const hdUrl = imagePath.replace(
            /\/upload\/([^\/]+)\//,
            `/upload/`
          ).replace(
            new RegExp(`${publicId}\\.[^/]+$`),
            `${hdPublicId}.jpg`
          );
          
          return hdUrl;
        }
      } catch (error) {
        console.warn('⚠️ Failed to create Cloudinary HD URL, using original:', error.message);
      }
    }
    
    // Если это не Cloudinary, но мы в продакшене, создаем HD версию через API
    // или используем оригинал с увеличенным размером
    
    // Попробуем создать HD версию через API endpoint
    if (imagePath.startsWith('/uploads/') || imagePath.includes('/uploads/')) {
      // В продакшене можем использовать специальный endpoint для создания HD версий
      const hdUrl = imagePath.replace(
        /\.(webp|jpg|jpeg|png)$/i,
        `@${quality}.webp`
      );
      
      // Также можем попробовать использовать специальный API endpoint для HD версий
      if (API_BASE_URL && !API_BASE_URL.includes('localhost')) {
        const apiHdUrl = `${API_BASE_URL}/api/images/hd?path=${encodeURIComponent(imagePath)}&quality=${quality}`;
        return apiHdUrl;
      }
      
      // Если API endpoint недоступен, попробуем создать HD версию локально
      // или использовать оригинал с CSS zoom
      return hdUrl;
    }
  }
  
  // Fallback на оригинал
  
  // В продакшене, если не удалось создать HD версию, 
  // можем попробовать увеличить оригинал через CSS transform
  if (isProduction && !imagePath.includes('@')) {
    return imagePath;
  }
  
  return imagePath;
};

// Экспортируем информацию о текущей среде для отладки
export const ENV_INFO = {
  environment,
  API_BASE_URL,
  FRONTEND_URL,
  isDevelopment,
  isProduction
}; 