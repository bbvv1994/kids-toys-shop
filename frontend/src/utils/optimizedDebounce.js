// Оптимизированные debounce и throttle функции для лучшей производительности

// Debounce с requestAnimationFrame для плавности
export const rAFDebounce = (func, delay = 16) => {
  let timeoutId;
  let rafId;
  
  return function(...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    });
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  };
};

// Throttle с requestAnimationFrame
export const rAFThrottle = (func, delay = 16) => {
  let timeoutId;
  let rafId;
  let lastExecTime = 0;
  
  return function(...args) {
    const context = this;
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime >= delay) {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        func.apply(context, args);
        lastExecTime = currentTime;
      });
    }
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  };
};

// Оптимизированный setTimeout с requestAnimationFrame
export const optimizedSetTimeout = (callback, delay = 0) => {
  if (delay <= 16) {
    // Для коротких задержек используем requestAnimationFrame
    return requestAnimationFrame(callback);
  } else {
    // Для длинных задержек используем обычный setTimeout
    return setTimeout(callback, delay);
  }
};

// Оптимизированный setInterval с requestAnimationFrame
export const optimizedSetInterval = (callback, delay = 16) => {
  let rafId;
  let timeoutId;
  
  const execute = () => {
    callback();
    
    if (delay <= 16) {
      rafId = requestAnimationFrame(execute);
    } else {
      timeoutId = setTimeout(execute, delay);
    }
  };
  
  execute();
  
  return () => {
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);
  };
};

// Утилита для батчинга DOM операций
export const batchDOMOperations = (operations) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      operations.forEach(op => op());
      resolve();
    });
  });
};

// Утилита для отложенного выполнения с приоритетом
export const scheduleWithPriority = (callback, priority = 'normal') => {
  switch (priority) {
    case 'high':
      return requestAnimationFrame(callback);
    case 'normal':
      return setTimeout(callback, 0);
    case 'low':
      return setTimeout(callback, 16);
    default:
      return setTimeout(callback, 0);
  }
};
