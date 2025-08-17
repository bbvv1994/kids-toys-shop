# 🧸 Kids Toys Shop - Full Stack E-commerce Application

Полнофункциональное веб-приложение для интернет-магазина детских игрушек с современным дизайном и полным набором функций.

## 🚀 Технологии

### Frontend
- **React** - Основной фреймворк
- **Material-UI** - UI компоненты
- **React Router** - Навигация
- **Axios** - HTTP клиент
- **Lenis** - Плавная прокрутка

### Backend
- **Node.js** - Серверная среда
- **Express.js** - Веб-фреймворк
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов
- **Sharp** - Обработка изображений

### Дополнительные сервисы
- **Brevo (Sendinblue)** - Email уведомления
- **Telegram Bot API** - Уведомления в Telegram
- **Google OAuth** - Авторизация через Google
- **Facebook OAuth** - Авторизация через Facebook

## ✨ Функции

### Для пользователей
- 📱 Адаптивный дизайн
- 🛍️ Каталог товаров с фильтрацией
- 🔍 Поиск товаров
- ❤️ Избранное (wishlist)
- 🛒 Корзина покупок
- 👤 Личный кабинет
- ⭐ Отзывы о товарах и магазине
- 📧 Email уведомления
- 🔐 Авторизация через Google/Facebook
- 💳 Оформление заказов (включая гостевые)

### Для администраторов
- 🎛️ Панель администратора
- 📦 Управление товарами
- 📂 Управление категориями
- 📋 Управление заказами
- 👥 Управление пользователями
- ⭐ Модерация отзывов
- 📊 Статистика
- 🔔 Система уведомлений

## 🚀 Быстрое развертывание

### 1. Подготовка базы данных
- Создайте PostgreSQL базу данных
- Получите строку подключения `DATABASE_URL`

### 2. Развертывание Backend (Render)
1. Создайте новый Web Service на [Render](https://render.com)
2. Подключите этот Git репозиторий
3. Настройте переменные окружения:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key
   BREVO_API_KEY=your-brevo-api-key
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   ```
4. Build Command: `npm install && npx prisma generate`
5. Start Command: `npm start`

### 3. Развертывание Frontend (Vercel)
1. Создайте новый проект на [Vercel](https://vercel.com)
2. Подключите этот Git репозиторий
3. Настройте переменные окружения:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-name.onrender.com
   ```
4. Root Directory: `frontend`
5. Build Command: `npm run build`
6. Output Directory: `build`

## 📁 Структура проекта

```
kids-toys-shop/
├── backend/                 # Backend приложение
│   ├── src/
│   │   ├── index.js        # Основной сервер
│   │   ├── imageMiddleware.js
│   │   └── productionImageHandler.js
│   ├── prisma/
│   │   ├── schema.prisma   # Схема базы данных
│   │   └── migrations/     # Миграции
│   └── uploads/            # Загруженные изображения
├── frontend/               # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── config.js       # Конфигурация
│   │   └── App.js          # Основное приложение
│   └── public/             # Статические файлы
├── vercel.json             # Конфигурация Vercel
├── render.yaml             # Конфигурация Render
└── README.md               # Документация
```

## 🔧 Локальная разработка

### Требования
- Node.js 16+
- PostgreSQL
- npm или yarn

### Установка
```bash
# Клонирование репозитория
git clone <repository-url>
cd kids-toys-shop

# Установка зависимостей
npm run install:all

# Настройка переменных окружения
cp backend/env.example backend/.env
# Отредактируйте backend/.env

# Запуск базы данных
# Убедитесь, что PostgreSQL запущен

# Генерация Prisma клиента
cd backend
npx prisma generate

# Запуск приложений
cd ..
npm run dev
```

### Доступные скрипты
- `npm run dev` - Запуск в режиме разработки
- `npm run start` - Запуск production версии
- `npm run backend` - Запуск только backend
- `npm run frontend` - Запуск только frontend

## 🌐 Доступные маршруты

### Frontend
- `/` - Главная страница
- `/catalog` - Каталог товаров
- `/category/:id` - Страница категории
- `/subcategory/:id` - Страница подкатегории
- `/product/:id` - Страница товара
- `/cart` - Корзина
- `/wishlist` - Избранное
- `/checkout` - Оформление заказа
- `/profile` - Личный кабинет
- `/cms` - Панель администратора (только для админов)

### Backend API
- `GET /api/products` - Список товаров
- `GET /api/categories` - Список категорий
- `POST /api/auth/login` - Авторизация
- `POST /api/auth/register` - Регистрация
- `GET /api/profile/cart` - Корзина пользователя
- `POST /api/profile/wishlist/add` - Добавить в избранное
- `POST /api/guest/checkout` - Гостевой заказ
- `POST /api/profile/checkout` - Заказ авторизованного пользователя

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей
- Валидация входных данных
- CORS настройки
- Защита от SQL инъекций (Prisma)
- Безопасная загрузка файлов

## 📱 Адаптивность

Приложение полностью адаптивно и работает на:
- 📱 Мобильных устройствах
- 💻 Планшетах
- 🖥️ Десктопах

## 🎨 Особенности дизайна

- Современный Material Design
- Плавные анимации
- Интуитивная навигация
- Оптимизированные изображения
- Быстрая загрузка

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте документацию в папке проекта
2. Убедитесь, что все переменные окружения настроены
3. Проверьте логи в Render и Vercel

## 📄 Лицензия

Этот проект создан для демонстрации возможностей современной веб-разработки.

## 🔧 Решение проблемы с переводами

### Проблема
В продакшене не работали ручные переводы названий и описаний товаров, вводимые при массовом импорте или создании товара на двух языках (русский и иврит). Функциональность работала корректно в локальной среде, но не в продакшене.

### Решение
**Основная причина**: API endpoints не включали поля переводов `nameHe` и `descriptionHe` в ответы из-за условной проверки существования этих полей в базе данных.

**Исправления**:
1. **Backend API endpoints** (`backend/src/index.js`):
   - Исправлен endpoint `POST /api/products` (строки 515-614): добавлены поля `nameHe` и `descriptionHe` в destructuring `req.body` и в объект `productData`
   - Исправлен endpoint `PUT /api/products/:id` (строки 2611-2800): аналогичные исправления для обновления товаров
   - **КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ**: Убрана условная проверка `getTranslationFields()` в endpoints `GET /api/products` и `GET /api/products/:id` - теперь поля `nameHe` и `descriptionHe` всегда включаются в ответы
   - Добавлены диагностические endpoints:
     - `GET /api/debug/database-structure` - проверка структуры базы данных
     - `POST /api/debug/test-translations` - тестирование создания товара с переводами

2. **Frontend компоненты**:
   - Создан `TranslationDebugger.js` для отладки переводов в реальном времени
   - Создана страница `test-translations.html` для тестирования API endpoints

### Результат
После исправлений:
- ✅ Новые товары корректно сохраняют переводы на иврите
- ✅ Существующие товары с переводами корректно отображают их в форме редактирования
- ✅ API всегда возвращает поля `nameHe` и `descriptionHe` для всех товаров

### Диагностические инструменты
1. **TranslationDebugger** - React компонент для отладки переводов
2. **test-translations.html** - HTML страница для тестирования API
3. **Console logs** - подробное логирование в EditProductModal и API endpoints

---

**Готово к развертыванию! 🚀** 