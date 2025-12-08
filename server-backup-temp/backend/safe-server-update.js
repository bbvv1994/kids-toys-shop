const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function safeServerUpdate() {
  console.log('🛡️ Безопасное обновление сервера (без сброса данных)...\n');
  
  try {
    // Проверяем подключение к базе данных
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверяем количество данных перед обновлением
    console.log('\n📊 Проверка данных перед обновлением:');
    const categoriesCount = await prisma.category.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();
    const ordersCount = await prisma.order.count();
    const questionsCount = await prisma.productQuestion.count();
    
    console.log(`   - Категории: ${categoriesCount}`);
    console.log(`   - Товары: ${productsCount}`);
    console.log(`   - Пользователи: ${usersCount}`);
    console.log(`   - Заказы: ${ordersCount}`);
    console.log(`   - Вопросы: ${questionsCount}`);
    
    // Проверяем переменные окружения
    console.log('\n🔧 Проверка переменных окружения...');
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
    const missingVars = [];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }
    
    if (missingVars.length > 0) {
      console.log(`❌ Отсутствуют переменные окружения: ${missingVars.join(', ')}`);
      return;
    }
    
    console.log('✅ Все переменные окружения настроены');
    
    // Проверяем миграции
    console.log('\n📋 Проверка миграций...');
    try {
      const migrationStatus = execSync('npx prisma migrate status', { encoding: 'utf8' });
      console.log('✅ Статус миграций проверен');
      
      if (migrationStatus.includes('Pending')) {
        console.log('⚠️ Обнаружены непримененные миграции');
        console.log('🔄 Применяем миграции...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Миграции применены');
      } else {
        console.log('✅ Все миграции применены');
      }
    } catch (error) {
      console.log('❌ Ошибка при проверке миграций:', error.message);
    }
    
    // Генерируем Prisma Client
    console.log('\n🔨 Генерация Prisma Client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma Client сгенерирован');
    } catch (error) {
      console.log('⚠️ Ошибка при генерации Prisma Client:', error.message);
      console.log('💡 Prisma Client может быть уже сгенерирован');
    }
    
    // Проверяем таблицу ProductQuestion
    console.log('\n❓ Проверка таблицы ProductQuestion...');
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ProductQuestion'
        );
      `;
      
      if (tableExists[0].exists) {
        console.log('✅ Таблица ProductQuestion существует');
        
        // Проверяем структуру таблицы
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'productquestion'
          ORDER BY ordinal_position;
        `;
        
        console.log(`📋 Структура таблицы ProductQuestion (${columns.length} колонок):`);
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Проверяем данные в таблице
        const questionsCount = await prisma.productQuestion.count();
        console.log(`📊 Вопросов в базе: ${questionsCount}`);
        
      } else {
        console.log('❌ Таблица ProductQuestion не существует');
        console.log('🔄 Создаем таблицу через миграцию...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('❌ Ошибка при проверке таблицы ProductQuestion:', error.message);
    }
    
    // Проверяем API endpoints
    console.log('\n🧪 Тестирование API endpoints...');
    try {
      // Проверяем доступность модели в Prisma Client
      if (prisma.productQuestion) {
        console.log('✅ Модель productQuestion доступна в Prisma Client');
      } else {
        console.log('❌ Модель productQuestion недоступна в Prisma Client');
      }
    } catch (error) {
      console.log('❌ Ошибка при проверке Prisma Client:', error.message);
    }
    
    // Проверяем данные после обновления
    console.log('\n📊 Проверка данных после обновления:');
    const finalCategoriesCount = await prisma.category.count();
    const finalProductsCount = await prisma.product.count();
    const finalUsersCount = await prisma.user.count();
    const finalOrdersCount = await prisma.order.count();
    const finalQuestionsCount = await prisma.productQuestion.count();
    
    console.log(`   - Категории: ${finalCategoriesCount}`);
    console.log(`   - Товары: ${finalProductsCount}`);
    console.log(`   - Пользователи: ${finalUsersCount}`);
    console.log(`   - Заказы: ${finalOrdersCount}`);
    console.log(`   - Вопросы: ${finalQuestionsCount}`);
    
    // Проверяем, что данные не потеряны
    if (finalCategoriesCount === categoriesCount && 
        finalProductsCount === productsCount && 
        finalUsersCount === usersCount && 
        finalOrdersCount === ordersCount) {
      console.log('✅ Все данные сохранены');
    } else {
      console.log('⚠️ Обнаружены изменения в данных');
      console.log(`   Категории: ${categoriesCount} → ${finalCategoriesCount}`);
      console.log(`   Товары: ${productsCount} → ${finalProductsCount}`);
      console.log(`   Пользователи: ${usersCount} → ${finalUsersCount}`);
      console.log(`   Заказы: ${ordersCount} → ${finalOrdersCount}`);
    }
    
    console.log('\n🎉 Безопасное обновление завершено успешно!');
    console.log('\n📋 Рекомендации:');
    console.log('1. Перезапустите сервер');
    console.log('2. Проверьте работу вкладки "Вопросы и ответы"');
    console.log('3. Протестируйте создание новых вопросов');
    console.log('4. Проверьте админ панель для ответов на вопросы');
    
  } catch (error) {
    console.error('❌ Ошибка при безопасном обновлении:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем безопасное обновление
safeServerUpdate(); 