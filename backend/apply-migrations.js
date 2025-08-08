const https = require('https');

console.log('🔄 Применение миграций на сервере...\n');

// Функция для выполнения HTTP запроса
function makeRequest(url, method = 'POST') {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Таймаут запроса'));
    });
    
    req.end();
  });
}

async function applyMigrations() {
  try {
    console.log('📋 Шаг 1: Проверка текущего состояния сервера...');
    const healthCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/health', 'GET');
    console.log(`✅ Сервер работает (статус: ${healthCheck.statusCode})`);

    console.log('\n📋 Шаг 2: Применение миграций...');
    const migrateResult = await makeRequest('https://kids-toys-backend.onrender.com/api/migrate', 'POST');
    
    if (migrateResult.statusCode === 200) {
      console.log('✅ Миграции применены успешно!');
      console.log('📊 Результат:', migrateResult.data);
      
      if (migrateResult.data.tableExists) {
        console.log('✅ Таблица ProductQuestion существует');
      } else {
        console.log('⚠️ Таблица ProductQuestion не существует');
      }
    } else {
      console.log(`❌ Ошибка применения миграций: ${migrateResult.statusCode}`);
      console.log('📊 Ответ:', migrateResult.data);
    }

    console.log('\n📋 Шаг 3: Проверка API вопросов после миграций...');
    const questionsCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/questions', 'GET');
    if (questionsCheck.statusCode === 200) {
      const questionsCount = Array.isArray(questionsCheck.data) ? questionsCheck.data.length : 0;
      console.log(`✅ API вопросов работает, найдено вопросов: ${questionsCount}`);
    } else {
      console.log(`❌ API вопросов все еще не работает: ${questionsCheck.statusCode}`);
    }

    console.log('\n🎉 Применение миграций завершено!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте работу вкладки "Вопросы и ответы" на сайте');
    console.log('2. Протестируйте создание новых вопросов');
    console.log('3. Убедитесь, что все функции работают корректно');

  } catch (error) {
    console.error('❌ Ошибка при применении миграций:', error.message);
    console.log('\n🔗 Альтернативные способы:');
    console.log('1. Подключитесь к серверу через веб-консоль Render');
    console.log('2. Выполните команды вручную:');
    console.log('   - npx prisma migrate deploy');
    console.log('   - npx prisma generate');
    console.log('3. Перезапустите сервер');
  }
}

// Запускаем применение миграций
applyMigrations(); 