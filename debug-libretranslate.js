const axios = require('axios');

async function debugLibreTranslate() {
  try {
    console.log('🔍 Отладка LibreTranslate API...\n');

    const testData = {
      q: 'Привет мир',
      source: 'ru',
      target: 'he',
      format: 'text'
    };

    console.log('📤 Отправляем данные:', testData);

    const response = await axios.post('https://libretranslate.de/translate', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('📥 Полный ответ:', response.data);
    console.log('📥 Статус:', response.status);
    console.log('📥 Заголовки:', response.headers);

    if (response.data && response.data.translatedText) {
      console.log('✅ Перевод получен:', response.data.translatedText);
    } else {
      console.log('❌ Перевод не получен');
      console.log('📥 Структура ответа:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('📥 Ответ сервера:', error.response.data);
      console.error('📥 Статус:', error.response.status);
    }
  }
}

debugLibreTranslate();



