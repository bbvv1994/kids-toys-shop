// Утилиты для работы с пользователями

/**
 * Нормализует имя пользователя для правильного отображения ивритских символов
 * @param {string} name - Имя пользователя
 * @returns {string} - Нормализованное имя
 */
export const normalizeUserName = (name) => {
  if (!name || typeof name !== 'string') return name;
  
  // Проверяем на символы замены Unicode (U+FFFD) - это означает проблемы с кодировкой
  if (name.includes('\uFFFD') || name.includes('���')) {
    // Если имя содержит символы замены, возвращаем email или "Пользователь"
    return 'Пользователь';
  }
  
  // Если имя уже содержит Unicode символы (иврит, кириллица), просто возвращаем его
  if (/[\u0590-\u05FF\u0400-\u04FF]/.test(name)) {
    return name.trim();
  }
  
  let result = name;
  try {
    // Decode percent-encoded sequences if any
    if (result.includes('%')) {
      try { 
        result = decodeURIComponent(result); 
        // Если после декодирования появились Unicode символы, возвращаем
        if (/[\u0590-\u05FF\u0400-\u04FF]/.test(result)) {
          return result.trim();
        }
      } catch (_) {}
    }

    // Cleanup whitespace
    result = result.trim().replace(/\s+/g, ' ');
    return result || name;
  } catch (_) {
    return name;
  }
};

/**
 * Получает отображаемое имя пользователя (имя или email)
 * @param {Object} user - Объект пользователя
 * @returns {string} - Отображаемое имя
 */
export const getUserDisplayName = (user) => {
  if (!user) return '';
  
  const name = user.name && user.name.trim().length > 0 ? user.name : user.email;
  const normalizedName = normalizeUserName(name);
  
  // Если нормализованное имя - это "Пользователь", используем email
  if (normalizedName === 'Пользователь' && user.email) {
    return user.email;
  }
  
  return normalizedName;
};
