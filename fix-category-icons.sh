#!/bin/bash

# 🔧 Скрипт для исправления проблемы с иконками категорий

set -e

SERVER_IP="91.99.85.48"

echo "🔧 Исправление проблемы с иконками категорий..."

# 1. Загружаем исправленный index.js
echo "📤 Загрузка исправленного index.js..."
scp backend/src/index.js root@$SERVER_IP:/home/kids-toys/app/backend/src/

# 2. Перезапускаем приложение
echo "🔄 Перезапуск приложения..."
ssh root@$SERVER_IP "cd /home/kids-toys/app/backend && pm2 restart backend"

# 3. Ждем запуска
echo "⏳ Ожидание запуска приложения..."
sleep 5

# 4. Проверяем статус
echo "📊 Проверка статуса приложения..."
ssh root@$SERVER_IP "pm2 status"

# 5. Проверяем логи
echo "📋 Проверка логов..."
ssh root@$SERVER_IP "pm2 logs backend --lines 10"

echo "✅ Исправление завершено!"
