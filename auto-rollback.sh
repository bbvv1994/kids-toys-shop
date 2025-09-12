#!/bin/bash

# 🔄 Автоматический откат сервера к коммиту b0b2411
# Запускать на сервере: bash auto-rollback.sh

set -e

echo "🔄 Начинаем автоматический откат к коммиту b0b2411..."
echo "=================================================="

# Переход в директорию проекта
cd /home/kids-toys/app

# Изменение URL на HTTPS
echo "📡 Настройка HTTPS для GitHub..."
git remote set-url origin https://github.com/bbvv1994/kids-toys-shop.git

# Остановка приложения
echo "⏹️ Остановка приложения..."
pm2 stop kids-toys-backend 2>/dev/null || echo "PM2 процесс не найден"

# Получение изменений и откат
echo "📥 Получение изменений и откат..."
git fetch origin
git reset --hard b0b241184133ae08c5d3f01ba4816b3a4c0afdb1

echo "✅ Откат к коммиту b0b2411 выполнен!"

# Обновление зависимостей backend
echo "🔧 Обновление зависимостей backend..."
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
cd ..

# Обновление зависимостей frontend
echo "🎨 Обновление зависимостей frontend..."
cd frontend
npm install
npm run build
cd ..

# Запуск приложения
echo "🚀 Запуск приложения..."
pm2 start ecosystem.config.js
pm2 save

# Проверка статуса
echo "📊 Проверка статуса..."
sleep 5
pm2 status

# Проверка API
echo "🔍 Проверка API..."
sleep 3
if curl -f -s http://localhost:5000/api/products > /dev/null; then
    echo "✅ API работает корректно!"
else
    echo "⚠️ API не отвечает. Проверьте логи: pm2 logs kids-toys-backend"
fi

echo "=================================================="
echo "🎉 Автоматический откат завершен!"
echo "📊 Для мониторинга: /home/kids-toys/monitor.sh"

