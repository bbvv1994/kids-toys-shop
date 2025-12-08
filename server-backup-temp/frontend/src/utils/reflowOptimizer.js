// Оптимизатор для Forced Reflow

// Функция для мониторинга Forced Reflow
export const monitorForcedReflow = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (entry.name.includes('reflow') || entry.name.includes('layout')) {
        console.warn(`[ReflowOptimizer] Forced reflow detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['measure', 'navigation'] });
  
  return observer;
};

// Функция для оптимизации DOM операций
export const optimizeDOMOperations = () => {
  // Патчим методы, которые могут вызывать forced reflow
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function(element, pseudoElt) {
    // Кэшируем результаты для часто используемых элементов
    if (!element._computedStyleCache) {
      element._computedStyleCache = new Map();
    }
    
    const cacheKey = pseudoElt || 'default';
    if (element._computedStyleCache.has(cacheKey)) {
      return element._computedStyleCache.get(cacheKey);
    }
    
    const result = originalGetComputedStyle.call(this, element, pseudoElt);
    element._computedStyleCache.set(cacheKey, result);
    
    // Очищаем кэш через 1 секунду
    setTimeout(() => {
      if (element._computedStyleCache) {
        element._computedStyleCache.delete(cacheKey);
      }
    }, 1000);
    
    return result;
  };
  
  // Патчим offsetWidth, offsetHeight и другие свойства
  const reflowProperties = ['offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft', 'scrollWidth', 'scrollHeight'];
  
  reflowProperties.forEach(prop => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
    if (originalDescriptor) {
      Object.defineProperty(HTMLElement.prototype, prop, {
        get: function() {
          // Кэшируем результат
          if (!this._reflowCache) {
            this._reflowCache = new Map();
          }
          
          if (this._reflowCache.has(prop)) {
            return this._reflowCache.get(prop);
          }
          
          const result = originalDescriptor.get.call(this);
          this._reflowCache.set(prop, result);
          
          // Очищаем кэш через 100ms
          setTimeout(() => {
            if (this._reflowCache) {
              this._reflowCache.delete(prop);
            }
          }, 100);
          
          return result;
        },
        configurable: true
      });
    }
  });
  
  console.log('[ReflowOptimizer] DOM operations optimized');
};

// Функция для батчинга DOM операций
export const batchDOMOperations = (operations) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      operations.forEach(operation => {
        try {
          operation();
        } catch (error) {
          console.error('[ReflowOptimizer] Error in DOM operation:', error);
        }
      });
      
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
};

// Функция для оптимизации стилей
export const optimizeStyleOperations = () => {
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
    // Батчим изменения стилей
    if (!this._styleBatch) {
      this._styleBatch = [];
      requestAnimationFrame(() => {
        this._styleBatch.forEach(({ prop, val, prio }) => {
          originalSetProperty.call(this, prop, val, prio);
        });
        this._styleBatch = null;
      });
    }
    
    this._styleBatch.push({ prop: property, val: value, prio: priority });
  };
  
  console.log('[ReflowOptimizer] Style operations optimized');
};

// Инициализация оптимизатора
export const initReflowOptimizer = () => {
  // Включаем только если явно задан флаг (во избежание регрессий)
  if (!window.__ENABLE_REFLOW_OPTIMIZER__) {
    console.warn('[ReflowOptimizer] Disabled (set window.__ENABLE_REFLOW_OPTIMIZER__ = true to enable)');
    return { cleanup: () => {} };
  }
  // Мониторим forced reflow
  const observer = monitorForcedReflow();
  
  // Оптимизируем DOM операции
  optimizeDOMOperations();
  
  // Оптимизируем операции со стилями
  optimizeStyleOperations();
  
  console.log('[ReflowOptimizer] Initialized');
  
  return {
    cleanup: () => {
      observer.disconnect();
    }
  };
};
