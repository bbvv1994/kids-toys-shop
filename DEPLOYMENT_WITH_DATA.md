# 🚀 План развертывания с сохранением данных

## ✅ Данные успешно экспортированы!

**Экспортировано:**
- 📂 **62 категории** (включая подкатегории)
- 📦 **11 товаров** с изображениями
- 👥 **Пользователи** (если есть)
- 📋 **Заказы** (если есть)
- ⭐ **Отзывы** (если есть)

**Файл:** `exported-data.json` (29.1 KB)

## 🔄 Пошаговый план развертывания

### Шаг 1: Создание базы данных на Render

1. **Перейдите на [Render.com](https://render.com)**
2. **Создайте PostgreSQL базу данных:**
   - Нажмите "New" → "PostgreSQL"
   - Name: `kids-toys-database`
   - Database: `kids_toys_db`
   - User: `kids_toys_user`
   - **Скопируйте Internal Database URL**

### Шаг 2: Развертывание Backend на Render

1. **Создайте Web Service:**
   - "New" → "Web Service"
   - Подключите репозиторий: `bbvv1994/kids-toys-shop`
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

2. **Настройте переменные окружения:**
   ```
   DATABASE_URL=postgresql://your-render-database-url
   JWT_SECRET=your-super-secret-jwt-key-here
   BREVO_API_KEY=your-brevo-api-key
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

### Шаг 3: Импорт данных в новую базу

После развертывания backend:

1. **Скопируйте файл `exported-data.json`** в backend папку на Render
2. **Или используйте скрипт импорта** через Render Shell

### Шаг 4: Развертывание Frontend на Vercel

1. **Создайте проект на [Vercel.com](https://vercel.com)**
2. **Подключите репозиторий:** `bbvv1994/kids-toys-shop`
3. **Настройте:**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Добавьте переменную окружения:**
   ```
   REACT_APP_API_BASE_URL=https://your-backend-name.onrender.com
   ```

## 📋 Альтернативный план (если хотите сохранить локальную базу)

### Вариант: Использовать внешнюю PostgreSQL базу

Если у вас есть доступ к внешней PostgreSQL базе данных:

1. **Получите строку подключения** к внешней базе
2. **Используйте её в Render** вместо создания новой
3. **Все данные останутся** в вашей существующей базе

## 🔧 Проверка после развертывания

### Backend проверки:
- ✅ `https://your-backend.onrender.com/api/products` - возвращает товары
- ✅ `https://your-backend.onrender.com/api/categories` - возвращает категории
- ✅ База данных подключена и работает

### Frontend проверки:
- ✅ `https://your-app.vercel.app` - загружается главная страница
- ✅ Товары отображаются
- ✅ Категории работают
- ✅ Навигация функционирует

## 🆘 Если что-то не работает

### Проблемы с базой данных:
1. Проверьте `DATABASE_URL` в Render
2. Убедитесь, что база данных создана
3. Проверьте логи в Render Dashboard

### Проблемы с frontend:
1. Проверьте `REACT_APP_API_BASE_URL`
2. Убедитесь, что backend URL правильный
3. Проверьте консоль браузера на ошибки

### Проблемы с данными:
1. Убедитесь, что `exported-data.json` загружен
2. Проверьте, что импорт прошел успешно
3. Проверьте логи импорта

## 📞 Поддержка

Если нужна помощь на любом этапе:
1. **Проверьте логи** в Render и Vercel
2. **Убедитесь, что все переменные окружения** настроены
3. **Проверьте подключение к базе данных**

**Готовы начать развертывание?** 🚀 