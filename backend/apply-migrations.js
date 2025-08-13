const https = require('https');

console.log('🔄 Применение безопасной миграции на сервере...\n');

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
    req.setTimeout(120000, () => { // Увеличиваем таймаут для безопасной миграции
      req.destroy();
      reject(new Error('Таймаут запроса'));
    });
    
    req.end();
  });
}

async function applySafeMigration() {
  try {
    console.log('📋 Шаг 1: Проверка текущего состояния сервера...');
    const healthCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/health', 'GET');
    console.log(`✅ Сервер работает (статус: ${healthCheck.statusCode})`);

    console.log('\n📋 Шаг 2: Запуск безопасной миграции...');
    console.log('⚠️ Это может занять несколько минут...');
    const migrateResult = await makeRequest('https://kids-toys-backend.onrender.com/api/migrate', 'POST');
    
    if (migrateResult.statusCode === 200 && migrateResult.data.success) {
      console.log('✅ Безопасная миграция завершена успешно!');
      console.log('📊 Результат:', migrateResult.data.message);
      console.log('📋 Детали:', migrateResult.data.details);
    } else {
      console.log(`❌ Ошибка безопасной миграции: ${migrateResult.statusCode}`);
      console.log('📊 Ответ:', migrateResult.data);
      
      if (migrateResult.data && migrateResult.data.error) {
        console.log('❌ Ошибка:', migrateResult.data.error);
      }
    }

    console.log('\n📋 Шаг 3: Проверка системы переводов...');
    const productsCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/products?limit=1', 'GET');
    if (productsCheck.statusCode === 200) {
      console.log('✅ API товаров работает');
      
      // Проверяем, есть ли поля переводов в ответе
      if (productsCheck.data && productsCheck.data.length > 0) {
        const product = productsCheck.data[0];
        if (product.nameHe !== undefined || product.descriptionHe !== undefined) {
          console.log('✅ Поля переводов доступны в API');
        } else {
          console.log('⚠️ Поля переводов не найдены в ответе API');
        }
      }
    } else {
      console.log(`❌ API товаров не работает: ${productsCheck.statusCode}`);
    }

    console.log('\n🎉 Безопасная миграция завершена!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте работу системы переводов на сайте');
    console.log('2. Протестируйте создание товаров с переводами');
    console.log('3. Убедитесь, что надписи переведены на иврит');
    console.log('4. Проверьте логи сервера на Render для деталей');

  } catch (error) {
    console.error('❌ Ошибка при применении безопасной миграции:', error.message);
    console.log('\n🔗 Альтернативные способы:');
    console.log('1. Подключитесь к серверу через веб-консоль Render');
    console.log('2. Запустите безопасную миграцию вручную:');
    console.log('   - node safe-migration.js');
    console.log('3. Проверьте логи в файле migration-log.txt');
    console.log('4. Перезапустите сервер для автоматической миграции');
  }
}

// Запускаем безопасную миграцию
applySafeMigration(); 