const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Простой парсер .env файла
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  return env;
}

const envPath = path.join(__dirname, 'backend', '.env');
const env = parseEnvFile(envPath);
process.env = { ...process.env, ...env };

async function setupLocalDatabase() {
  try {
    console.log('🔧 Настройка локальной базы данных...\n');
    
    // Парсим DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL не найден в .env');
      process.exit(1);
    }
    
    // Извлекаем параметры из URL
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      console.error('❌ Неверный формат DATABASE_URL');
      process.exit(1);
    }
    
    const [, user, password, host, port, dbName] = urlMatch;
    
    console.log(`📊 Параметры подключения:`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   User: ${user}`);
    console.log(`   Database: ${dbName}\n`);
    
    // Путь к psql
    const psqlPath = 'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe';
    
    // Используем 127.0.0.1 вместо localhost для Windows
    const dbHost = host === 'localhost' ? '127.0.0.1' : host;
    
    // Устанавливаем пароль в переменную окружения
    process.env.PGPASSWORD = password;
    
    // Создаём базу данных
    console.log('📦 Создание базы данных...');
    try {
      execSync(`"${psqlPath}" -U ${user} -h ${dbHost} -p ${port} -d postgres -c "DROP DATABASE IF EXISTS ${dbName};"`, {
        env: { ...process.env, PGPASSWORD: password },
        stdio: 'inherit'
      });
    } catch (e) {
      // Игнорируем ошибки если БД не существует
    }
    
    execSync(`"${psqlPath}" -U ${user} -h ${dbHost} -p ${port} -d postgres -c "CREATE DATABASE ${dbName};"`, {
      env: { ...process.env, PGPASSWORD: password },
      stdio: 'inherit'
    });
    console.log('✅ База данных создана\n');
    
    // Восстанавливаем дамп
    const dumpPath = path.join(__dirname, 'tmp', 'db_backup.sql');
    if (!fs.existsSync(dumpPath)) {
      console.error(`❌ Файл дампа не найден: ${dumpPath}`);
      process.exit(1);
    }
    
    console.log('💾 Восстановление данных из дампа...');
    execSync(`"${psqlPath}" -U ${user} -h ${dbHost} -p ${port} -d ${dbName} -f "${dumpPath}"`, {
      env: { ...process.env, PGPASSWORD: password },
      stdio: 'inherit'
    });
    console.log('✅ Данные восстановлены\n');
    
    console.log('🎉 База данных настроена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

setupLocalDatabase();

