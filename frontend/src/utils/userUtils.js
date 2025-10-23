// Утилиты для работы с пользователями

/**
 * Нормализует имя пользователя для правильного отображения ивритских символов
 * @param {string} name - Имя пользователя
 * @returns {string} - Нормализованное имя
 */
export const normalizeUserName = (name) => {
  console.log('=== userUtils normalizeUserName ===');
  console.log('input name:', name);
  console.log('input name (bytes):', name ? new TextEncoder().encode(name).toString('hex') : 'null');
  
  if (!name || typeof name !== 'string') return name;
  
  // Проверяем на символы замены Unicode (U+FFFD) - это означает проблемы с кодировкой
  if (name.includes('\uFFFD') || name.includes('���')) {
    console.log('Found replacement characters, returning "Пользователь"');
    return 'Пользователь';
  }
  
  // Если имя уже содержит Unicode символы (иврит, кириллица), просто возвращаем его
  if (/[\u0590-\u05FF\u0400-\u04FF]/.test(name)) {
    console.log('Found Unicode characters, returning trimmed name:', name.trim());
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
          console.log('After decodeURIComponent, found Unicode, returning:', result.trim());
          return result.trim();
        }
      } catch (_) {}
    }

    // Cleanup whitespace
    result = result.trim().replace(/\s+/g, ' ');
    console.log('Final result:', result);
    return result || name;
  } catch (_) {
    console.log('Error in normalizeUserName, returning original name:', name);
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
