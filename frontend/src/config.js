// Универсальная конфигурация для автоматического определения среды
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5001',
    FRONTEND_URL: 'http://localhost:3000'
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

// Экспортируем информацию о текущей среде для отладки
export const ENV_INFO = {
  environment,
  API_BASE_URL,
  FRONTEND_URL,
  isDevelopment: environment === 'development',
  isProduction: environment === 'production'
}; 