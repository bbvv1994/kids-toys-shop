import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируем переводы
import ru from './locales/ru.json';
import he from './locales/he.json';

const resources = {
  ru: {
    translation: ru
  },
  he: {
    translation: he
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React уже экранирует значения
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n; 