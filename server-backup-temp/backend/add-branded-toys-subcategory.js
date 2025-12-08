require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSubcategory() {
  console.log('🔄 Добавление подкатегории "Брэндовые игрушки"...');
  
  // Находим родительскую категорию "Игрушки"
  const toysCategory = await prisma.category.findFirst({
    where: { 
      name: 'Игрушки',
      parentId: null 
    }
  });
  
  if (!toysCategory) {
    console.error('❌ Категория "Игрушки" не найдена!');
    return;
  }
  
  console.log(`✅ Найдена категория "Игрушки" (ID: ${toysCategory.id})`);
  
  // Проверяем, существует ли уже такая подкатегория
  const existing = await prisma.category.findFirst({
    where: {
      name: 'Брэндовые игрушки',
      parentId: toysCategory.id
    }
  });
  
  if (existing) {
    console.log('✅ Подкатегория "Брэндовые игрушки" уже существует!');
    console.log(`   ID: ${existing.id}, Active: ${existing.active}`);
    return;
  }
  
  // Получаем максимальный order среди подкатегорий
  const subcategories = await prisma.category.findMany({
    where: { parentId: toysCategory.id },
    orderBy: { order: 'desc' },
    take: 1
  });
  
  const newOrder = subcategories.length > 0 ? subcategories[0].order + 1 : 0;
  
  // Создаем новую подкатегорию
  const newSubcategory = await prisma.category.create({
    data: {
      name: 'Брэндовые игрушки',
      parentId: toysCategory.id,
      active: true,
      order: newOrder
    }
  });
  
  console.log('✅ Подкатегория "Брэндовые игрушки" успешно добавлена!');
  console.log(`   ID: ${newSubcategory.id}`);
  console.log(`   Order: ${newSubcategory.order}`);
  console.log(`   Active: ${newSubcategory.active}`);
}

addSubcategory()
  .catch(err => {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

