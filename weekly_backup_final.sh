#!/bin/bash

# 🗓️ Еженедельный бэкап на Google Drive через Service Account (финальная версия)
# Этот скрипт создает полный бэкап и загружает его на Google Drive

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Переменные
BACKUP_DIR="/home/kids-toys/backups"
GOOGLE_DRIVE_DIR="/home/kids-toys/google-drive-backup"
DATE=$(date +%Y%m%d_%H%M%S)
WEEK=$(date +%Y-W%U)

log "🗓️ Начало еженедельного бэкапа"
log "📅 Дата: $(date)"
log "📊 Неделя: $WEEK"

# Создание директории для бэкапа
mkdir -p $BACKUP_DIR

# 1. Бэкап базы данных (исправлено - используем sudo postgres без пароля)
log "📊 Создание бэкапа базы данных..."
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
sudo -u postgres pg_dump kids_toys_db > $DB_BACKUP_FILE

if [ -f "$DB_BACKUP_FILE" ] && [ -s "$DB_BACKUP_FILE" ]; then
    log "✅ Бэкап базы данных создан: $(du -h $DB_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания бэкапа базы данных"
fi

# 2. Бэкап изображений
log "🖼️ Создание бэкапа изображений..."
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
tar -czf $UPLOADS_BACKUP_FILE -C /home/kids-toys/app uploads/

if [ -f "$UPLOADS_BACKUP_FILE" ] && [ -s "$UPLOADS_BACKUP_FILE" ]; then
    log "✅ Бэкап изображений создан: $(du -h $UPLOADS_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания бэкапа изображений"
fi

# 3. Бэкап конфигурации
log "⚙️ Создание бэкапа конфигурации..."
CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"
tar -czf $CONFIG_BACKUP_FILE -C /home/kids-toys/app backend/.env backend/prisma/

if [ -f "$CONFIG_BACKUP_FILE" ] && [ -s "$CONFIG_BACKUP_FILE" ]; then
    log "✅ Бэкап конфигурации создан: $(du -h $CONFIG_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания бэкапа конфигурации"
fi

# 4. Создание полного архива
log "📦 Создание полного архива..."
FULL_BACKUP_FILE="$BACKUP_DIR/full_backup_$WEEK.tar.gz"
tar -czf $FULL_BACKUP_FILE -C $BACKUP_DIR db_backup_$DATE.sql uploads_backup_$DATE.tar.gz config_backup_$DATE.tar.gz

if [ -f "$FULL_BACKUP_FILE" ] && [ -s "$FULL_BACKUP_FILE" ]; then
    log "✅ Полный архив создан: $(du -h $FULL_BACKUP_FILE | cut -f1)"
else
    error "❌ Ошибка создания полного архива"
fi

# 5. Загрузка на Google Drive через Service Account
log "☁️ Загрузка на Google Drive..."
cd $GOOGLE_DRIVE_DIR

# Проверяем наличие Service Account credentials
if [ ! -f "service-account-credentials.json" ]; then
    error "❌ Service Account credentials не найдены!"
    error "Скачайте service-account-credentials.json из Google Cloud Console"
fi

# Загружаем полный архив
python3 service_account_upload.py "$FULL_BACKUP_FILE" "kids-toys-full-backup-$WEEK.tar.gz"

# Загружаем отдельные файлы
python3 service_account_upload.py "$DB_BACKUP_FILE" "db_backup_$DATE.sql"
python3 service_account_upload.py "$UPLOADS_BACKUP_FILE" "uploads_backup_$DATE.tar.gz"
python3 service_account_upload.py "$CONFIG_BACKUP_FILE" "config_backup_$DATE.tar.gz"

# 6. Очистка старых бэкапов (старше 30 дней)
log "🧹 Очистка старых бэкапов..."
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

log "✅ Еженедельный бэкап завершен!"
log "📊 Статистика:"
echo "   - База данных: $(du -h $DB_BACKUP_FILE | cut -f1)"
echo "   - Изображения: $(du -h $UPLOADS_BACKUP_FILE | cut -f1)"
echo "   - Конфигурация: $(du -h $CONFIG_BACKUP_FILE | cut -f1)"
echo "   - Полный архив: $(du -h $FULL_BACKUP_FILE | cut -f1)"
echo "   - Всего загружено на Google Drive: 4 файла"

log "🎉 Бэкап успешно завершен!"

