const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function addTranslationsToExistingProducts() {
  try {
    console.log('🔄 Добавляем переводы к существующим товарам...\n');

    // Получаем все товары
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    const products = response.data;

    console.log(`📦 Найдено товаров: ${products.length}`);

    // Фильтруем товары без переводов
    const productsWithoutTranslations = products.filter(p => !p.nameHe || !p.descriptionHe);
    
    console.log(`🔍 Товаров без переводов: ${productsWithoutTranslations.length}`);

    if (productsWithoutTranslations.length === 0) {
      console.log('✅ Все товары уже имеют переводы!');
      return;
    }

    // Добавляем переводы к первым 3 товарам (чтобы не перегружать API)
    const productsToTranslate = productsWithoutTranslations.slice(0, 3);
    
    for (let i = 0; i < productsToTranslate.length; i++) {
      const product = productsToTranslate[i];
      console.log(`\n🔄 Обрабатываем товар ${i + 1}/${productsToTranslate.length}: "${product.name}"`);
      
      try {
        // Создаем данные для обновления с переводом
        const updateData = {
          name: product.name,
          description: product.description,
          inputLanguage: 'ru' // Предполагаем, что существующие товары на русском
        };

        // Отправляем запрос на обновление
        const updateResponse = await axios.put(
          `${API_BASE_URL}/api/products/${product.id}`,
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token' // Это может не работать без реального токена
            }
          }
        );

        console.log(`✅ Товар "${product.name}" обновлен с переводами`);
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ Ошибка обновления товара "${product.name}":`, error.response?.data || error.message);
      }
    }

    console.log('\n✅ Обработка завершена!');
    console.log('💡 Теперь переключите язык на сайте и проверьте, отображаются ли переводы.');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

addTranslationsToExistingProducts();






