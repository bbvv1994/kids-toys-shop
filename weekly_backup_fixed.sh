#!/bin/bash

# 🗓️ Улучшенный еженедельный бэкап Kids Toys Shop на Google Drive
# Включает базу данных (с Cloudinary URL), локальные изображения и конфигурацию
# Запускается через cron

set -e # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
APP_USER="kids-toys"
APP_DIR="/home/$APP_USER/app"
BACKUP_DIR="/home/$APP_USER/backups"
GOOGLE_DRIVE_DIR="/home/$APP_USER/google-drive-backup"
DATE=$(date +%Y%m%d_%H%M%S)
WEEK=$(date +%Y-W%U)

log "🗓️ Начало улучшенного еженедельного бэкапа"
log "📅 Дата: $(date)"
log "📊 Неделя: $WEEK"
log "☁️ Поддержка: Локальные изображения + Cloudinary URL"
echo "=================================================="

# Создание директории для бэкапа
mkdir -p "$BACKUP_DIR"

# 1. Бэкап базы данных
info "📊 Создание бэкапа базы данных..."
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
sudo -u postgres pg_dump kids_toys_db > "$DB_BACKUP_FILE"

if [ -f "$DB_BACKUP_FILE" ] && [ -s "$DB_BACKUP_FILE" ]; then
    log "✅ Бэкап базы данных создан: $(du -h "$DB_BACKUP_FILE" | cut -f1)"
else
    error "❌ Ошибка создания бэкапа базы данных"
fi

# 2. Анализ изображений через API (более точный)
info "🔍 Анализ изображений в базе данных через API..."
CLOUDINARY_COUNT=0
LOCAL_COUNT=0

# Используем API для анализа
API_STATS=$(curl -s 'http://localhost:5000/api/products?admin=true' | python3 -c "
import json
import sys

try:
    products = json.load(sys.stdin)
    cloudinary_count = 0
    local_count = 0
    
    for product in products:
        if 'imageUrls' in product and product['imageUrls']:
            for url in product['imageUrls']:
                if url.startswith('http') and 'cloudinary.com' in url:
                    cloudinary_count += 1
                elif url.startswith('/uploads/'):
                    local_count += 1
    
    print(f'{{ \"cloudinary\": {cloudinary_count}, \"local\": {local_count} }}')
    
except Exception as e:
    print(f'{{ \"error\": \"{str(e)}\" }}')
")

if echo "$API_STATS" | grep -q "error"; then
    warning "⚠️ Ошибка при анализе изображений через API: $(echo "$API_STATS" | jq -r '.error')"
    CLOUDINARY_COUNT=0
    LOCAL_COUNT=0
else
    CLOUDINARY_COUNT=$(echo "$API_STATS" | jq -r '.cloudinary')
    LOCAL_COUNT=$(echo "$API_STATS" | jq -r '.local')
    log "📊 Статистика изображений в БД (через API):"
    log "   - Cloudinary URL: $CLOUDINARY_COUNT"
    log "   - Локальные пути: $LOCAL_COUNT"
fi

# 3. Бэкап локальных изображений
info "🖼️ Создание бэкапа локальных изображений..."
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
tar -czf "$UPLOADS_BACKUP_FILE" -C "$APP_DIR" uploads/

if [ -f "$UPLOADS_BACKUP_FILE" ] && [ -s "$UPLOADS_BACKUP_FILE" ]; then
    NUM_FILES=$(tar -tf "$UPLOADS_BACKUP_FILE" | wc -l)
    log "✅ Бэкап локальных изображений создан: $(du -h "$UPLOADS_BACKUP_FILE" | cut -f1) ($NUM_FILES файлов)"
else
    error "❌ Ошибка создания бэкапа локальных изображений"
fi

# 4. Бэкап конфигурации
info "⚙️ Создание бэкапа конфигурации..."
CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"
tar -czf "$CONFIG_BACKUP_FILE" -C "$APP_DIR" backend/.env backend/prisma/

if [ -f "$CONFIG_BACKUP_FILE" ] && [ -s "$CONFIG_BACKUP_FILE" ]; then
    log "✅ Бэкап конфигурации создан: $(du -h "$CONFIG_BACKUP_FILE" | cut -f1)"
else
    error "❌ Ошибка создания бэкапа конфигурации"
fi

# 5. Создание полного архива
info "📦 Создание полного архива..."
FULL_BACKUP_FILE="$BACKUP_DIR/full_backup_$WEEK.tar.gz"
tar -czf "$FULL_BACKUP_FILE" -C "$BACKUP_DIR" "db_backup_$DATE.sql" "uploads_backup_$DATE.tar.gz" "config_backup_$DATE.tar.gz"

if [ -f "$FULL_BACKUP_FILE" ] && [ -s "$FULL_BACKUP_FILE" ]; then
    log "✅ Полный архив создан: $(du -h "$FULL_BACKUP_FILE" | cut -f1)"
else
    error "❌ Ошибка создания полного архива"
fi

# 6. Загрузка на Google Drive
info "☁️ Загрузка на Google Drive (OAuth 2.0)..."
cd "$GOOGLE_DRIVE_DIR"

# Загружаем полный архив
python3 upload_to_drive.py "$FULL_BACKUP_FILE" "kids-toys-full-backup-$WEEK.tar.gz"
# Загружаем отдельные файлы
python3 upload_to_drive.py "$DB_BACKUP_FILE" "db_backup_$DATE.sql"
python3 upload_to_drive.py "$UPLOADS_BACKUP_FILE" "uploads_backup_$DATE.tar.gz"
python3 upload_to_drive.py "$CONFIG_BACKUP_FILE" "config_backup_$DATE.tar.gz"

# 7. Очистка старых бэкапов (старше 30 дней)
info "🧹 Очистка старых бэкапов..."
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "config_backup_*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "full_backup_*.tar.gz" -mtime +30 -delete
log "✅ Старые локальные бэкапы удалены."

log "✅ Улучшенный еженедельный бэкап завершен!"
log "📊 Статистика:"
echo "   - База данных: $(du -h "$DB_BACKUP_FILE" | cut -f1)"
echo "   - Локальные изображения: $(du -h "$UPLOADS_BACKUP_FILE" | cut -f1) ($NUM_FILES файлов)"
echo "   - Конфигурация: $(du -h "$CONFIG_BACKUP_FILE" | cut -f1)"
echo "   - Полный архив: $(du -h "$FULL_BACKUP_FILE" | cut -f1)"
echo "   - Cloudinary URL в БД: $CLOUDINARY_COUNT"
echo "   - Локальные пути в БД: $LOCAL_COUNT"
echo "   - Всего загружено в Google Drive: 4 файла"

log "🎉 Бэкап успешно завершен!"
log "💡 При восстановлении:"
log "   - Cloudinary изображения загрузятся автоматически"
log "   - Локальные изображения восстановятся из uploads backup"
echo "=================================================="