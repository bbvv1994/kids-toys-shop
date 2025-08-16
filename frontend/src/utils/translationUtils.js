import i18n from '../i18n';

// Функция для получения переведенного названия товара
export const getTranslatedName = (product, languageOverride = null) => {
  if (!product) return '';
  
  const currentLanguage = languageOverride || i18n.language;
  
  // Если язык иврит и есть ивритское название, используем его
  if (currentLanguage === 'he' && product.nameHe) {
    return product.nameHe;
  }
  
  // В остальных случаях используем русское название
  return product.name || '';
};

// Функция для получения переведенного описания товара
export const getTranslatedDescription = (product) => {
  if (!product) return '';
  
  const currentLanguage = i18n.language;
  
  // Если язык иврит и есть ивритское описание, используем его
  if (currentLanguage === 'he' && product.descriptionHe) {
    return product.descriptionHe;
  }
  
  // В остальных случаях используем русское описание
  return product.description || '';
};

// Функция для поиска по названиям на обоих языках
export const searchInProductNames = (product, searchQuery) => {
  if (!product || !searchQuery) return false;
  
  const query = searchQuery.toLowerCase();
  const nameRu = (product.name || '').toLowerCase();
  const nameHe = (product.nameHe || '').toLowerCase();
  
  return nameRu.includes(query) || nameHe.includes(query);
};

// Функция для получения основного названия (для отображения в списках)
export const getDisplayName = (product) => {
  if (!product) return '';
  
  const currentLanguage = i18n.language;
  
  // Приоритет: ивритское название для иврита, русское для остальных
  if (currentLanguage === 'he' && product.nameHe) {
    return product.nameHe;
  }
  
  return product.name || '';
};
