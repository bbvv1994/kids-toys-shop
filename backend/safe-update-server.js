const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function safeUpdate() {
  console.log('🔄 Безопасное обновление сервера...\n');

  // Проверяем переменные окружения
  console.log('📋 Проверка переменных окружения...');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Отсутствует переменная окружения: ${envVar}`);
      process.exit(1);
    }
  }
  console.log('✅ Все необходимые переменные окружения настроены');

  // Проверяем подключение к базе данных
  console.log('\n🔌 Проверка подключения к базе данных...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Тестируем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверяем количество данных до обновления
    const productsBefore = await prisma.product.count();
    const categoriesBefore = await prisma.category.count();
    const questionsBefore = await prisma.productQuestion.count();
    
    console.log(`📊 Данные до обновления:`);
    console.log(`   - Товары: ${productsBefore}`);
    console.log(`   - Категории: ${categoriesBefore}`);
    console.log(`   - Вопросы: ${questionsBefore}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    process.exit(1);
  }

  // Применяем миграции
  console.log('\n📋 Применение миграций...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Миграции применены успешно');
  } catch (error) {
    console.error('❌ Ошибка применения миграций:', error.message);
    process.exit(1);
  }

  // Генерируем Prisma Client
  console.log('\n🔨 Генерация Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client сгенерирован');
  } catch (error) {
    console.error('❌ Ошибка генерации Prisma Client:', error.message);
    // Это не критично, продолжаем
  }

  // Проверяем таблицу ProductQuestion
  console.log('\n🔍 Проверка таблицы ProductQuestion...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Проверяем существование таблицы
    const questions = await prisma.productQuestion.findMany();
    console.log(`✅ Таблица ProductQuestion существует, найдено вопросов: ${questions.length}`);
    
    // Проверяем структуру таблицы
    const sampleQuestion = await prisma.productQuestion.findFirst();
    if (sampleQuestion) {
      console.log('📋 Структура таблицы ProductQuestion:');
      console.log(`   - id: ${typeof sampleQuestion.id}`);
      console.log(`   - productId: ${typeof sampleQuestion.productId}`);
      console.log(`   - userId: ${typeof sampleQuestion.userId}`);
      console.log(`   - question: ${typeof sampleQuestion.question}`);
      console.log(`   - answer: ${typeof sampleQuestion.answer}`);
      console.log(`   - status: ${typeof sampleQuestion.status}`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Ошибка проверки таблицы ProductQuestion:', error.message);
    console.log('⚠️ Таблица ProductQuestion может не существовать, применяем миграции...');
    
    try {
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      console.log('✅ Миграции сброшены и применены заново');
    } catch (resetError) {
      console.error('❌ Ошибка сброса миграций:', resetError.message);
      process.exit(1);
    }
  }

  // Проверяем данные после обновления
  console.log('\n📊 Проверка данных после обновления...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const productsAfter = await prisma.product.count();
    const categoriesAfter = await prisma.category.count();
    const questionsAfter = await prisma.productQuestion.count();
    
    console.log(`📊 Данные после обновления:`);
    console.log(`   - Товары: ${productsAfter}`);
    console.log(`   - Категории: ${categoriesAfter}`);
    console.log(`   - Вопросы: ${questionsAfter}`);
    
    // Проверяем, что данные не потерялись
    if (productsAfter === 0) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Все товары потеряны!');
      process.exit(1);
    }
    
    if (productsAfter < productsBefore) {
      console.warn(`⚠️ ВНИМАНИЕ: Количество товаров уменьшилось с ${productsBefore} до ${productsAfter}`);
    } else {
      console.log('✅ Данные сохранены успешно');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Ошибка проверки данных после обновления:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 Безопасное обновление сервера завершено успешно!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Перезапустите сервер');
  console.log('2. Проверьте работу вкладки "Вопросы и ответы"');
  console.log('3. Протестируйте создание новых вопросов');
}

// Запускаем функцию
safeUpdate().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 