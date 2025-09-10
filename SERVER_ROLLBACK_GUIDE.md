# 🔄 Откат сервера к коммиту b0b2411

## 📋 Описание

Коммит `b0b241184133ae08c5d3f01ba4816b3a4c0afdb1` - это стабильная версия с системой кэширования.

## 🚀 Способы отката на сервере

### Способ 1: Автоматический скрипт (рекомендуется)

```bash
# 1. Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# 2. Переключитесь на пользователя приложения
su - kids-toys

# 3. Скачайте скрипт отката
wget https://raw.githubusercontent.com/bbvv1994/kids-toys-shop/main/server-rollback.sh
chmod +x server-rollback.sh

# 4. Запустите откат
./server-rollback.sh
```

### Способ 2: Ручной откат

```bash
# 1. Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# 2. Переключитесь на пользователя приложения
su - kids-toys

# 3. Перейдите в директорию проекта
cd /home/kids-toys/app

# 4. Остановите приложение
pm2 stop kids-toys-backend

# 5. Получите последние изменения
git fetch origin

# 6. Откатитесь к коммиту b0b2411
git reset --hard b0b241184133ae08c5d3f01ba4816b3a4c0afdb1

# 7. Обновите зависимости backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
cd ..

# 8. Обновите зависимости frontend
cd frontend
npm install
npm run build
cd ..

# 9. Перезапустите приложение
pm2 start ecosystem.config.js
pm2 save

# 10. Проверьте статус
pm2 status
/home/kids-toys/monitor.sh
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

## 🚨 Устранение проблем

### Если API не отвечает:
```bash
# Проверьте логи
pm2 logs kids-toys-backend

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

## 🎯 Ожидаемый результат

После успешного отката:
- ✅ Стабильная версия с системой кэширования
- ✅ Улучшенная производительность
- ✅ Рабочие API endpoints
- ✅ Корректно отображающийся frontend

---

**🎉 Удачного отката!**
