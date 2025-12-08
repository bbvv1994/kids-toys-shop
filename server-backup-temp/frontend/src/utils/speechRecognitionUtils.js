// Утилиты для голосового поиска
export const getSpeechRecognitionLanguage = (currentLanguage) => {
  // Определяем язык для распознавания речи на основе текущего языка приложения
  switch (currentLanguage) {
    case 'he':
      return 'he-IL'; // Иврит (Израиль)
    case 'ru':
      return 'ru-RU'; // Русский (Россия)
    default:
      return 'ru-RU'; // По умолчанию русский
  }
};

// Функция для получения сообщения об ошибке на соответствующем языке
export const getSpeechRecognitionErrorMessage = (currentLanguage) => {
  switch (currentLanguage) {
    case 'he':
      return 'הזיהוי הקולי אינו נתמך בדפדפן שלך';
    case 'ru':
      return 'Голосовой ввод не поддерживается в вашем браузере';
    default:
      return 'Голосовой ввод не поддерживается в вашем браузере';
  }
};

// Функция для проверки поддержки голосового поиска
export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};
