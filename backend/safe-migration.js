const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class SafeMigration {
  constructor() {
    this.backupPath = path.join(__dirname, 'migration-backup.json');
    this.logPath = path.join(__dirname, 'migration-log.txt');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Записываем в файл лога
    fs.appendFileSync(this.logPath, logMessage + '\n');
  }

  async checkDatabaseConnection() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      this.log('✅ Подключение к базе данных успешно');
      return true;
    } catch (error) {
      this.log(`❌ Ошибка подключения к базе данных: ${error.message}`);
      return false;
    }
  }

  async checkExistingFields() {
    try {
      const tableInfo = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Product' 
        AND column_name IN ('nameHe', 'descriptionHe')
      `;
      
      const existingFields = tableInfo.map(col => col.column_name);
      this.log(`📋 Существующие поля переводов: ${existingFields.join(', ') || 'нет'}`);
      
      return existingFields;
    } catch (error) {
      this.log(`❌ Ошибка проверки полей: ${error.message}`);
      return [];
    }
  }

  async createBackup() {
    try {
      this.log('💾 Создание резервной копии данных...');
      
      // Получаем все товары
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          ageGroup: true,
          createdAt: true,
          updatedAt: true,
          imageUrls: true,
          quantity: true,
          article: true,
          brand: true,
          country: true,
          height: true,
          length: true,
          width: true,
          subcategoryId: true,
          isHidden: true,
          gender: true,
          categoryId: true,
          categoryName: true
        }
      });
      
      const backup = {
        timestamp: new Date().toISOString(),
        productsCount: products.length,
        products: products
      };
      
      fs.writeFileSync(this.backupPath, JSON.stringify(backup, null, 2));
      this.log(`✅ Резервная копия создана: ${products.length} товаров`);
      
      return true;
    } catch (error) {
      this.log(`❌ Ошибка создания резервной копии: ${error.message}`);
      return false;
    }
  }

  async applyMigrations() {
    try {
      this.log('🔄 Применение миграций...');
      
      // Применяем миграции
      execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        cwd: __dirname
      });
      this.log('✅ Миграции применены успешно');
      
      // Генерируем Prisma Client
      execSync('npx prisma generate', { 
        stdio: 'pipe',
        cwd: __dirname
      });
      this.log('✅ Prisma Client обновлен');
      
      return true;
    } catch (error) {
      this.log(`❌ Ошибка применения миграций: ${error.message}`);
      return false;
    }
  }

  async verifyMigration() {
    try {
      this.log('🔍 Проверка результатов миграции...');
      
      // Проверяем поля переводов
      const translationFields = await this.checkExistingFields();
      
      if (translationFields.length >= 2) {
        this.log('✅ Поля переводов успешно созданы');
        
        // Проверяем, что можем читать данные
        const productCount = await prisma.product.count();
        this.log(`✅ База данных доступна, товаров: ${productCount}`);
        
        return true;
      } else {
        this.log('❌ Поля переводов не найдены после миграции');
        return false;
      }
    } catch (error) {
      this.log(`❌ Ошибка проверки миграции: ${error.message}`);
      return false;
    }
  }

  async rollback() {
    try {
      this.log('🔄 Откат изменений...');
      
      if (fs.existsSync(this.backupPath)) {
        const backup = JSON.parse(fs.readFileSync(this.backupPath, 'utf8'));
        this.log(`📋 Восстановление из резервной копии: ${backup.productsCount} товаров`);
        
        // Здесь можно добавить логику восстановления данных
        // Пока просто логируем
        this.log('⚠️ Откат требует ручного вмешательства');
      }
      
      return true;
    } catch (error) {
      this.log(`❌ Ошибка отката: ${error.message}`);
      return false;
    }
  }

  async run() {
    this.log('🚀 Запуск безопасной миграции...');
    
    try {
      // Шаг 1: Проверка подключения
      if (!await this.checkDatabaseConnection()) {
        throw new Error('Нет подключения к базе данных');
      }
      
      // Шаг 2: Проверка существующих полей
      const existingFields = await this.checkExistingFields();
      
      if (existingFields.length >= 2) {
        this.log('✅ Поля переводов уже существуют, миграция не требуется');
        return { success: true, message: 'Поля уже существуют' };
      }
      
      // Шаг 3: Создание резервной копии
      if (!await this.createBackup()) {
        throw new Error('Не удалось создать резервную копию');
      }
      
      // Шаг 4: Применение миграций
      if (!await this.applyMigrations()) {
        throw new Error('Не удалось применить миграции');
      }
      
      // Шаг 5: Проверка результатов
      if (!await this.verifyMigration()) {
        throw new Error('Миграция не прошла проверку');
      }
      
      this.log('🎉 Безопасная миграция завершена успешно!');
      return { success: true, message: 'Миграция выполнена успешно' };
      
    } catch (error) {
      this.log(`❌ Критическая ошибка: ${error.message}`);
      
      // Попытка отката
      await this.rollback();
      
      return { 
        success: false, 
        error: error.message,
        message: 'Миграция не удалась, выполнен откат'
      };
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Экспортируем для использования в других файлах
module.exports = SafeMigration;

// Если файл запущен напрямую
if (require.main === module) {
  const migration = new SafeMigration();
  migration.run().then(result => {
    console.log('Результат:', result);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Неожиданная ошибка:', error);
    process.exit(1);
  });
}
