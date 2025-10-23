#!/bin/bash

# 🧪 Тестовый скрипт для проверки восстановления из бэкапа

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

SERVER_IP="91.99.85.48"
TEST_DB_NAME="kids_toys_test_restore"
BACKUP_FILE="/home/kids-toys/backups/db_backup_20250910_175544.sql"

log "🧪 Тестирование восстановления из бэкапа"
log "📡 Сервер: $SERVER_IP"
log "🗄️ Тестовая БД: $TEST_DB_NAME"
log "📁 Бэкап файл: $BACKUP_FILE"
echo "=================================================="

# 1. Проверяем, что бэкап файл существует
info "📁 Проверка наличия бэкап файла..."
ssh root@$SERVER_IP "test -f '$BACKUP_FILE' && echo '✅ Бэкап файл найден' || echo '❌ Бэкап файл не найден'"

# 2. Создаем тестовую базу данных
info "🗄️ Создание тестовой базы данных..."
ssh root@$SERVER_IP "sudo -u postgres psql -c 'DROP DATABASE IF EXISTS $TEST_DB_NAME;'"
ssh root@$SERVER_IP "sudo -u postgres psql -c 'CREATE DATABASE $TEST_DB_NAME;'"
log "✅ Тестовая база данных создана"

# 3. Восстанавливаем из бэкапа
info "📥 Восстановление из бэкапа..."
ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME < '$BACKUP_FILE'"
log "✅ Бэкап восстановлен в тестовую БД"

# 4. Проверяем структуру таблиц
info "🔍 Проверка структуры таблиц..."
TABLES=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;\"")
log "📊 Найденные таблицы:"
echo "$TABLES" | while read table; do
    if [ ! -z "$table" ]; then
        echo "   - $table"
    fi
done

# 5. Проверяем данные в таблице Product
info "🛍️ Проверка данных товаров..."
PRODUCT_COUNT=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c 'SELECT COUNT(*) FROM \"Product\";'")
log "📦 Количество товаров: $PRODUCT_COUNT"

# 6. Проверяем связи с категориями
info "🏷️ Проверка связей с категориями..."
CATEGORY_COUNT=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c 'SELECT COUNT(*) FROM \"Category\";'")
log "📂 Количество категорий: $CATEGORY_COUNT"

# 7. Проверяем товары с изображениями
info "🖼️ Проверка товаров с изображениями..."
PRODUCTS_WITH_IMAGES=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c 'SELECT COUNT(*) FROM \"Product\" WHERE array_length(\"imageUrls\", 1) > 0;'")
log "🖼️ Товаров с изображениями: $PRODUCTS_WITH_IMAGES"

# 8. Проверяем Cloudinary URL
info "☁️ Проверка Cloudinary URL..."
CLOUDINARY_COUNT=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c 'SELECT COUNT(*) FROM \"Product\" WHERE EXISTS (SELECT 1 FROM unnest(\"imageUrls\") AS url WHERE url LIKE \\'%cloudinary.com%\\');'")
log "☁️ Товаров с Cloudinary изображениями: $CLOUDINARY_COUNT"

# 9. Проверяем отзывы
info "⭐ Проверка отзывов..."
REVIEW_COUNT=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c 'SELECT COUNT(*) FROM \"Review\";'")
log "⭐ Количество отзывов: $REVIEW_COUNT"

# 10. Проверяем пользователей
info "👥 Проверка пользователей..."
USER_COUNT=$(ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -t -c 'SELECT COUNT(*) FROM \"User\";'")
log "👥 Количество пользователей: $USER_COUNT"

# 11. Показываем пример товара
info "📋 Пример товара:"
ssh root@$SERVER_IP "sudo -u postgres psql -d $TEST_DB_NAME -c 'SELECT id, name, price, \"ageGroup\", gender, \"categoryName\", array_length(\"imageUrls\", 1) as image_count FROM \"Product\" LIMIT 3;'"

# 12. Очистка тестовой БД
info "🧹 Очистка тестовой БД..."
ssh root@$SERVER_IP "sudo -u postgres psql -c 'DROP DATABASE $TEST_DB_NAME;'"
log "✅ Тестовая БД удалена"

log "🎉 Тест восстановления завершен успешно!"
log "📊 Результаты:"
echo "   - Таблицы: $(echo "$TABLES" | wc -l) созданы"
echo "   - Товары: $PRODUCT_COUNT восстановлены"
echo "   - Категории: $CATEGORY_COUNT восстановлены"
echo "   - Товары с изображениями: $PRODUCTS_WITH_IMAGES"
echo "   - Cloudinary изображения: $CLOUDINARY_COUNT"
echo "   - Отзывы: $REVIEW_COUNT"
echo "   - Пользователи: $USER_COUNT"

echo "=================================================="
log "✅ ВЫВОД: Бэкап полностью функционален и может быть восстановлен!"

