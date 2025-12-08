// Оптимизатор setTimeout для устранения критически медленных handlers

// Кэш для отслеживания активных setTimeout
const activeTimeouts = new Map();
let timeoutCounter = 0;

// Оригинальный setTimeout
const originalSetTimeout = window.setTimeout;
const originalClearTimeout = window.clearTimeout;

// Оптимизированный setTimeout с мониторингом
window.setTimeout = function(callback, delay, ...args) {
  const id = ++timeoutCounter;
  
  // Для коротких задержек используем requestAnimationFrame
  if (delay <= 16) {
    const frameId = requestAnimationFrame(() => {
      try {
        callback(...args);
      } catch (error) {
        console.error('[setTimeoutOptimizer] Error in callback:', error);
      }
    });
    
    activeTimeouts.set(id, {
      type: 'raf',
      frameId,
      callback: callback.name || 'anonymous',
      delay,
      startTime: performance.now()
    });
    
    return id;
  }
  
  // Для длинных задержек используем обычный setTimeout с оптимизацией
  const timeoutId = originalSetTimeout(() => {
    const startTime = performance.now();
    try {
      callback(...args);
    } catch (error) {
      console.error('[setTimeoutOptimizer] Error in callback:', error);
    } finally {
      const duration = performance.now() - startTime;
      
      // Логируем медленные handlers
      if (duration > 100) {
        console.warn(`[setTimeoutOptimizer] Slow handler: ${callback.name || 'anonymous'} took ${duration.toFixed(2)}ms`);
        
        // Для критически медленных handlers (>500ms) предлагаем оптимизацию
        if (duration > 500) {
          console.warn(`[setTimeoutOptimizer] CRITICAL: Handler took ${duration.toFixed(2)}ms. Consider using requestIdleCallback or Web Workers.`);
        }
      }
      
      activeTimeouts.delete(id);
    }
  }, delay);
  
  activeTimeouts.set(id, {
    type: 'timeout',
    timeoutId,
    callback: callback.name || 'anonymous',
    delay,
    startTime: performance.now()
  });
  
  return id;
};

// Оптимизированный clearTimeout
window.clearTimeout = function(id) {
  const timeout = activeTimeouts.get(id);
  if (timeout) {
    if (timeout.type === 'raf') {
      cancelAnimationFrame(timeout.frameId);
    } else {
      originalClearTimeout(timeout.timeoutId);
    }
    activeTimeouts.delete(id);
  }
};

// Утилита для принудительной очистки всех активных timeout
export const clearAllTimeouts = () => {
  for (const [id, timeout] of activeTimeouts) {
    if (timeout.type === 'raf') {
      cancelAnimationFrame(timeout.frameId);
    } else {
      originalClearTimeout(timeout.timeoutId);
    }
  }
  activeTimeouts.clear();
};

// Утилита для получения статистики активных timeout
export const getTimeoutStats = () => {
  const stats = {
    total: activeTimeouts.size,
    raf: 0,
    timeout: 0,
    details: []
  };
  
  for (const [id, timeout] of activeTimeouts) {
    stats[timeout.type]++;
    stats.details.push({
      id,
      type: timeout.type,
      callback: timeout.callback,
      delay: timeout.delay,
      duration: performance.now() - timeout.startTime
    });
  }
  
  return stats;
};

// Утилита для оптимизации критически медленных операций
export const optimizeSlowOperation = (operation, maxDuration = 50) => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    // Выполняем операцию в requestIdleCallback если доступно
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        try {
          const result = operation();
          const duration = performance.now() - startTime;
          
          if (duration > maxDuration) {
            console.warn(`[setTimeoutOptimizer] Slow operation took ${duration.toFixed(2)}ms`);
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    } else {
      // Fallback на requestAnimationFrame
      requestAnimationFrame(() => {
        try {
          const result = operation();
          const duration = performance.now() - startTime;
          
          if (duration > maxDuration) {
            console.warn(`[setTimeoutOptimizer] Slow operation took ${duration.toFixed(2)}ms`);
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }
  });
};

// Утилита для батчинга операций
export const batchOperations = (operations, batchSize = 5) => {
  return new Promise((resolve) => {
    const results = [];
    let currentIndex = 0;
    
    const processBatch = () => {
      const batch = operations.slice(currentIndex, currentIndex + batchSize);
      
      for (const operation of batch) {
        try {
          results.push(operation());
        } catch (error) {
          console.error('[setTimeoutOptimizer] Error in batch operation:', error);
          results.push(null);
        }
      }
      
      currentIndex += batchSize;
      
      if (currentIndex < operations.length) {
        // Продолжаем в следующем кадре
        requestAnimationFrame(processBatch);
      } else {
        resolve(results);
      }
    };
    
    requestAnimationFrame(processBatch);
  });
};

export default {
  clearAllTimeouts,
  getTimeoutStats,
  optimizeSlowOperation,
  batchOperations
};