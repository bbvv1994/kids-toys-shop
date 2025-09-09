import React from 'react';

// Система мониторинга производительности для выявления проблем
class PerformanceLogger {
  constructor() {
    this.logs = [];
    this.isEnabled = true; // Временно включено для диагностики на сервере
    this.startTime = performance.now();
  }

  // Извлекаем внешний кадр из stacktrace для определения источника
  getCallerFromStack(stack) {
    if (!stack) return '';
    const lines = String(stack).split('\n').map(l => l.trim());
    // Пропускаем внутренние фреймы и dev-инфраструктуру (без учета регистра)
    const ignore = [
      'performancelogger',
      'settimeoutoptimizer',
      'reflowoptimizer',
      'rippleoptimizer',
      'lenisoptimizer',
      'react-dom',
      'scheduler',
      'react refresh',
      'webpack',
      'bootstrap',
      'node_modules',
      'eval at'
    ];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      const isIgnored = ignore.some(key => lower.includes(key));
      const hasFileRef = line.includes('.js:') || line.includes('.ts:');
      if (!isIgnored && hasFileRef) {
        return line;
      }
    }
    return lines[1] || '';
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
    log.caller = this.getCallerFromStack(log.stack);
    
    this.logs.push(log);
    console.warn(`[PERF] setTimeout: ${delay}ms, callback: ${log.callback}${log.caller ? ` @ ${log.caller}` : ''}`, log);
  }

  // Логирование выполнения callback setTimeout (фактическое время работы колбэка)
  logSetTimeoutExecution(duration, delay, callback, stack) {
    if (!this.isEnabled) return;
    const log = {
      type: 'setTimeout_exec',
      duration,
      scheduledDelay: delay,
      timestamp: performance.now() - this.startTime,
      stack: stack || new Error().stack,
      callback: callback?.name || 'anonymous'
    };
    log.caller = this.getCallerFromStack(log.stack);
    this.logs.push(log);
    if (duration > 50) {
      console.warn(`[PERF] setTimeout exec: ${log.callback} took ${duration.toFixed(1)}ms (scheduled ${delay}ms)${log.caller ? ` @ ${log.caller}` : ''}`, log);
    }
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

// Перехватываем setTimeout: логируем планируемую задержку И измеряем РЕАЛЬНОЕ время выполнения callback
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay, ...args) {
  // Логируем сам факт планирования таймера (как раньше)
  try {
    performanceLogger.logSetTimeout(delay, callback);
  } catch (_) {}

  const wrapped = function(...cbArgs) {
    const start = performance.now();
    try {
      return callback.apply(this, cbArgs);
    } finally {
      const duration = performance.now() - start;
      if (duration > 50) {
        performanceLogger.logSetTimeoutExecution(duration, delay, callback);
      }
    }
  };
  return originalSetTimeout.call(this, wrapped, delay, ...args);
};

// Перехватываем message events с более агрессивным debounce
let messageHandlerTimeout;
let messageHandlerQueue = [];
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type === 'message') {
    const wrappedListener = function(event) {
      // Добавляем в очередь вместо немедленного выполнения
      messageHandlerQueue.push({ listener, event, context: this });
      
      clearTimeout(messageHandlerTimeout);
      messageHandlerTimeout = setTimeout(() => {
        // Обрабатываем все сообщения в очереди батчами
        const batchSize = Math.min(3, messageHandlerQueue.length);
        const batch = messageHandlerQueue.splice(0, batchSize);
        
        batch.forEach(({ listener, event, context }) => {
          const startTime = performance.now();
          try {
            listener.call(context, event);
          } catch (error) {
            console.error('[PerformanceLogger] Error in message handler:', error);
          } finally {
            const duration = performance.now() - startTime;
            if (duration > 50) {
              performanceLogger.logMessageHandler(duration, listener.name || 'anonymous');
            }
          }
        });
        
        // Если есть еще сообщения в очереди, обрабатываем их в следующем кадре
        if (messageHandlerQueue.length > 0) {
          requestAnimationFrame(() => {
            const nextBatch = messageHandlerQueue.splice(0, 3);
            nextBatch.forEach(({ listener, event, context }) => {
              const startTime = performance.now();
              try {
                listener.call(context, event);
              } catch (error) {
                console.error('[PerformanceLogger] Error in message handler:', error);
              } finally {
                const duration = performance.now() - startTime;
                if (duration > 50) {
                  performanceLogger.logMessageHandler(duration, listener.name || 'anonymous');
                }
              }
            });
          });
        }
      }, 100); // Вернули debounce к 100ms, чтобы не накапливать очереди
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
