import React from 'react';

// Система мониторинга производительности для выявления проблем
class PerformanceLogger {
  constructor() {
    this.logs = [];
    this.isEnabled = process.env.NODE_ENV !== 'production';
    this.startTime = performance.now();
  }

  // Логирование setTimeout
  logSetTimeout(delay, callback, stack) {
    if (!this.isEnabled) return;
    
    const log = {
      type: 'setTimeout',
      delay,
      timestamp: performance.now() - this.startTime,
      stack: stack || new Error().stack,
      callback: callback?.name || 'anonymous'
    };
    
    this.logs.push(log);
    console.warn(`[PERF] setTimeout: ${delay}ms, callback: ${log.callback}`, log);
  }

  // Логирование message handlers
  logMessageHandler(source, data, stack) {
    if (!this.isEnabled) return;
    
    const log = {
      type: 'message',
      source,
      dataSize: JSON.stringify(data).length,
      timestamp: performance.now() - this.startTime,
      stack: stack || new Error().stack
    };
    
    this.logs.push(log);
    console.warn(`[PERF] Message handler: ${source}, data size: ${log.dataSize}`, log);
  }

  // Логирование forced reflow
  logForcedReflow(element, operation, stack) {
    if (!this.isEnabled) return;
    
    const log = {
      type: 'reflow',
      element: element?.tagName || 'unknown',
      operation,
      timestamp: performance.now() - this.startTime,
      stack: stack || new Error().stack
    };
    
    this.logs.push(log);
    console.warn(`[PERF] Forced reflow: ${element?.tagName} - ${operation}`, log);
  }

  // Логирование навигации
  logNavigation(from, to, duration) {
    if (!this.isEnabled) return;
    
    const log = {
      type: 'navigation',
      from,
      to,
      duration,
      timestamp: performance.now() - this.startTime
    };
    
    this.logs.push(log);
    console.warn(`[PERF] Navigation: ${from} -> ${to} (${duration}ms)`, log);
  }

  // Логирование рендеринга компонентов
  logComponentRender(componentName, renderTime, props) {
    if (!this.isEnabled) return;
    
    const log = {
      type: 'render',
      component: componentName,
      renderTime,
      propsCount: Object.keys(props || {}).length,
      timestamp: performance.now() - this.startTime
    };
    
    this.logs.push(log);
    if (renderTime > 16) { // Больше одного кадра
      console.warn(`[PERF] Slow render: ${componentName} (${renderTime}ms)`, log);
    }
  }

  // Получить все логи
  getLogs() {
    return this.logs;
  }

  // Получить статистику
  getStats() {
    const stats = {
      total: this.logs.length,
      setTimeout: this.logs.filter(l => l.type === 'setTimeout').length,
      message: this.logs.filter(l => l.type === 'message').length,
      reflow: this.logs.filter(l => l.type === 'reflow').length,
      navigation: this.logs.filter(l => l.type === 'navigation').length,
      render: this.logs.filter(l => l.type === 'render').length
    };
    
    console.log('[PERF] Performance Stats:', stats);
    return stats;
  }

  // Очистить логи
  clear() {
    this.logs = [];
    this.startTime = performance.now();
  }
}

// Создаем глобальный экземпляр
const performanceLogger = new PerformanceLogger();

// Перехватываем setTimeout
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay, ...args) {
  performanceLogger.logSetTimeout(delay, callback);
  return originalSetTimeout.call(this, callback, delay, ...args);
};

// Перехватываем message events с debounce
let messageHandlerTimeout;
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type === 'message') {
    const wrappedListener = function(event) {
      // Debounce message handlers для предотвращения спама
      clearTimeout(messageHandlerTimeout);
      messageHandlerTimeout = setTimeout(() => {
        performanceLogger.logMessageHandler(event.origin || 'unknown', event.data);
      }, 16); // ~60fps
      return listener.call(this, event);
    };
    return originalAddEventListener.call(this, type, wrappedListener, options);
  }
  return originalAddEventListener.call(this, type, listener, options);
};

// Мониторинг forced reflow с throttling
let reflowObserver;
let reflowTimeout;
if (window.MutationObserver) {
  reflowObserver = new MutationObserver((mutations) => {
    // Throttle reflow detection для предотвращения спама
    clearTimeout(reflowTimeout);
    reflowTimeout = setTimeout(() => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          performanceLogger.logForcedReflow(
            mutation.target, 
            `attribute change: ${mutation.attributeName}`
          );
        }
      });
    }, 16); // ~60fps
  });
}

// Экспортируем для использования в компонентах
export default performanceLogger;

// Хук для мониторинга рендеринга компонентов
export const usePerformanceMonitor = (componentName, props = {}) => {
  const startTime = performance.now();
  
  React.useEffect(() => {
    const renderTime = performance.now() - startTime;
    performanceLogger.logComponentRender(componentName, renderTime, props);
  });
};

// Утилита для мониторинга навигации
export const monitorNavigation = (from, to) => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    performanceLogger.logNavigation(from, to, duration);
  };
};
