const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function initDatabase() {
  try {
    console.log('🔧 Инициализация базы данных...');
    
    // Применяем миграции
    console.log('📋 Применение миграций...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Миграции применены');
    
    // Генерируем Prisma Client
    console.log('🔨 Генерация Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client сгенерирован');
    
    // Проверяем подключение
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверяем таблицы
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`📊 Найдено таблиц: ${tableCount[0].count}`);
    
    await prisma.$disconnect();
    console.log('🎉 База данных инициализирована успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

// Запускаем инициализацию
initDatabase(); 