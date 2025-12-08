import i18n from '../i18n';

// Функция для получения переведенного названия товара
export const getTranslatedName = (product, languageOverride = null) => {
  if (!product) return '';
  
  try {
    const currentLanguage = languageOverride || i18n.language || 'ru';
    
    // Если язык иврит и есть ивритское название, используем его
    if (currentLanguage === 'he' && product.nameHe && product.nameHe.trim()) {
      return product.nameHe.trim();
    }
    
    // В остальных случаях используем русское название
    return (product.name || '').trim();
  } catch (error) {
    console.error('Error in getTranslatedName:', error);
    return product?.name || '';
  }
};

// Функция для получения переведенного описания товара
export const getTranslatedDescription = (product) => {
  if (!product) return '';
  
  try {
    const currentLanguage = i18n.language || 'ru';
    
    // Если язык иврит и есть ивритское описание, используем его
    if (currentLanguage === 'he' && product.descriptionHe && product.descriptionHe.trim()) {
      return product.descriptionHe.trim();
    }
    
    // В остальных случаях используем русское описание
    return (product.description || '').trim();
  } catch (error) {
    console.error('Error in getTranslatedDescription:', error);
    return product?.description || '';
  }
};

// Функция для поиска по названиям на обоих языках
export const searchInProductNames = (product, searchQuery) => {
  if (!product || !searchQuery) return false;
  
  try {
    const query = searchQuery.toLowerCase().trim();
    const nameRu = (product.name || '').toLowerCase().trim();
    const nameHe = (product.nameHe || '').toLowerCase().trim();
    
    return nameRu.includes(query) || nameHe.includes(query);
  } catch (error) {
    console.error('Error in searchInProductNames:', error);
    return false;
  }
};

// Функция для получения основного названия (для отображения в списках)
export const getDisplayName = (product) => {
  if (!product) return '';
  
  try {
    const currentLanguage = i18n.language || 'ru';
    
    // Приоритет: ивритское название для иврита, русское для остальных
    if (currentLanguage === 'he' && product.nameHe && product.nameHe.trim()) {
      return product.nameHe.trim();
    }
    
    return (product.name || '').trim();
  } catch (error) {
    console.error('Error in getDisplayName:', error);
    return product?.name || '';
  }
};

// Функция для принудительного обновления языка
export const forceLanguageUpdate = (language) => {
  try {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
      // Сохраняем в localStorage для надежности
      localStorage.setItem('i18nextLng', language);
      console.log('✅ Language forced to:', language);
    }
  } catch (error) {
    console.error('Error forcing language update:', error);
  }
};

// Функция для проверки доступности переводов
export const checkTranslationsAvailable = () => {
  try {
    const currentLanguage = i18n.language || 'ru';
    const hasResources = i18n.hasResourceBundle(currentLanguage, 'translation');

    return hasResources;
  } catch (error) {
    console.error('Error checking translations:', error);
    return false;
  }
};
