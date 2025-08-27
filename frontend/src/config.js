// Универсальная конфигурация для автоматического определения среды
const config = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://192.168.31.103:5001',
    FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'http://192.168.31.103:3000'
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://kids-toys-backend.onrender.com',
    FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://kids-toys-shop.vercel.app')
  }
};

// Автоматическое определение среды
const getEnvironment = () => {
  console.log('🔧 Определение среды...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
  console.log('window.location.hostname:', typeof window !== 'undefined' ? window.location.hostname : 'undefined');
  
  // Если есть переменная окружения NODE_ENV
  if (process.env.NODE_ENV) {
    console.log('✅ Используем NODE_ENV:', process.env.NODE_ENV);
    return process.env.NODE_ENV;
  }
  
  // Если запущено на localhost - development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('✅ Определено как development (localhost)');
    return 'development';
  }
  
  // Если есть переменные окружения для production
  if (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_FRONTEND_URL) {
    console.log('✅ Определено как production (есть env переменные)');
    return 'production';
  }
  
  // Если запущено на Vercel или Netlify - production
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app'))) {
    console.log('✅ Определено как production (Vercel/Netlify)');
    return 'production';
  }
  
  // По умолчанию - development
  console.log('⚠️ По умолчанию используем development');
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
  console.log('🔧 getImageUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('❌ No imagePath provided');
    return '';
  }
  
  // Если это уже полный URL
  if (imagePath.startsWith('http')) {
    console.log('✅ Full URL detected:', imagePath);
    return imagePath;
  }
  
  // Если это путь /uploads/...
  if (imagePath.startsWith('/uploads/')) {
    const url = `${API_BASE_URL}${imagePath}`;
    console.log('✅ Uploads path detected:', url);
    return url;
  }
  
  // Если это загруженный файл (начинается с цифр)
  if (/^\d+/.test(imagePath)) {
    const url = getUploadUrl(imagePath);
    console.log('✅ Uploaded file detected:', url);
    return url;
  }
  
  // Если это статический файл из public папки (PNG, JPG, etc.)
  if (imagePath.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
    const url = `${API_BASE_URL}/public/${imagePath}`;
    console.log('✅ Static file detected:', url);
    return url;
  }
  
  // Если это статический файл
  if (imagePath.startsWith('/')) {
    console.log('✅ Static path detected:', imagePath);
    return imagePath;
  }
  
  // По умолчанию считаем загруженным файлом
  const url = getUploadUrl(imagePath);
  console.log('✅ Default upload file:', url);
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
export const getHdImageUrl = (imagePath, quality = '2x') => {
  console.log('🔧 getHdImageUrl called with:', imagePath, 'quality:', quality);
  console.log('🔧 Environment:', isDevelopment ? 'LOCAL' : 'PRODUCTION');
  console.log('🔧 isProduction:', isProduction);
  console.log('🔧 API_BASE_URL:', API_BASE_URL);
  console.log('🔧 window.location.hostname:', typeof window !== 'undefined' ? window.location.hostname : 'undefined');
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  
  if (!imagePath) {
    console.log('❌ No imagePath provided for HD');
    return '';
  }
  
  // Если изображение уже является HD версией, возвращаем его как есть
  if (imagePath.includes('@') && (imagePath.includes('@2x') || imagePath.includes('@4x'))) {
    console.log('✅ Изображение уже является HD версией:', imagePath);
    return imagePath;
  }
  
  // В локальной среде используем локальную систему HD
  if (isDevelopment) {
    // Если это локальное изображение, создаем HD-URL
      if ((imagePath.startsWith('/uploads/') || imagePath.includes('/uploads/')) && !imagePath.includes('@')) {
    console.log(`🔧 Обрабатываем локальное изображение:`, imagePath);
    
    // Извлекаем имя файла из пути
    let filename;
    if (imagePath.startsWith('/uploads/')) {
      filename = imagePath.split('/').pop(); // Получаем имя файла
      console.log(`🔧 Извлечено имя файла (относительный путь):`, filename);
    } else {
      // Если это полный URL, извлекаем имя файла
      const urlParts = imagePath.split('/');
      const uploadsIndex = urlParts.findIndex(part => part === 'uploads');
      console.log(`🔧 URL части:`, urlParts);
      console.log(`🔧 Индекс uploads:`, uploadsIndex);
      if (uploadsIndex !== -1 && urlParts[uploadsIndex + 1]) {
        filename = urlParts[uploadsIndex + 1];
        console.log(`🔧 Извлечено имя файла (полный URL):`, filename);
      }
    }
      
      if (filename) {
        const baseFilename = filename.replace(/\.[^/.]+$/, ''); // Убираем расширение
        
        // Создаем HD-версию с полным URL
        const hdFilename = quality === '4x' ? `${baseFilename}@4x.webp` : `${baseFilename}@2x.webp`;
        const hdUrl = `${API_BASE_URL}/uploads/hd/${hdFilename}`;
        
        console.log(`🔧 Локальная HD ${quality} версия:`, hdUrl);
        console.log(`🔧 Исходный файл:`, filename);
        console.log(`🔧 Базовое имя:`, baseFilename);
        console.log(`🔧 HD имя файла:`, hdFilename);
        return hdUrl;
      }
    }
    
    // Для других изображений в локальной среде возвращаем оригинал
    console.log('✅ Локальная среда: используем оригинальное изображение');
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
          
          // Создаем HD-версию с помощью Cloudinary transformations
          const hdUrl = imagePath.replace(
            /\/upload\/([^\/]+)\//,
            `/upload/c_scale,w_${quality === '4x' ? '2400' : '1200'},h_${quality === '4x' ? '2400' : '1200'},c_limit,q_auto,f_auto/`
          );
          
          console.log(`✅ Cloudinary HD ${quality} URL created:`, hdUrl);
          return hdUrl;
        }
      } catch (error) {
        console.warn('⚠️ Failed to create Cloudinary HD URL, using original:', error.message);
      }
    }
    
    // Если это не Cloudinary, но мы в продакшене, создаем HD версию через API
    // или используем оригинал с увеличенным размером
    console.log('🔧 Продакшен: создаем HD версию через API или используем оригинал');
    
    // Попробуем создать HD версию через API endpoint
    if (imagePath.startsWith('/uploads/') || imagePath.includes('/uploads/')) {
      // В продакшене можем использовать специальный endpoint для создания HD версий
      const hdUrl = imagePath.replace(
        /\.(webp|jpg|jpeg|png)$/i,
        `@${quality}.webp`
      );
      console.log(`🔧 Продакшен HD ${quality} версия:`, hdUrl);
      
      // Также можем попробовать использовать специальный API endpoint для HD версий
      if (API_BASE_URL && !API_BASE_URL.includes('localhost')) {
        const apiHdUrl = `${API_BASE_URL}/api/images/hd/${encodeURIComponent(imagePath)}?quality=${quality}`;
        console.log(`🔧 Продакшен API HD URL:`, apiHdUrl);
        return apiHdUrl;
      }
      
      // Если API endpoint недоступен, попробуем создать HD версию локально
      // или использовать оригинал с CSS zoom
      console.log('🔧 Продакшен: используем fallback HD версию');
      return hdUrl;
      
      return hdUrl;
    }
  }
  
  // Fallback на оригинал
  console.log('✅ Using original image for HD');
  
  // В продакшене, если не удалось создать HD версию, 
  // можем попробовать увеличить оригинал через CSS transform
  if (isProduction && !imagePath.includes('@')) {
    console.log('🔧 Продакшен: используем оригинал с возможностью CSS zoom');
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