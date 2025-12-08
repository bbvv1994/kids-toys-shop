#!/usr/bin/env node

const SafeMigration = require('./safe-migration');

console.log('🚀 Запуск безопасной миграции вручную...');
console.log('📋 Этот скрипт создаст резервную копию, применит миграции и проверит результат');
console.log('');

const migration = new SafeMigration();

migration.run()
  .then(result => {
    console.log('');
    console.log('📊 РЕЗУЛЬТАТ МИГРАЦИИ:');
    console.log('========================');
    console.log(`✅ Успех: ${result.success}`);
    console.log(`📝 Сообщение: ${result.message}`);
    
    if (result.error) {
      console.log(`❌ Ошибка: ${result.error}`);
    }
    
    console.log('');
    
    if (result.success) {
      console.log('🎉 Миграция завершена успешно!');
      console.log('✅ Поля переводов готовы к использованию');
      console.log('✅ Система переводов активирована');
    } else {
      console.log('⚠️ Миграция не удалась, но данные защищены');
      console.log('📋 Проверьте логи в файле migration-log.txt');
    }
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('');
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:');
    console.error('========================');
    console.error(error.message);
    console.error('');
    console.error('📋 Проверьте логи в файле migration-log.txt');
    process.exit(1);
  });
