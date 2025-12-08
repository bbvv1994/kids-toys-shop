// Оптимизатор для Lenis (скролл библиотека)

// Функция для оптимизации Lenis конфигурации
export const optimizeLenisConfig = (config = {}) => {
  return {
    ...config,
    // Оптимизированные настройки
    duration: 0.6, // Уменьшаем с 0.8 до 0.6
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Более быстрая easing функция
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 0.3, // Еще больше уменьшаем чувствительность мыши
    smoothTouch: false, // Отключаем на мобильных для лучшей производительности
    touchMultiplier: 0.8,
    infinite: false,
    // Оптимизации производительности
    autoRaf: true,
    rafPriority: 'high',
    // Отключаем некоторые функции для лучшей производительности
    syncTouch: false,
    syncTouchLerp: 0.05, // Уменьшаем lerp
    // Оптимизации для мобильных устройств
    touchInertiaMultiplier: 15, // Уменьшаем
    touchInertiaDeltaMultiplier: 0.3, // Уменьшаем
    // Настройки для лучшей производительности
    lerp: 0.15, // Увеличиваем lerp для более быстрого отклика
    wheelMultiplier: 0.3, // Еще больше уменьшаем чувствительность колеса
    // Отключаем некоторые эффекты на медленных устройствах
    ...(isSlowDevice() ? {
      smooth: false,
      autoRaf: false,
      lerp: 0.4
    } : {})
  };
};

// Функция для определения медленного устройства
const isSlowDevice = () => {
  // Проверяем производительность устройства
  const startTime = performance.now();
  let iterations = 0;
  
  while (performance.now() - startTime < 5) {
    iterations++;
  }
  
  // Если устройство медленное
  return iterations < 1000 || 
         navigator.hardwareConcurrency < 4 || 
         /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Функция для оптимизации Lenis экземпляра
export const optimizeLenisInstance = (lenis) => {
  if (!lenis) return;
  
  // Оптимизируем настройки
  lenis.options = optimizeLenisConfig(lenis.options);
  
  // Добавляем мониторинг производительности
  const originalRaf = lenis.raf;
  lenis.raf = function(time) {
    const startTime = performance.now();
    const result = originalRaf.call(this, time);
    const duration = performance.now() - startTime;
    
    // Логируем медленные операции
    if (duration > 16) { // Больше одного кадра
      console.warn(`[LenisOptimizer] Slow RAF operation took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  };
  
  // Оптимизируем обработчики событий
  const originalOn = lenis.on;
  lenis.on = function(event, callback) {
    // Добавляем debounce для scroll событий
    if (event === 'scroll') {
      let timeoutId;
      const debouncedCallback = (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), 16); // ~60fps
      };
      return originalOn.call(this, event, debouncedCallback);
    }
    
    return originalOn.call(this, event, callback);
  };
  
  console.log('[LenisOptimizer] Lenis instance optimized');
  return lenis;
};

// Функция для создания оптимизированного Lenis
export const createOptimizedLenis = (config = {}) => {
  // Проверяем, есть ли уже Lenis в глобальной области
  if (typeof window !== 'undefined' && window.Lenis) {
    const optimizedConfig = optimizeLenisConfig(config);
    const lenis = new window.Lenis(optimizedConfig);
    return Promise.resolve(optimizeLenisInstance(lenis));
  }
  
  // Динамически импортируем Lenis
  return import('lenis').then(({ Lenis }) => {
    const optimizedConfig = optimizeLenisConfig(config);
    const lenis = new Lenis(optimizedConfig);
    
    return optimizeLenisInstance(lenis);
  }).catch(error => {
    console.warn('[LenisOptimizer] Failed to load Lenis:', error);
    return null;
  });
};

// Функция для мониторинга производительности Lenis
export const monitorLenisPerformance = (lenis) => {
  if (!lenis) return;
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (entry.name.includes('lenis') || entry.name.includes('scroll')) {
        console.warn(`[LenisOptimizer] Slow operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
  
  // Мониторим FPS с оптимизацией
  let lastTime = performance.now();
  let frameCount = 0;
  let lowFpsCount = 0;
  
  const monitorFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      
      if (fps < 30) {
        lowFpsCount++;
        if (lowFpsCount >= 3) { // Только после 3 подряд низких FPS
          console.warn(`[LenisOptimizer] Low FPS detected: ${fps}. Optimizing...`);
          
          // Автоматически оптимизируем Lenis при низком FPS
          if (lenis && lenis.options) {
            lenis.options.duration = Math.min(lenis.options.duration * 1.2, 1.0);
            lenis.options.lerp = Math.min(lenis.options.lerp * 1.1, 0.2);
            console.log('[LenisOptimizer] Auto-optimized Lenis settings');
          }
          
          lowFpsCount = 0; // Сбрасываем счетчик
        }
      } else {
        lowFpsCount = 0; // Сбрасываем счетчик при нормальном FPS
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(monitorFPS);
  };
  
  monitorFPS();
  
  return observer;
};

// Функция для отключения Lenis на медленных устройствах
export const disableLenisOnSlowDevices = () => {
  if (isSlowDevice()) {
    // Добавляем CSS для отключения smooth scroll
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: auto !important;
      }
      
      * {
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('[LenisOptimizer] Lenis disabled on slow device');
    return true;
  }
  
  return false;
};

// Функция для оптимизации скролла без Lenis
export const optimizeNativeScroll = () => {
  // Оптимизируем нативный скролл
  let ticking = false;
  
  const optimizedScrollHandler = (callback) => {
    return (event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback(event);
          ticking = false;
        });
        ticking = true;
      }
    };
  };
  
  // Применяем оптимизации к существующим обработчикам
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'scroll' && typeof listener === 'function') {
      const optimizedListener = optimizedScrollHandler(listener);
      return originalAddEventListener.call(this, type, optimizedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  console.log('[LenisOptimizer] Native scroll optimized');
};

// Автоматическая инициализация
export const initLenisOptimizer = () => {
  // Проверяем, нужно ли отключать Lenis
  if (disableLenisOnSlowDevices()) {
    optimizeNativeScroll();
    return Promise.resolve(null);
  }
  
  // Ждем, пока Lenis будет инициализирован в App.js
  const waitForLenis = () => {
    return new Promise((resolve) => {
      const checkLenis = () => {
        if (typeof window !== 'undefined' && window.lenis) {
          // Оптимизируем существующий Lenis
          const existingLenis = window.lenis;
          optimizeLenisInstance(existingLenis);
          monitorLenisPerformance(existingLenis);
          console.log('[LenisOptimizer] Optimized existing Lenis instance');
          resolve(existingLenis);
        } else {
          // Проверяем каждые 100ms
          setTimeout(checkLenis, 100);
        }
      };
      checkLenis();
    });
  };
  
  return waitForLenis();
};

export default {
  optimizeLenisConfig,
  optimizeLenisInstance,
  createOptimizedLenis,
  monitorLenisPerformance,
  disableLenisOnSlowDevices,
  optimizeNativeScroll,
  initLenisOptimizer
};
