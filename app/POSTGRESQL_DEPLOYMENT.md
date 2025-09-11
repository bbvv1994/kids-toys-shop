# Деплой Kids Toys Shop с существующей PostgreSQL базой данных

## Подготовка к деплою

### 1. Проверка подключения к PostgreSQL

Запустите тест подключения:
```bash
cd backend
node ../test-postgresql-connection.js
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `backend` с вашими данными:

```env
# Ваша PostgreSQL база данных
DATABASE_URL="postgresql://username:password@host:port/database_name"

# JWT секрет (любая случайная строка)
JWT_SECRET="your-super-secret-jwt-key-here"

# Остальные переменные (опционально)
BREVO_API_KEY="your-brevo-api-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
NODE_ENV="production"
```

## Деплой Backend на Render

### 1. Создание сервиса на Render

1. Зайдите на [Render.com](https://render.com)
2. Создайте новый **Web Service**
3. Подключите ваш GitHub репозиторий
4. Настройте:
   - **Name**: `kids-toys-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`

### 2. Настройка переменных окружения в Render

В настройках сервиса добавьте все переменные из вашего `.env` файла:

#### Обязательные:
- `DATABASE_URL` - ваша строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT

#### Опциональные:
- `BREVO_API_KEY` - для отправки email
- `TELEGRAM_BOT_TOKEN` - для Telegram уведомлений
- `TELEGRAM_CHAT_ID` - ID чата для уведомлений
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `FACEBOOK_APP_ID` - Facebook OAuth
- `FACEBOOK_APP_SECRET` - Facebook OAuth
- `NODE_ENV` - `production`

### 3. Обновление callback URL

После деплоя обновите callback URL в Google/Facebook консоли:
- Google: `https://your-backend-name.onrender.com/api/auth/google/callback`
- Facebook: `https://your-backend-name.onrender.com/api/auth/facebook/callback`

## Деплой Frontend на Vercel

### 1. Подготовка репозитория

1. Убедитесь, что в корне проекта есть файл `vercel.json`
2. Обновите URL backend в `vercel.json`:
   ```json
   {
     "env": {
       "REACT_APP_API_BASE_URL": "https://your-backend-name.onrender.com"
     }
   }
   ```

### 2. Деплой на Vercel

1. Зайдите на [Vercel.com](https://vercel.com)
2. Импортируйте ваш GitHub репозиторий
3. Настройте:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3. Настройка переменных окружения в Vercel

Добавьте:
- `REACT_APP_API_BASE_URL` - URL вашего backend на Render

## Проверка деплоя

### 1. Проверка Backend

1. Откройте URL вашего backend: `https://your-backend-name.onrender.com`
2. Должна появиться страница с информацией о сервисе
3. Проверьте API: `https://your-backend-name.onrender.com/api/products`

### 2. Проверка Frontend

1. Откройте URL вашего frontend на Vercel
2. Проверьте, что приложение загружается
3. Проверьте, что API запросы работают

### 3. Проверка базы данных

```bash
# Подключение к вашей PostgreSQL
psql "postgresql://username:password@host:port/database_name"

# Проверка таблиц
\dt

# Проверка данных
SELECT * FROM "Product" LIMIT 5;
```

## Миграции базы данных

### 1. Применение миграций

Если нужно применить миграции к вашей базе данных:

```bash
# Локально
cd backend
npx prisma migrate deploy

# Или в Render консоли
cd backend && npx prisma migrate deploy
```

### 2. Генерация Prisma Client

```bash
cd backend
npx prisma generate
```

## Мониторинг

### Render
- Логи: Dashboard → ваш сервис → Logs
- Метрики: Dashboard → ваш сервис → Metrics

### Vercel
- Логи: Dashboard → ваш проект → Functions → Logs
- Аналитика: Dashboard → ваш проект → Analytics

## Устранение неполадок

### Проблемы с подключением к базе данных
1. Проверьте `DATABASE_URL` в переменных окружения Render
2. Убедитесь, что ваша PostgreSQL база данных доступна извне
3. Проверьте логи в Render Dashboard

### Проблемы с CORS
1. Проверьте настройки CORS в `backend/src/index.js`
2. Убедитесь, что домен frontend добавлен в список разрешенных

### Проблемы с загрузкой изображений
1. Проверьте, что папка `uploads` создается
2. Убедитесь, что права доступа настроены правильно

### Проблемы с миграциями
1. Проверьте логи в Render Dashboard
2. Попробуйте применить миграции вручную
3. Убедитесь, что Prisma Client сгенерирован

## Стоимость

### Render (Free план)
- Backend: 750 часов/месяц (достаточно для небольшого проекта)

### Vercel (Free план)
- Frontend: 100GB bandwidth/месяц
- Functions: 100GB-hours/месяц

### PostgreSQL
- Используйте вашу существующую базу данных

## Обновление URL

После получения реальных URL, обновите:

1. В `vercel.json`:
   ```json
   {
     "env": {
       "REACT_APP_API_BASE_URL": "https://your-real-backend-url.onrender.com"
     }
   }
   ```

2. В Google/Facebook консоли обновите callback URL

3. В Render настройках обновите переменные окружения с новыми URL 