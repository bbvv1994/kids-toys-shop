// Утилиты для оптимизации bundle
import React from 'react';

// Ленивая загрузка компонентов
export const lazyLoadComponent = (importFunc) => {
  return React.lazy(() => importFunc);
};

// Предзагрузка критических компонентов
export const preloadCriticalComponents = () => {
  // Предзагружаем критические компоненты
  const criticalComponents = [
    () => import('../components/HomeBanners'),
    () => import('../components/ProductCard'),
    () => import('../components/LanguageSwitcher')
  ];
  
  criticalComponents.forEach(importFunc => {
    importFunc().catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to preload component:', err);
      }
    });
  });
};

// Оптимизация изображений
export const optimizeImageLoading = () => {
  // Добавляем атрибуты для оптимизации изображений
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Добавляем loading="lazy" для изображений ниже fold
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Добавляем decoding="async" для асинхронной декодировки
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
    
    // Добавляем fetchpriority="high" для критических изображений
    if (img.src.includes('banners/glav.webp') || img.src.includes('banners/sale1.webp')) {
      img.setAttribute('fetchpriority', 'high');
    }
  });
};

// Оптимизация CSS
export const optimizeCSS = () => {
  // Критические CSS стили для быстрого рендеринга
  const criticalCSS = `
    /* Критические стили для LCP */
    .MuiBox-root {
      will-change: transform;
      transform: translateZ(0);
      contain: layout style paint;
    }
    
    .banner-container {
      contain: layout style paint;
      will-change: transform;
    }
    
    .product-card {
      contain: layout style paint;
    }
    
    /* Оптимизация для изображений */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Оптимизация для анимаций */
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Оптимизация для скролла */
    .smooth-scroll {
      scroll-behavior: smooth;
    }
    
    /* Оптимизация для touch устройств */
    .touch-optimized {
      touch-action: manipulation;
    }
  `;
  
  // Создаем стиль и добавляем в head
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

// Оптимизация JavaScript
export const optimizeJavaScript = () => {
  // Отключаем ненужные функции в продакшене
  if (process.env.NODE_ENV === 'production') {
    // Отключаем console.log в продакшене
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    
    // Отключаем debugger
    if (typeof window !== 'undefined') {
      window.debugger = () => {};
    }
  }
  
  // Оптимизируем обработчики событий
  const optimizeEventHandlers = () => {
    // Используем passive listeners для touch событий
    const touchEvents = ['touchstart', 'touchmove', 'touchend'];
    touchEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
  };
  
  optimizeEventHandlers();
};

// Оптимизация ресурсов
export const optimizeResources = () => {
  // Предзагружаем критические ресурсы
  const criticalResources = [
    { href: '/banners/glav.webp', as: 'image', type: 'image/webp' },
    { href: '/banners/sale1.webp', as: 'image', type: 'image/webp' },
    { href: '/fonts/Roboto-Regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};

// Оптимизация для мобильных устройств
export const optimizeForMobile = () => {
  // Определяем мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Оптимизируем для мобильных устройств
    document.body.classList.add('mobile-optimized');
    
    // Отключаем hover эффекты на мобильных
    const style = document.createElement('style');
    style.textContent = `
      @media (hover: none) {
        .hover-effect:hover {
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Инициализация всех оптимизаций bundle
export const initBundleOptimizations = () => {
  // Оптимизируем CSS
  optimizeCSS();
  
  // Оптимизируем JavaScript
  optimizeJavaScript();
  
  // Оптимизируем ресурсы
  optimizeResources();
  
  // Оптимизируем для мобильных
  optimizeForMobile();
  
  // Оптимизируем загрузку изображений
  optimizeImageLoading();
  
  // Предзагружаем критические компоненты
  preloadCriticalComponents();
};

export default {
  lazyLoadComponent,
  preloadCriticalComponents,
  optimizeImageLoading,
  optimizeCSS,
  optimizeJavaScript,
  optimizeResources,
  optimizeForMobile,
  initBundleOptimizations
};
