#!/bin/bash

# 🗓️ Улучшенный еженедельный бэкап на Google Drive с поддержкой Cloudinary
# Этот скрипт создает полный бэкап и загружает его на Google Drive
# Поддерживает как локальные изображения, так и Cloudinary URL

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
APP_DIR="/home/kids-toys/app"
DATE=$(date +%Y%m%d_%H%M%S)
WEEK=$(date +%Y-W%U)

log "🗓️ Начало улучшенного еженедельного бэкапа"
log "📅 Дата: $(date)"
log "📊 Неделя: $WEEK"
log "☁️ Поддержка: Локальные изображения + Cloudinary URL"

# Создание директории для бэкапа
mkdir -p $BACKUP_DIR

# 1. Бэкап базы данных (включая все imageUrls)
log "📊 Создание бэкапа базы данных..."
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
sudo -u postgres pg_dump kids_toys_db > $DB_BACKUP_FILE

if [ -f "$DB_BACKUP_FILE" ] && [ -s "$DB_BACKUP_FILE" ]; then
    log "✅ Бэкап базы данных создан: $(du -h $DB_BACKUP_FILE | cut -f1)"
    
    # Анализируем типы изображений в базе данных
    log "🔍 Анализ изображений в базе данных..."
    CLOUDINARY_COUNT=$(grep -o 'https://res.cloudinary.com' "$DB_BACKUP_FILE" | wc -l || echo "0")
    LOCAL_COUNT=$(grep -o '/uploads/' "$DB_BACKUP_FILE" | wc -l || echo "0")
    
    log "📊 Статистика изображений в БД:"
    log "   - Cloudinary URL: $CLOUDINARY_COUNT"
    log "   - Локальные пути: $LOCAL_COUNT"
else
    error "❌ Ошибка создания бэкапа базы данных"
fi

# 2. Бэкап локальных изображений (только из папки uploads)
log "🖼️ Создание бэкапа локальных изображений..."
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"

if [ -d "$APP_DIR/uploads" ]; then
    # Создаем архив только локальных изображений
    tar -czf $UPLOADS_BACKUP_FILE -C $APP_DIR uploads/
    
    if [ -f "$UPLOADS_BACKUP_FILE" ] && [ -s "$UPLOADS_BACKUP_FILE" ]; then
        UPLOADS_SIZE=$(du -h $UPLOADS_BACKUP_FILE | cut -f1)
        UPLOADS_COUNT=$(tar -tzf $UPLOADS_BACKUP_FILE | wc -l)
        log "✅ Бэкап локальных изображений создан: $UPLOADS_SIZE ($UPLOADS_COUNT файлов)"
    else
        error "❌ Ошибка создания бэкапа локальных изображений"
    fi
else
    warning "⚠️ Папка uploads не найдена, создаем пустой архив"
    tar -czf $UPLOADS_BACKUP_FILE -T /dev/null
fi

# 3. Бэкап конфигурации (включая Cloudinary настройки)
log "⚙️ Создание бэкапа конфигурации..."
CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"

# Создаем временную папку для конфигурации
TEMP_CONFIG_DIR="/tmp/config_backup_$DATE"
mkdir -p "$TEMP_CONFIG_DIR"

# Копируем основные конфигурационные файлы
cp "$APP_DIR/backend/.env" "$TEMP_CONFIG_DIR/" 2>/dev/null || true
cp -r "$APP_DIR/backend/prisma/" "$TEMP_CONFIG_DIR/" 2>/dev/null || true

# Создаем файл с информацией о Cloudinary
cat > "$TEMP_CONFIG_DIR/cloudinary_info.txt" << EOF
Cloudinary Configuration Information
====================================
Date: $(date)
Backup Type: Enhanced with Cloudinary support

Database contains:
- Cloudinary URLs: $CLOUDINARY_COUNT
- Local image paths: $LOCAL_COUNT

Image Storage Strategy:
- Cloudinary URLs are stored directly in database
- Local images are backed up separately
- On restore: Cloudinary images load automatically
- Local images are restored from uploads backup

Cloudinary URLs format:
- https://res.cloudinary.com/[cloud_name]/image/upload/[public_id].[format]

Local paths format:
- /uploads/[filename]
EOF

# Архивируем конфигурацию
tar -czf $CONFIG_BACKUP_FILE -C /tmp "config_backup_$DATE"

# Очищаем временную папку
rm -rf "$TEMP_CONFIG_DIR"

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

# 5. Загрузка на Google Drive через OAuth 2.0
log "☁️ Загрузка на Google Drive (OAuth 2.0)..."
cd $GOOGLE_DRIVE_DIR

# Проверяем наличие токена
if [ ! -f "token.pickle" ]; then
    error "❌ Токен аутентификации (token.pickle) не найден!"
    error "Запустите python3 enter_auth_code_new_client.py для аутентификации"
fi

# Загружаем полный архив
python3 upload_to_drive.py "$FULL_BACKUP_FILE" "kids-toys-full-backup-$WEEK.tar.gz"

# Загружаем отдельные файлы
python3 upload_to_drive.py "$DB_BACKUP_FILE" "db_backup_$DATE.sql"
python3 upload_to_drive.py "$UPLOADS_BACKUP_FILE" "uploads_backup_$DATE.tar.gz"
python3 upload_to_drive.py "$CONFIG_BACKUP_FILE" "config_backup_$DATE.tar.gz"

# 6. Очистка старых бэкапов (старше 30 дней)
log "🧹 Очистка старых бэкапов..."
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

log "✅ Улучшенный еженедельный бэкап завершен!"
log "📊 Статистика:"
echo "   - База данных: $(du -h $DB_BACKUP_FILE | cut -f1)"
echo "   - Локальные изображения: $(du -h $UPLOADS_BACKUP_FILE | cut -f1) ($UPLOADS_COUNT файлов)"
echo "   - Конфигурация: $(du -h $CONFIG_BACKUP_FILE | cut -f1)"
echo "   - Полный архив: $(du -h $FULL_BACKUP_FILE | cut -f1)"
echo "   - Cloudinary URL в БД: $CLOUDINARY_COUNT"
echo "   - Локальные пути в БД: $LOCAL_COUNT"
echo "   - Всего загружено в Google Drive: 4 файла"

log "🎉 Бэкап успешно завершен!"
log "💡 При восстановлении:"
log "   - Cloudinary изображения загрузятся автоматически"
log "   - Локальные изображения восстановятся из uploads backup"

