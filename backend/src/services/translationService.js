const { PrismaClient } = require('@prisma/client');
const translate = require('translate-google');
const prisma = new PrismaClient();

class TranslationService {
  
  /**
   * Очистка диакритических знаков из иврита
   * @param {string} text - текст на иврите
   * @returns {string} - текст без диакритических знаков
   */
  static cleanHebrewText(text) {
    if (!text) return text;
    
    // Удаляем диакритические знаки (nikud) из иврита
    return text.replace(/[\u0591-\u05C7]/g, '');
  }

  /**
   * Автоматический перевод текста между языками
   * @param {string} text - текст для перевода
   * @param {string} sourceLang - исходный язык (ru, he)
   * @param {string} targetLang - целевой язык (ru, he)
   * @returns {Promise<string>} - переведенный текст
   */
  static async translateText(text, sourceLang = 'ru', targetLang = 'he') {
    try {
      if (!text || text.trim() === '') {
        return text;
      }

      const translatedText = await translate(text, { 
        from: sourceLang, 
        to: targetLang 
      });

      if (translatedText && translatedText !== text) {
        // Если переводим на иврит, очищаем диакритические знаки
        if (targetLang === 'iw') {
          return this.cleanHebrewText(translatedText);
        }
        return translatedText;
      }

      return text; // Возвращаем оригинальный текст если перевод не удался
    } catch (error) {
      console.error('Translation error:', error.message);
      return text; // Возвращаем оригинальный текст при ошибке
    }
  }

  /**
   * Автоматический перевод текста с русского на иврит
   * @param {string} text - текст для перевода
   * @returns {Promise<string>} - переведенный текст
   */
  static async translateToHebrew(text) {
    return this.translateText(text, 'ru', 'iw');
  }

  /**
   * Автоматический перевод текста с иврита на русский
   * @param {string} text - текст для перевода
   * @returns {Promise<string>} - переведенный текст
   */
  static async translateToRussian(text) {
    return this.translateText(text, 'iw', 'ru');
  }

  /**
   * Автоматический перевод названия и описания товара
   * @param {number} productId - ID товара
   * @returns {Promise<Object>} - обновленный товар с переводами
   */
  static async autoTranslateProduct(productId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, description: true, nameHe: true, descriptionHe: true }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Переводим только если переводов еще нет
      let nameHe = product.nameHe;
      let descriptionHe = product.descriptionHe;

      if (!nameHe && product.name) {
        nameHe = await this.translateToHebrew(product.name);
        console.log(`Translated name: ${product.name} -> ${nameHe}`);
      }

      if (!descriptionHe && product.description) {
        descriptionHe = await this.translateToHebrew(product.description);
        console.log(`Translated description: ${product.description} -> ${descriptionHe}`);
      }

      // Обновляем товар с переводами
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          nameHe: nameHe || null,
          descriptionHe: descriptionHe || null
        }
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error auto-translating product:', error);
      throw error;
    }
  }

  /**
   * Получить переведенное название товара
   * @param {number} productId - ID товара
   * @param {string} language - язык (he, ru)
   * @returns {string} - переведенное название
   */
  static async getProductName(productId, language = 'ru') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, nameHe: true }
      });

      if (!product) return null;

      if (language === 'he' && product.nameHe) {
        return product.nameHe;
      }

      return product.name; // По умолчанию русское название
    } catch (error) {
      console.error('Error getting product name translation:', error);
      return null;
    }
  }

  /**
   * Получить переведенное описание товара
   * @param {number} productId - ID товара
   * @param {string} language - язык (he, ru)
   * @returns {string} - переведенное описание
   */
  static async getProductDescription(productId, language = 'ru') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { description: true, descriptionHe: true }
      });

      if (!product) return null;

      if (language === 'he' && product.descriptionHe) {
        return product.descriptionHe;
      }

      return product.description; // По умолчанию русское описание
    } catch (error) {
      console.error('Error getting product description translation:', error);
      return null;
    }
  }

  /**
   * Обновить переводы товара вручную
   * @param {number} productId - ID товара
   * @param {string} nameHe - название на иврите
   * @param {string} descriptionHe - описание на иврите
   * @returns {Object} - обновленный товар
   */
  static async updateProductTranslations(productId, nameHe, descriptionHe) {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          nameHe: nameHe || null,
          descriptionHe: descriptionHe || null
        }
      });

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product translations:', error);
      throw error;
    }
  }

  /**
   * Получить все товары с переводами для указанного языка
   * @param {string} language - язык (he, ru)
   * @returns {Array} - массив товаров с переводами
   */
  static async getAllProductsWithTranslations(language = 'ru') {
    try {
      const products = await prisma.product.findMany({
        where: { isHidden: false },
        select: {
          id: true,
          name: true,
          nameHe: true,
          description: true,
          descriptionHe: true,
          price: true,
          imageUrls: true,
          quantity: true,
          categoryName: true,
          categoryId: true,
          subcategoryId: true
        }
      });

      return products.map(product => ({
        ...product,
        displayName: language === 'he' && product.nameHe ? product.nameHe : product.name,
        displayDescription: language === 'he' && product.descriptionHe ? product.descriptionHe : product.description
      }));
    } catch (error) {
      console.error('Error getting products with translations:', error);
      return [];
    }
  }

  /**
   * Автоматический перевод всех товаров без переводов
   * @returns {Promise<number>} - количество переведенных товаров
   */
  static async translateAllProducts() {
    try {
      const productsWithoutTranslations = await prisma.product.findMany({
        where: {
          OR: [
            { nameHe: null },
            { descriptionHe: null }
          ],
          isHidden: false
        },
        select: { id: true, name: true, description: true }
      });

      let translatedCount = 0;

      for (const product of productsWithoutTranslations) {
        try {
          await this.autoTranslateProduct(product.id);
          translatedCount++;
          
          // Небольшая задержка чтобы не перегружать API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error translating product ${product.id}:`, error);
        }
      }

      return translatedCount;
    } catch (error) {
      console.error('Error translating all products:', error);
      throw error;
    }
  }

  /**
   * Автоматический перевод при создании/редактировании товара
   * @param {Object} productData - данные товара
   * @param {string} inputLanguage - язык ввода (ru, iw)
   * @returns {Promise<Object>} - данные товара с переводами
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
        
        // Дополнительная очистка диакритических знаков для иврита
        if (targetLanguage === 'iw') {
          translatedName = this.cleanHebrewText(translatedName);
        }
        
        if (inputLanguage === 'ru') {
          result.nameHe = translatedName;
        } else {
          result.name = translatedName;
        }
        
        console.log(`Auto-translated name: ${name} (${inputLanguage}) -> ${translatedName} (${targetLanguage})`);
      }

      // Переводим описание
      if (description && description.trim()) {
        let translatedDescription = await this.translateText(description, inputLanguage, targetLanguage);
        
        // Дополнительная очистка диакритических знаков для иврита
        if (targetLanguage === 'iw') {
          translatedDescription = this.cleanHebrewText(translatedDescription);
        }
        
        if (inputLanguage === 'ru') {
          result.descriptionHe = translatedDescription;
        } else {
          result.description = translatedDescription;
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

module.exports = TranslationService;
