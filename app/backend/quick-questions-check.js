const { PrismaClient } = require('@prisma/client');

async function quickQuestionsCheck() {
  console.log('🔍 Быстрая проверка вопросов...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Проверка подключения
    await prisma.$connect();
    console.log('✅ Подключение к БД');
    
    // 2. Проверка таблицы
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ProductQuestion'
      );
    `;
    
    if (!tableExists[0]?.exists) {
      console.log('❌ Таблица ProductQuestion НЕ существует');
      console.log('💡 Выполните: npm run force-update');
      return;
    }
    console.log('✅ Таблица ProductQuestion существует');
    
    // 3. Проверка модели в Prisma Client
    if (!prisma.productQuestion) {
      console.log('❌ Модель productQuestion недоступна');
      console.log('💡 Выполните: npx prisma generate');
      return;
    }
    console.log('✅ Модель productQuestion доступна');
    
    // 4. Проверка данных
    const count = await prisma.productQuestion.count();
    console.log(`📊 Вопросов в базе: ${count}`);
    
    // 5. Тест API
    try {
      const testQuestions = await prisma.productQuestion.findMany({
        where: { status: 'published' },
        take: 1
      });
      console.log('✅ API работает корректно');
    } catch (error) {
      console.log('❌ Ошибка API:', error.message);
    }
    
    console.log('\n🎉 Проверка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickQuestionsCheck(); 