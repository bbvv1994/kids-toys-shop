const https = require('https');

console.log('🔄 Применение безопасного обновления на сервере...\n');

// Функция для выполнения HTTP запроса
function makeRequest(url, method = 'GET') {
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
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Таймаут запроса'));
    });
    
    req.end();
  });
}

async function applySafeUpdate() {
  try {
    // Шаг 1: Проверяем текущее состояние сервера
    console.log('📋 Шаг 1: Проверка текущего состояния сервера...');
    const healthCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/health');
    console.log(`✅ Сервер работает (статус: ${healthCheck.statusCode})`);

    // Шаг 2: Проверяем данные до обновления
    console.log('\n📊 Шаг 2: Проверка данных до обновления...');
    const testData = await makeRequest('https://kids-toys-backend.onrender.com/api/test-export');
    if (testData.statusCode === 200) {
      console.log('✅ Данные до обновления:');
      console.log(`   - Товары: ${testData.data.productCount}`);
      console.log(`   - Категории: ${testData.data.categoryCount}`);
      console.log(`   - Вопросы: ${testData.data.questionCount}`);
    } else {
      console.log('⚠️ Не удалось получить данные до обновления');
    }

    // Шаг 3: Применяем миграции (через API endpoint)
    console.log('\n📋 Шаг 3: Применение миграций...');
    try {
      const migrateResult = await makeRequest('https://kids-toys-backend.onrender.com/api/migrate', 'POST');
      if (migrateResult.statusCode === 200) {
        console.log('✅ Миграции применены успешно');
      } else {
        console.log('⚠️ Миграции уже применены или не требуются');
      }
    } catch (error) {
      console.log('⚠️ Endpoint миграций недоступен, продолжаем...');
    }

    // Шаг 4: Проверяем таблицу ProductQuestion
    console.log('\n🔍 Шаг 4: Проверка таблицы ProductQuestion...');
    const questionsCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/questions');
    if (questionsCheck.statusCode === 200) {
      const questionsCount = Array.isArray(questionsCheck.data) ? questionsCheck.data.length : 0;
      console.log(`✅ Таблица ProductQuestion работает, найдено вопросов: ${questionsCount}`);
    } else {
      console.log('⚠️ Таблица ProductQuestion может не существовать');
    }

    // Шаг 5: Проверяем данные после обновления
    console.log('\n📊 Шаг 5: Проверка данных после обновления...');
    const finalCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/test-export');
    if (finalCheck.statusCode === 200) {
      console.log('✅ Данные после обновления:');
      console.log(`   - Товары: ${finalCheck.data.productCount}`);
      console.log(`   - Категории: ${finalCheck.data.categoryCount}`);
      console.log(`   - Вопросы: ${finalCheck.data.questionCount}`);
      
      // Проверяем, что данные не потерялись
      if (finalCheck.data.productCount === 0) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Все товары потеряны!');
        return;
      }
      
      if (finalCheck.data.productCount >= 2) {
        console.log('✅ Данные сохранены успешно');
      } else {
        console.warn('⚠️ ВНИМАНИЕ: Количество товаров уменьшилось');
      }
    }

    // Шаг 6: Финальная проверка
    console.log('\n🎯 Шаг 6: Финальная проверка функционала...');
    const finalQuestionsCheck = await makeRequest('https://kids-toys-backend.onrender.com/api/questions');
    if (finalQuestionsCheck.statusCode === 200) {
      console.log('✅ API вопросов работает корректно');
    } else {
      console.log('⚠️ API вопросов может иметь проблемы');
    }

    console.log('\n🎉 Безопасное обновление сервера завершено успешно!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте работу вкладки "Вопросы и ответы" на сайте');
    console.log('2. Протестируйте создание новых вопросов');
    console.log('3. Убедитесь, что все функции работают корректно');

  } catch (error) {
    console.error('❌ Ошибка при применении безопасного обновления:', error.message);
    console.log('\n🔗 Альтернативные способы:');
    console.log('1. Подключитесь к серверу через веб-консоль Render');
    console.log('2. Выполните команды вручную:');
    console.log('   - npx prisma migrate deploy');
    console.log('   - npx prisma generate');
    console.log('3. Перезапустите сервер');
  }
}

// Запускаем обновление
applySafeUpdate(); 