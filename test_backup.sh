#!/bin/bash

# Тестовый бэкап для диагностики
echo "🔍 Тестирование системы бэкапа..."

# Переменные
BACKUP_DIR="/home/kids-toys/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📅 Дата: $DATE"
echo "📁 Директория бэкапов: $BACKUP_DIR"

# Создание директории для бэкапа
mkdir -p $BACKUP_DIR

# Тест 1: Проверка подключения к базе данных
echo "🔍 Тест 1: Проверка подключения к базе данных..."
if pg_dump -U kids_toys_user -h localhost kids_toys_db --schema-only > /dev/null 2>&1; then
    echo "✅ Подключение к базе данных работает"
else
    echo "❌ Ошибка подключения к базе данных"
    echo "Попробуем с sudo postgres..."
    if sudo -u postgres pg_dump -U kids_toys_user -h localhost kids_toys_db --schema-only > /dev/null 2>&1; then
        echo "✅ Подключение работает с sudo postgres"
    else
        echo "❌ Ошибка подключения даже с sudo postgres"
    fi
fi

# Тест 2: Создание бэкапа базы данных
echo "🔍 Тест 2: Создание бэкапа базы данных..."
DB_BACKUP_FILE="$BACKUP_DIR/test_db_backup_$DATE.sql"

# Попробуем разные варианты подключения
if pg_dump -U kids_toys_user -h localhost kids_toys_db > $DB_BACKUP_FILE 2>&1; then
    echo "✅ Бэкап базы данных создан: $(du -h $DB_BACKUP_FILE | cut -f1)"
else
    echo "❌ Ошибка создания бэкапа базы данных"
    echo "Попробуем с sudo postgres..."
    if sudo -u postgres pg_dump -U kids_toys_user -h localhost kids_toys_db > $DB_BACKUP_FILE 2>&1; then
        echo "✅ Бэкап базы данных создан с sudo postgres: $(du -h $DB_BACKUP_FILE | cut -f1)"
    else
        echo "❌ Ошибка создания бэкапа даже с sudo postgres"
        echo "Содержимое файла ошибки:"
        cat $DB_BACKUP_FILE
    fi
fi

# Тест 3: Проверка папки uploads
echo "🔍 Тест 3: Проверка папки uploads..."
if [ -d "/home/kids-toys/app/uploads" ]; then
    echo "✅ Папка uploads существует: $(du -sh /home/kids-toys/app/uploads | cut -f1)"
else
    echo "❌ Папка uploads не найдена"
fi

# Тест 4: Проверка конфигурации
echo "🔍 Тест 4: Проверка конфигурации..."
if [ -f "/home/kids-toys/app/backend/.env" ]; then
    echo "✅ Файл .env существует"
else
    echo "❌ Файл .env не найден"
fi

if [ -d "/home/kids-toys/app/backend/prisma" ]; then
    echo "✅ Папка prisma существует"
else
    echo "❌ Папка prisma не найдена"
fi

# Тест 5: Проверка Google Drive
echo "🔍 Тест 5: Проверка Google Drive..."
cd /home/kids-toys/google-drive-backup
if [ -f "service-account-credentials.json" ]; then
    echo "✅ Service Account credentials найдены"
    if python3 service_account_upload.py /dev/null test_$(date +%s).txt > /dev/null 2>&1; then
        echo "✅ Google Drive загрузка работает"
    else
        echo "❌ Ошибка загрузки на Google Drive"
    fi
else
    echo "❌ Service Account credentials не найдены"
fi

echo "🎯 Тестирование завершено!"

