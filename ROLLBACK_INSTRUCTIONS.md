# 🔄 Инструкция по откату к коммиту b0b241184133ae08c5d3f01ba4816b3a4c0afdb1

## 📋 Описание

Коммит `b0b241184133ae08c5d3f01ba4816b3a4c0afdb1` - это стабильная версия с системой кэширования, которая включает:
- ✅ Redis кэширование API
- ✅ Nginx кэширование статических файлов
- ✅ Умная инвалидация кэша
- ✅ Fallback на in-memory кэш
- ✅ Система мониторинга производительности

## 🚀 Способы отката

### Способ 1: Полный откат с резервным копированием (рекомендуется)

```bash
# Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# Переключитесь на пользователя приложения
su - kids-toys

# Скачайте скрипт отката
wget https://raw.githubusercontent.com/bbvv1994/kids-toys-shop/main/rollback-to-commit.sh
chmod +x rollback-to-commit.sh

# Запустите откат
./rollback-to-commit.sh
```

**Что делает этот скрипт:**
- ✅ Создает резервную копию базы данных
- ✅ Создает резервную копию загруженных файлов
- ✅ Создает резервную копию конфигурации
- ✅ Останавливает приложение
- ✅ Откатывает код к целевому коммиту
- ✅ Обновляет зависимости
- ✅ Применяет миграции базы данных
- ✅ Перезапускает приложение
- ✅ Проверяет работоспособность

### Способ 2: Быстрый откат (без резервного копирования)

```bash
# Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# Переключитесь на пользователя приложения
su - kids-toys

# Скачайте скрипт быстрого отката
wget https://raw.githubusercontent.com/bbvv1994/kids-toys-shop/main/quick-rollback.sh
chmod +x quick-rollback.sh

# Запустите быстрый откат
./quick-rollback.sh
```

**Что делает этот скрипт:**
- ⚡ Останавливает приложение
- ⚡ Откатывает код к целевому коммиту
- ⚡ Обновляет зависимости
- ⚡ Перезапускает приложение
- ⚡ Проверяет API

### Способ 3: Ручной откат

```bash
# Подключитесь к серверу
ssh root@YOUR_SERVER_IP
su - kids-toys

# Перейдите в директорию проекта
cd /home/kids-toys/app

# Остановите приложение
pm2 stop kids-toys-backend

# Получите последние изменения
git fetch origin

# Откатитесь к целевому коммиту
git reset --hard b0b241184133ae08c5d3f01ba4816b3a4c0afdb1

# Обновите зависимости backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
cd ..

# Обновите зависимости frontend
cd frontend
npm install
npm run build
cd ..

# Перезапустите приложение
pm2 start ecosystem.config.js
pm2 save

# Проверьте статус
pm2 status
```

## 🔍 Проверка после отката

### 1. Проверка статуса сервисов
```bash
/home/kids-toys/monitor.sh
```

### 2. Проверка API endpoints
```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/categories
```

### 3. Проверка логов
```bash
pm2 logs kids-toys-backend
```

### 4. Проверка frontend
- Откройте сайт в браузере
- Проверьте загрузку главной страницы
- Проверьте отображение товаров
- Проверьте работу поиска

## 🚨 Устранение проблем

### Если API не отвечает:
```bash
# Проверьте логи
pm2 logs kids-toys-backend

# Проверьте подключение к базе данных
cd /home/kids-toys/app/backend
node test-connection.js

# Перезапустите приложение
pm2 restart kids-toys-backend
```

### Если база данных не работает:
```bash
# Проверьте статус PostgreSQL
sudo systemctl status postgresql

# Проверьте миграции
cd /home/kids-toys/app/backend
npx prisma migrate status

# Примените миграции заново
npx prisma migrate deploy
```

### Если frontend не загружается:
```bash
# Пересоберите frontend
cd /home/kids-toys/app/frontend
npm run build

# Проверьте Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Восстановление из резервной копии (если что-то пошло не так)

Если откат прошел неудачно, вы можете восстановить из резервной копии:

```bash
# Найдите резервную копию
ls -la /home/kids-toys/backups/

# Восстановите базу данных
psql -U kids_toys_user -h localhost kids_toys_db < /home/kids-toys/backups/rollback-YYYYMMDD_HHMMSS/db_backup_before_rollback.sql

# Восстановите загруженные файлы
tar -xzf /home/kids-toys/backups/rollback-YYYYMMDD_HHMMSS/uploads_backup_before_rollback.tar.gz -C /home/kids-toys/app/backend/

# Восстановите конфигурацию
tar -xzf /home/kids-toys/backups/rollback-YYYYMMDD_HHMMSS/config_backup_before_rollback.tar.gz -C /home/kids-toys/app/
```

## 🎯 Ожидаемый результат

После успешного отката у вас будет:
- ✅ Стабильная версия с системой кэширования
- ✅ Улучшенная производительность
- ✅ Рабочие API endpoints
- ✅ Корректно отображающийся frontend
- ✅ Функционирующая база данных

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `pm2 logs kids-toys-backend`
2. Проверьте статус сервисов: `/home/kids-toys/monitor.sh`
3. Проверьте подключение к базе данных
4. При необходимости восстановите из резервной копии

---

**🎉 Удачного отката!**
