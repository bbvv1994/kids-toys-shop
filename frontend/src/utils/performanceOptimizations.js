// Утилиты для оптимизации производительности

// Дебаунс функция для оптимизации обработчиков событий
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Троттлинг функция для ограничения частоты вызовов
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Оптимизированный setTimeout с requestAnimationFrame
export const optimizedSetTimeout = (callback, delay) => {
  const frameId = requestAnimationFrame(() => {
    setTimeout(callback, delay);
  });
  return () => cancelAnimationFrame(frameId);
};

// Ленивая загрузка изображений
export const lazyLoadImage = (img, src) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = src;
          image.classList.remove('lazy');
          imageObserver.unobserve(image);
        }
      });
    });
    
    imageObserver.observe(img);
    return () => imageObserver.disconnect();
  } else {
    // Fallback для старых браузеров
    img.src = src;
  }
};

// Предзагрузка критических ресурсов
export const preloadCriticalResources = () => {
  const criticalImages = [
    '/banners/glav.webp',
    '/banners/sale1.webp',
    '/banners/malysham.webp',
    '/banners/plyazhniy.webp'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Оптимизация для LCP (Largest Contentful Paint)
export const optimizeLCP = () => {
  // Предзагружаем критические изображения
  preloadCriticalResources();
  
  // Оптимизируем загрузку шрифтов
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/Roboto-Regular.woff2';
  document.head.appendChild(fontLink);
  
  // Добавляем критические CSS inline для быстрого рендеринга
  const criticalCSS = `
    .MuiBox-root {
      will-change: transform;
      transform: translateZ(0);
    }
    .banner-container {
      contain: layout style paint;
    }
    .product-card {
      contain: layout style paint;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};

// Оптимизация для CLS (Cumulative Layout Shift)
export const preventLayoutShift = () => {
  // Устанавливаем размеры для изображений заранее
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.style.aspectRatio && img.naturalWidth && img.naturalHeight) {
      img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
    }
  });
};

// Оптимизация для FID (First Input Delay)
export const optimizeFID = () => {
  // Разбиваем длинные задачи на более мелкие
  const breakLongTask = (task) => {
    return new Promise(resolve => {
      const start = performance.now();
      const result = task();
      
      if (performance.now() - start > 50) {
        // Если задача заняла больше 50ms, разбиваем её
        setTimeout(() => resolve(result), 0);
      } else {
        resolve(result);
      }
    });
  };
  
  return breakLongTask;
};

// Мониторинг производительности
export const performanceMonitor = {
  // Измерение времени выполнения функции
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return result;
  },
  
  // Измерение времени выполнения асинхронной функции
  measureAsync: async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return result;
  },
  
  // Получение метрик Web Vitals
  getWebVitals: () => {
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }
};

// Инициализация всех оптимизаций
export const initPerformanceOptimizations = () => {
  // Оптимизируем LCP
  optimizeLCP();
  
  // Предотвращаем layout shift
  preventLayoutShift();
  
  // Мониторим производительность в development
  if (process.env.NODE_ENV !== 'production') {
    performanceMonitor.getWebVitals();
  }
};

export default {
  debounce,
  throttle,
  optimizedSetTimeout,
  lazyLoadImage,
  preloadCriticalResources,
  optimizeLCP,
  preventLayoutShift,
  optimizeFID,
  performanceMonitor,
  initPerformanceOptimizations
};
