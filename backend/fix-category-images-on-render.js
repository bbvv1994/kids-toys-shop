const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Маппинг категорий на правильные fallback изображения
const categoryImageMapping = {
  'Настольные игры': 'nastolka.png',
  'Рисование': 'creativity.png',
  'Наборы для творчества': 'creativity.png',
  'Раскраски': 'creativity.png',
  'Куклы': 'toys.png',
  'Мягкие игрушки': 'toys.png',
  'Активные игры': 'sport.png',
  'Декоративная косметика и украшения': 'toys.png',
  'Роботы и трансформеры': 'toys.png',
  'Игрушки на радиоуправлении': 'toys.png'
};

async function fixCategoryImagesOnRender() {
  try {
    console.log('🔧 Исправляем изображения категорий на Render...');

    // Получаем все категории
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    console.log(`📋 Найдено ${categories.length} категорий`);

    let updatedCount = 0;

    // Проверяем каждую категорию
    for (const category of categories) {
      let needsUpdate = false;
      let newImage = category.image;

      // Если изображение начинается с цифр (загруженный файл), заменяем на fallback
      if (category.image && /^\d+/.test(category.image)) {
        console.log(`❌ Загруженный файл не найден: ${category.image} для категории "${category.name}"`);
        needsUpdate = true;
        newImage = categoryImageMapping[category.name] || 'toys.png';
      }

      // Если изображение не соответствует маппингу, исправляем
      if (categoryImageMapping[category.name] && category.image !== categoryImageMapping[category.name]) {
        console.log(`🔄 Исправляем изображение для "${category.name}": ${category.image} -> ${categoryImageMapping[category.name]}`);
        needsUpdate = true;
        newImage = categoryImageMapping[category.name];
      }

      // Обновляем категорию если нужно
      if (needsUpdate) {
        await prisma.category.update({
          where: { id: category.id },
          data: { image: newImage }
        });
        console.log(`✅ Обновлена категория "${category.name}": ${newImage}`);
        updatedCount++;
      }
    }

    console.log(`🎉 Исправлено ${updatedCount} категорий!`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategoryImagesOnRender(); 