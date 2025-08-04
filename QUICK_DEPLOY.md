# 🚀 Быстрый деплой Kids Toys Shop

## Шаг 1: Подготовка PostgreSQL

1. Убедитесь, что ваша PostgreSQL база данных доступна
2. Проверьте подключение:
   ```bash
   cd backend
   node ../test-postgresql-connection.js
   ```

## Шаг 2: Деплой Backend на Render

1. Зайдите на [Render.com](https://render.com)
2. Создайте **Web Service**
3. Подключите GitHub репозиторий
4. Настройте:
   - **Name**: `kids-toys-backend`
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`

5. Добавьте переменные окружения:
   ```
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

## Шаг 3: Деплой Frontend на Vercel

1. Зайдите на [Vercel.com](https://vercel.com)
2. Импортируйте GitHub репозиторий
3. Настройте:
   - **Framework**: Create React App
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`

4. Добавьте переменную окружения:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-name.onrender.com
   ```

## Шаг 4: Обновление URL

После получения URL обновите:
1. В `vercel.json` - URL backend
2. В Google/Facebook консоли - callback URL

## Готово! 🎉

Ваше приложение будет доступно по адресам:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend-name.onrender.com` 