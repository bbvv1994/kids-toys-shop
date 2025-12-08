import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'he';

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  // Возвращает 'rtl' для иврита, 'ltr' для других языков
  // Используйте только для текстовых элементов, НЕ для компоновки
  const getDirection = () => {
    return isRTL ? 'rtl' : 'ltr';
  };

  // Возвращает 'right' для иврита, 'left' для других языков
  // Используйте только для выравнивания текста
  const getTextAlign = () => {
    return isRTL ? 'right' : 'left';
  };

  return {
    t,
    i18n,
    isRTL,
    changeLanguage,
    getCurrentLanguage,
    getDirection,
    getTextAlign
  };
}; 