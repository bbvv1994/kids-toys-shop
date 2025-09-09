// Оптимизатор для Material-UI Ripple эффектов

// CSS оптимизации для Ripple
const rippleOptimizations = `
/* Оптимизации для Material-UI Ripple */
.MuiTouchRipple-root {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.MuiTouchRipple-ripple {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: layout style paint;
}

.MuiTouchRipple-rippleVisible {
  animation-duration: 0.1s !important; /* Уменьшаем с 0.55s до 0.1s */
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Дополнительные оптимизации для Ripple */
.MuiTouchRipple-ripplePulsate {
  animation-duration: 0.1s !important;
}

.MuiTouchRipple-child {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Оптимизации для кнопок */
.MuiButton-root {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.MuiButton-root:active {
  transform: translateZ(0) scale(0.98);
  transition: transform 0.1s ease;
}

/* Оптимизации для IconButton */
.MuiIconButton-root {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.MuiIconButton-root:active {
  transform: translateZ(0) scale(0.9);
  transition: transform 0.1s ease;
}

/* Оптимизации для Fab */
.MuiFab-root {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.MuiFab-root:active {
  transform: translateZ(0) scale(0.95);
  transition: transform 0.1s ease;
}

/* Отключаем анимации для пользователей с prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .MuiTouchRipple-root,
  .MuiTouchRipple-ripple,
  .MuiButton-root,
  .MuiIconButton-root,
  .MuiFab-root {
    animation: none !important;
    transition: none !important;
  }
}
`;

// Функция для применения оптимизаций
export const applyRippleOptimizations = () => {
  // Проверяем, не применены ли уже оптимизации
  if (document.getElementById('ripple-optimizations')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'ripple-optimizations';
  style.textContent = rippleOptimizations;
  document.head.appendChild(style);
  
  console.log('[RippleOptimizer] Optimizations applied');
};

// Функция для оптимизации конкретных элементов
export const optimizeElement = (element) => {
  if (!element) return;
  
  // Добавляем CSS классы для оптимизации
  element.style.willChange = 'transform, opacity';
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  
  // Оптимизируем дочерние элементы с Ripple
  const rippleElements = element.querySelectorAll('.MuiTouchRipple-root, .MuiTouchRipple-ripple');
  rippleElements.forEach(ripple => {
    ripple.style.willChange = 'transform, opacity';
    ripple.style.transform = 'translateZ(0)';
    ripple.style.backfaceVisibility = 'hidden';
    ripple.style.contain = 'layout style paint';
  });
};

// Функция для массовой оптимизации всех кнопок
export const optimizeAllButtons = () => {
  const buttons = document.querySelectorAll('.MuiButton-root, .MuiIconButton-root, .MuiFab-root');
  buttons.forEach(optimizeElement);
  
  console.log(`[RippleOptimizer] Optimized ${buttons.length} buttons`);
};

// Функция для мониторинга производительности Ripple
export const monitorRipplePerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (entry.name.includes('ripple') || entry.name.includes('Ripple')) {
        console.warn(`[RippleOptimizer] Slow ripple operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
  
  return observer;
};

// Функция для отключения Ripple на медленных устройствах
export const disableRippleOnSlowDevices = () => {
  // Проверяем производительность устройства
  const startTime = performance.now();
  let iterations = 0;
  
  // Простой тест производительности
  while (performance.now() - startTime < 5) {
    iterations++;
  }
  
  // Если устройство медленное, отключаем Ripple
  if (iterations < 1500) {
    const style = document.createElement('style');
    style.textContent = `
      .MuiTouchRipple-root {
        display: none !important;
      }
      .MuiButton-root, .MuiIconButton-root, .MuiFab-root {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('[RippleOptimizer] Ripple disabled on slow device');
    return true;
  }
  
  return false;
};

// Автоматическое применение оптимизаций
export const initRippleOptimizer = () => {
  // Применяем CSS оптимизации
  applyRippleOptimizations();
  
  // Оптимизируем существующие кнопки
  optimizeAllButtons();
  
  // Мониторим производительность
  const observer = monitorRipplePerformance();
  
  // Оптимизируем новые кнопки при их добавлении
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const buttons = node.querySelectorAll?.('.MuiButton-root, .MuiIconButton-root, .MuiFab-root') || [];
          buttons.forEach(optimizeElement);
          
          if (node.matches?.('.MuiButton-root, .MuiIconButton-root, .MuiFab-root')) {
            optimizeElement(node);
          }
        }
      });
    });
  });
  
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('[RippleOptimizer] Initialized');
  
  return {
    observer,
    mutationObserver,
    cleanup: () => {
      observer.disconnect();
      mutationObserver.disconnect();
    }
  };
};

export default {
  applyRippleOptimizations,
  optimizeElement,
  optimizeAllButtons,
  monitorRipplePerformance,
  disableRippleOnSlowDevices,
  initRippleOptimizer
};
