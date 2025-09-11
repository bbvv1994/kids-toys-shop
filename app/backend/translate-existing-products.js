const { PrismaClient } = require('@prisma/client');
const TranslationService = require('./src/services/translationService');

const prisma = new PrismaClient();

async function translateExistingProducts() {
  console.log('🚀 Начинаем массовый перевод существующих товаров...');
  
  try {
    // Получаем все товары без переводов
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { nameHe: null },
          { descriptionHe: null }
        ],
        isHidden: false
      },
      select: {
        id: true,
        name: true,
        description: true,
        nameHe: true,
        descriptionHe: true
      }
    });

    console.log(`📊 Найдено ${products.length} товаров для перевода`);

    let translatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        console.log(`\n🔄 Обрабатываем товар ID ${product.id}: "${product.name}"`);
        
        let nameHe = product.nameHe;
        let descriptionHe = product.descriptionHe;

        // Переводим название если его нет
        if (!nameHe && product.name) {
          console.log(`🌐 Переводим название: "${product.name}"`);
          nameHe = await TranslationService.translateText(product.name, 'ru', 'iw');
          console.log(`✅ Результат: "${nameHe}"`);
        }

        // Переводим описание если его нет
        if (!descriptionHe && product.description) {
          console.log(`🌐 Переводим описание: "${product.description}"`);
          descriptionHe = await TranslationService.translateText(product.description, 'ru', 'iw');
          console.log(`✅ Результат: "${descriptionHe}"`);
        }

        // Обновляем товар
        await prisma.product.update({
          where: { id: product.id },
          data: {
            nameHe: nameHe || null,
            descriptionHe: descriptionHe || null
          }
        });

        translatedCount++;
        console.log(`✅ Товар ${product.id} успешно обновлен`);

        // Задержка между переводами
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Ошибка при переводе товара ${product.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🏁 Перевод завершен!`);
    console.log(`✅ Успешно переведено: ${translatedCount} товаров`);
    console.log(`❌ Ошибок: ${errorCount} товаров`);

  } catch (error) {
    console.error('❌ Ошибка при массовом переводе:', error);
  } finally {
    await prisma.$disconnect();
  }
}

translateExistingProducts();
