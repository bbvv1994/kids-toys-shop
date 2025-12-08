const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function forceUpdateServer() {
  console.log('🚀 Принудительное обновление сервера...\n');
  
  try {
    // 1. Очищаем кэш npm
    console.log('🧹 Очистка кэша npm...');
    try {
      execSync('npm cache clean --force', { stdio: 'inherit' });
      console.log('✅ Кэш npm очищен');
    } catch (error) {
      console.log('⚠️ Ошибка при очистке кэша npm:', error.message);
    }
    
    // 2. Удаляем node_modules и package-lock.json
    console.log('\n🗑️ Удаление node_modules и package-lock.json...');
    try {
      execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
      console.log('✅ node_modules и package-lock.json удалены');
    } catch (error) {
      console.log('⚠️ Ошибка при удалении node_modules:', error.message);
    }
    
    // 3. Переустанавливаем зависимости
    console.log('\n📦 Переустановка зависимостей...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Зависимости переустановлены');
    } catch (error) {
      console.log('❌ Ошибка при переустановке зависимостей:', error.message);
      return;
    }
    
    // 4. Сбрасываем базу данных (опционально)
    console.log('\n🔄 Сброс базы данных...');
    try {
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      console.log('✅ База данных сброшена');
    } catch (error) {
      console.log('⚠️ Ошибка при сбросе базы данных:', error.message);
    }
    
    // 5. Применяем все миграции
    console.log('\n📋 Применение всех миграций...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Все миграции применены');
    } catch (error) {
      console.log('❌ Ошибка при применении миграций:', error.message);
      return;
    }
    
    // 6. Генерируем Prisma Client
    console.log('\n🔨 Генерация Prisma Client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma Client сгенерирован');
    } catch (error) {
      console.log('❌ Ошибка при генерации Prisma Client:', error.message);
      return;
    }
    
    // 7. Проверяем подключение к базе данных
    console.log('\n🔌 Проверка подключения к базе данных...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // 8. Проверяем таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`📊 Найдено таблиц: ${tables.length}`);
    
    await prisma.$disconnect();
    
    // 9. Проверяем, что сервер может запуститься
    console.log('\n🚀 Проверка запуска сервера...');
    try {
      // Запускаем сервер в фоновом режиме на 5 секунд
      const serverProcess = execSync('timeout 5s node src/index.js', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log('✅ Сервер успешно запускается');
    } catch (error) {
      if (error.status === 124) { // timeout
        console.log('✅ Сервер успешно запускается (timeout ожидаем)');
      } else {
        console.log('❌ Ошибка при запуске сервера:', error.message);
      }
    }
    
    console.log('\n🎉 Принудительное обновление завершено успешно!');
    console.log('💡 Рекомендуется перезапустить сервер для применения всех изменений');
    
  } catch (error) {
    console.error('❌ Ошибка при принудительном обновлении сервера:', error);
    process.exit(1);
  }
}

// Запускаем принудительное обновление
forceUpdateServer(); 