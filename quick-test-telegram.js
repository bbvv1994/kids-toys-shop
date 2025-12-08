const TelegramBot = require('node-telegram-bot-api');

// Загружаем переменные окружения
require('dotenv').config();

// Проверяем настройки
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log('❌ ОШИБКА: Не настроены переменные окружения!');
  console.log('');
  console.log('📝 Добавьте в файл .env:');
  console.log('TELEGRAM_BOT_TOKEN=ваш_токен_бота');
  console.log('TELEGRAM_CHAT_ID=ваш_chat_id');
  console.log('');
  console.log('🔧 Как получить:');
  console.log('1. Создайте бота у @BotFather в Telegram');
  console.log('2. Получите токен бота');
  console.log('3. Получите chat ID (напишите @userinfobot)');
  process.exit(1);
}

// Инициализация бота
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Функция для создания цветного уведомления о заказе
function createOrderNotification(order, status = 'new') {
  const statusEmojis = {
    'new': '🆕',
    'pending': '⏳',
    'confirmed': '✅',
    'ready': '📦',
    'pickedup': '🎉',
    'cancelled': '❌'
  };
  
  const statusText = {
    'new': 'НОВЫЙ ЗАКАЗ',
    'pending': 'ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ',
    'confirmed': 'ПОДТВЕРЖДЕН',
    'ready': 'ГОТОВ К ВЫДАЧЕ',
    'pickedup': 'ПОЛУЧЕН',
    'cancelled': 'ОТМЕНЕН'
  };
  
  const emoji = statusEmojis[status] || '📋';
  const text = statusText[status] || status.toUpperCase();
  
  return { emoji, text };
}

// Функция для создания цветных уведомлений о других событиях
function createEventNotification(type, data = {}) {
  const eventEmojis = {
    'review': '⭐',
    'low_stock': '⚠️',
    'user_registration': '👤',
    'payment': '💳',
    'error': '❌'
  };
  
  const eventTexts = {
    'review': 'НОВЫЙ ОТЗЫВ',
    'low_stock': 'НИЗКИЙ ЗАПАС ТОВАРА',
    'user_registration': 'НОВАЯ РЕГИСТРАЦИЯ',
    'payment': 'ПЛАТЕЖ',
    'error': 'ОШИБКА'
  };
  
  const emoji = eventEmojis[type] || '📋';
  const text = eventTexts[type] || type.toUpperCase();
  
  return { emoji, text };
}

// Функция для получения информации о магазине
function getStoreInfo(pickupStore) {
  const storeInfo = {
    'store1': { name: 'חנות קריית ים', address: 'רוברט סולד 8 קריית ים' },
    'store2': { name: 'חנות קריית מוצקין', address: 'ויצמן 6 קריית מוצקין' }
  };
  return storeInfo[pickupStore] || { name: 'חנות לא נמצאה', address: 'כתובת לא צוינה' };
}

// Функция для отправки уведомления в Telegram
async function sendTelegramNotification(message) {
  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' });
    console.log('✅ Уведомление отправлено успешно!');
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки уведомления:', error.message);
    return false;
  }
}

// Тестовые данные
const testOrder = {
  id: 999,
  user: { name: 'Тестовый Пользователь', email: 'test@example.com' },
  pickupStore: 'store1',
  items: [
    { product: { name: 'Тестовая игрушка', price: 100 }, quantity: 2 },
    { product: { name: 'Тестовый конструктор', price: 200 }, quantity: 1 }
  ]
};

// Функция для отправки всех тестовых уведомлений
async function sendTestNotifications() {
  console.log('🚀 Начинаем отправку тестовых уведомлений...\n');
  
  // 1. Тест нового заказа
  console.log('📦 Отправляем уведомление о новом заказе...');
  const newOrderInfo = createOrderNotification(testOrder, 'new');
  const newOrderMessage = `
${newOrderInfo.emoji} <b>${newOrderInfo.text} #${testOrder.id}</b>

👤 <b>Клиент:</b> ${testOrder.user.name}
📧 <b>Email:</b> ${testOrder.user.email}
📱 <b>Телефон:</b> +972-50-123-4567
🏬 <b>Самовывоз из:</b> ${getStoreInfo(testOrder.pickupStore).name} (${getStoreInfo(testOrder.pickupStore).address})
💳 <b>Оплата:</b> Карта

📦 <b>Товары:</b>
• ${testOrder.items[0].product.name} x${testOrder.items[0].quantity} - ${testOrder.items[0].product.price * testOrder.items[0].quantity} ₪
• ${testOrder.items[1].product.name} x${testOrder.items[1].quantity} - ${testOrder.items[1].product.price * testOrder.items[1].quantity} ₪

💰 <b>Итого:</b> 400 ₪
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
  
  await sendTelegramNotification(newOrderMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. Тест подтвержденного заказа
  console.log('✅ Отправляем уведомление о подтверждении заказа...');
  const confirmedOrderInfo = createOrderNotification(testOrder, 'confirmed');
  const statusChangeMessage = `
${confirmedOrderInfo.emoji} <b>${confirmedOrderInfo.text} #${testOrder.id}</b>

📦 <b>Заказ #${testOrder.id}</b>
👤 <b>Клиент:</b> ${testOrder.user.name}
📧 <b>Email:</b> ${testOrder.user.email}
🏬 <b>Магазин:</b> ${getStoreInfo(testOrder.pickupStore).name} (${getStoreInfo(testOrder.pickupStore).address})

💰 <b>Сумма:</b> 400 ₪
📅 <b>Новый статус:</b> ${confirmedOrderInfo.text}
⏰ <b>Время изменения:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
  
  await sendTelegramNotification(statusChangeMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Тест отзыва о товаре
  console.log('⭐ Отправляем уведомление об отзыве о товаре...');
  const reviewInfo = createEventNotification('review');
  const reviewMessage = `
${reviewInfo.emoji} <b>НОВЫЙ ОТЗЫВ НА МОДЕРАЦИИ</b>

👤 <b>Пользователь:</b> Тестовый Пользователь
⭐ <b>Оценка:</b> 5/5
📝 <b>Товар:</b> Тестовая игрушка
💬 <b>Отзыв:</b> Отличная игрушка! Ребенок в восторге. Качество на высоте, рекомендую всем родителям.
⏳ <b>Статус:</b> ОЖИДАЕТ МОДЕРАЦИИ
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
  
  await sendTelegramNotification(reviewMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. Тест отзыва о магазине
  console.log('🏪 Отправляем уведомление об отзыве о магазине...');
  const shopReviewInfo = createEventNotification('review');
  const shopReviewMessage = `
${shopReviewInfo.emoji} <b>НОВЫЙ ОТЗЫВ О МАГАЗИНЕ НА МОДЕРАЦИИ</b>

👤 <b>Пользователь:</b> Тестовый Пользователь
⭐ <b>Оценка:</b> 5/5
📦 <b>Заказ:</b> #999
💬 <b>Отзыв:</b> Отличный магазин! Быстрая доставка, качественные товары, вежливый персонал. Обязательно буду заказывать еще.
⏳ <b>Статус:</b> ОЖИДАЕТ МОДЕРАЦИИ
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
  
  await sendTelegramNotification(shopReviewMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 5. Тест готового заказа
  console.log('📦 Отправляем уведомление о готовом заказе...');
  const readyOrderInfo = createOrderNotification(testOrder, 'ready');
  const readyMessage = `
${readyOrderInfo.emoji} <b>${readyOrderInfo.text} #${testOrder.id}</b>

📦 <b>Заказ #${testOrder.id}</b>
👤 <b>Клиент:</b> ${testOrder.user.name}
📧 <b>Email:</b> ${testOrder.user.email}
🏬 <b>Магазин:</b> ${getStoreInfo(testOrder.pickupStore).name} (${getStoreInfo(testOrder.pickupStore).address})

💰 <b>Сумма:</b> 400 ₪
📅 <b>Новый статус:</b> ${readyOrderInfo.text}
⏰ <b>Время изменения:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
  
  await sendTelegramNotification(readyMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 6. Тест полученного заказа
  console.log('🎉 Отправляем уведомление о полученном заказе...');
  const pickedupOrderInfo = createOrderNotification(testOrder, 'pickedup');
  const pickedupMessage = `
${pickedupOrderInfo.emoji} <b>${pickedupOrderInfo.text} #${testOrder.id}</b>

📦 <b>Заказ #${testOrder.id}</b>
👤 <b>Клиент:</b> ${testOrder.user.name}
📧 <b>Email:</b> ${testOrder.user.email}
🏬 <b>Магазин:</b> ${getStoreInfo(testOrder.pickupStore).name} (${getStoreInfo(testOrder.pickupStore).address})

💰 <b>Сумма:</b> 400 ₪
📅 <b>Новый статус:</b> ${pickedupOrderInfo.text}
⏰ <b>Время изменения:</b> ${new Date().toLocaleString('ru-RU')}
  `.trim();
  
  await sendTelegramNotification(pickedupMessage);
  
  console.log('\n🎉 Все тестовые уведомления отправлены!');
  console.log('\n📋 Отправленные уведомления:');
  console.log('1. 🆕 Новый заказ (оранжевый)');
  console.log('2. ✅ Подтвержден заказ (зеленый)');
  console.log('3. ⭐ Отзыв о товаре (фиолетовый)');
  console.log('4. ⭐ Отзыв о магазине (фиолетовый)');
  console.log('5. 📦 Готов к выдаче (синий)');
  console.log('6. 🎉 Получен заказ (фиолетовый)');
}

// Запуск тестирования
console.log('🤖 Тестирование Telegram уведомлений');
console.log('=====================================');
console.log(`📱 Chat ID: ${TELEGRAM_CHAT_ID}`);
console.log(`🤖 Bot Token: ${TELEGRAM_BOT_TOKEN ? '✅ Настроен' : '❌ Не настроен'}`);
console.log('');

sendTestNotifications(); 