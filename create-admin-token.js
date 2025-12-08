const jwt = require('./backend/node_modules/jsonwebtoken');

// Создаем правильный токен для администратора
const adminPayload = {
  userId: 6,
  email: '24523452354d@gmail.com',
  name: 'Администратор',
  role: 'admin'
};

const adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

console.log('🔑 Правильный токен для администратора:');
console.log(adminToken);

console.log('\n📋 Данные токена:');
try {
  const payload = jwt.verify(adminToken, process.env.JWT_SECRET || 'your_jwt_secret');
  console.log(`   User ID: ${payload.userId}`);
  console.log(`   Email: ${payload.email}`);
  console.log(`   Name: ${payload.name}`);
  console.log(`   Role: ${payload.role}`);
  console.log(`   Expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
} catch (error) {
  console.log('❌ Ошибка проверки токена:', error.message);
}

console.log('\n💡 Инструкции:');
console.log('1. Откройте браузер и перейдите на http://localhost:3000');
console.log('2. Откройте DevTools (F12)');
console.log('3. Перейдите на вкладку Application/Storage');
console.log('4. Найдите localStorage');
console.log('5. Замените значение ключа "token" на токен выше');
console.log('6. Обновите страницу');
console.log('7. Попробуйте отправить тестовые уведомления в Telegram'); 