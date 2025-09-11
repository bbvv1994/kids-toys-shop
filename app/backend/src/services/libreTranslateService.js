const fetch = require('node-fetch');

class LibreTranslateService {
  // Список бесплатных LibreTranslate серверов
  static servers = [
    'https://libretranslate.de',
    'https://translate.argosopentech.com',
    'https://translate.fortytwo-it.com',
    'https://libretranslate.com',
    'https://translate.terraprint.co'
  ];

  static currentServerIndex = 0;

  /**
   * Получает доступный сервер
   */
  static async getAvailableServer() {
    for (let i = 0; i < this.servers.length; i++) {
      const serverIndex = (this.currentServerIndex + i) % this.servers.length;
      const server = this.servers[serverIndex];
      
      try {
        const response = await fetch(`${server}/languages`, {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          this.currentServerIndex = serverIndex;
          console.log(`✅ Используем LibreTranslate сервер: ${server}`);
          return server;
        }
      } catch (error) {
        console.log(`❌ Сервер ${server} недоступен: ${error.message}`);
        continue;
      }
    }
    
    throw new Error('Все LibreTranslate серверы недоступны');
  }

  /**
   * Переводит текст с использованием LibreTranslate
   */
  static async translateText(text, sourceLang = 'ru', targetLang = 'iw') {
    if (!text || text.trim() === '') {
      return text;
    }

    try {
      const server = await this.getAvailableServer();
      
      console.log(`🌐 LibreTranslate: "${text}" с ${sourceLang} на ${targetLang}`);
      
      const response = await fetch(`${server}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        }),
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`LibreTranslate error: ${data.error}`);
      }

      const translatedText = data.translatedText;
      console.log(`✅ LibreTranslate результат: "${translatedText}"`);

      // Очистка и исправление кодировки для иврита
      if (targetLang === 'iw') {
        const cleanedText = this.cleanHebrewText(translatedText);
        const fixedText = this.fixHebrewEncoding(cleanedText);
        console.log(`✅ Очищенный иврит: "${fixedText}"`);
        return fixedText;
      }

      return translatedText;

    } catch (error) {
      console.error(`❌ Ошибка LibreTranslate: ${error.message}`);
      
      // Пробуем следующий сервер
      this.currentServerIndex = (this.currentServerIndex + 1) % this.servers.length;
      
      // Если это не первая попытка, возвращаем исходный текст
      if (error.message.includes('все LibreTranslate серверы недоступны')) {
        console.log(`⚠️ Возвращаем исходный текст: "${text}"`);
        return text;
      }
      
      // Повторяем попытку с другим сервером
      return this.translateText(text, sourceLang, targetLang);
    }
  }

  /**
   * Очищает ивритский текст от лишних символов
   */
  static cleanHebrewText(text) {
    if (!text) return text;
    
    // Удаляем лишние пробелы
    let cleaned = text.trim();
    
    // Удаляем множественные пробелы
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Удаляем символы, которые не должны быть в иврите
    cleaned = cleaned.replace(/[^\u0590-\u05FF\u0020\u0027\u0022\u002D\u002E\u002C\u0030-\u0039\u0041-\u005A\u0061-\u007A]/g, '');
    
    return cleaned;
  }

  /**
   * Исправляет кодировку ивритского текста
   */
  static fixHebrewEncoding(text) {
    if (!text) return text;
    
    // Заменяем неправильные символы на правильные
    let fixed = text
      .replace(/[\u05D0-\u05EA]/g, (match) => {
        // Проверяем, что символ действительно ивритский
        const hebrewRange = /[\u0590-\u05FF]/;
        return hebrewRange.test(match) ? match : '';
      });
    
    return fixed;
  }

  /**
   * Автоматический перевод данных товара
   */
  static async autoTranslateProductData(productData, inputLanguage = 'ru') {
    try {
      const { name, description } = productData;
      const result = { ...productData };

      // Определяем целевой язык для перевода
      const targetLanguage = inputLanguage === 'ru' ? 'iw' : 'ru';

      // Переводим название
      if (name && name.trim()) {
        let translatedName = await this.translateText(name, inputLanguage, targetLanguage);
        
        if (inputLanguage === 'ru') {
          // Если входной язык русский, сохраняем перевод на иврит в nameHe
          result.nameHe = translatedName;
        } else {
          // Если входной язык иврит, сохраняем перевод на русский в name, а оригинальный иврит в nameHe
          result.name = translatedName;
          result.nameHe = name; // Сохраняем оригинальный ивритский текст
        }
        
        console.log(`Auto-translated name: ${name} (${inputLanguage}) -> ${translatedName} (${targetLanguage})`);
      }

      // Переводим описание
      if (description && description.trim()) {
        let translatedDescription = await this.translateText(description, inputLanguage, targetLanguage);
        
        if (inputLanguage === 'ru') {
          // Если входной язык русский, сохраняем перевод на иврит в descriptionHe
          result.descriptionHe = translatedDescription;
        } else {
          // Если входной язык иврит, сохраняем перевод на русский в description, а оригинальный иврит в descriptionHe
          result.description = translatedDescription;
          result.descriptionHe = description; // Сохраняем оригинальный ивритский текст
        }
        
        console.log(`Auto-translated description: ${description} (${inputLanguage}) -> ${translatedDescription} (${targetLanguage})`);
      }

      return result;
    } catch (error) {
      console.error('Error auto-translating product data:', error);
      return productData; // Возвращаем исходные данные при ошибке
    }
  }
}

module.exports = LibreTranslateService;
