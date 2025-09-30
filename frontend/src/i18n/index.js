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

// Функция для принудительной инициализации i18n
const initializeI18n = async () => {
  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'he',
        debug: process.env.NODE_ENV === 'development',
        
        interpolation: {
          escapeValue: false, // React уже экранирует значения
        },
        
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          // Принудительно устанавливаем язык если не определен
          lookupLocalStorage: 'i18nextLng',
          lookupSessionStorage: 'i18nextLng',
        },
        
        // Дополнительные настройки для production
        react: {
          useSuspense: false, // Отключаем Suspense для лучшей совместимости
        },
        
        // Обработка ошибок
        saveMissing: process.env.NODE_ENV === 'development',
        missingKeyHandler: (lng, ns, key, fallbackValue) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Missing translation key: ${key} for language: ${lng}`);
          }
        },
      });
    
    // Принудительно устанавливаем язык если он не определен
    if (!i18n.language || !i18n.language.match(/^(ru|he)$/)) {
      i18n.changeLanguage('he');
    }
    
    // Оптимизация: убираем console.log в продакшене для улучшения производительности
  } catch (error) {
    console.error('❌ Error initializing i18n:', error);
    // Fallback инициализация
    i18n.init({
      resources,
      fallbackLng: 'he',
      lng: 'he',
      debug: false,
      interpolation: { escapeValue: false },
    });
  }
};

// Инициализируем i18n
initializeI18n();

export default i18n; 