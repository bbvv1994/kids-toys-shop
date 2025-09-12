#!/bin/bash

# 🖼️ Скрипт для восстановления изображений на сервере Hetzner
# Используйте этот скрипт для загрузки папки uploads с локального компьютера

set -e

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

# Проверка параметров
if [ $# -eq 0 ]; then
    echo "Использование: $0 <SERVER_IP> [LOCAL_UPLOADS_PATH]"
    echo ""
    echo "Примеры:"
    echo "  $0 123.456.789.012                    # Загрузить из текущей папки uploads"
    echo "  $0 123.456.789.012 /path/to/uploads   # Загрузить из указанной папки"
    echo ""
    echo "Этот скрипт загрузит папку uploads на сервер Hetzner"
    exit 1
fi

SERVER_IP=$1
LOCAL_UPLOADS_PATH=${2:-"./uploads"}

# Проверка существования локальной папки uploads
if [ ! -d "$LOCAL_UPLOADS_PATH" ]; then
    error "Локальная папка uploads не найдена: $LOCAL_UPLOADS_PATH"
fi

log "🖼️ Восстановление изображений на сервер Hetzner"
log "📡 Сервер: $SERVER_IP"
log "📁 Локальная папка: $LOCAL_UPLOADS_PATH"
echo ""

# Проверка подключения к серверу
log "Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP "echo 'Подключение успешно'" 2>/dev/null; then
    error "Не удается подключиться к серверу $SERVER_IP. Проверьте:"
    echo "1. IP адрес сервера"
    echo "2. SSH ключ настроен"
    echo "3. Сервер доступен"
fi

# Создание архива с изображениями
log "Создание архива с изображениями..."
ARCHIVE_NAME="uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$ARCHIVE_NAME" -C "$(dirname "$LOCAL_UPLOADS_PATH")" "$(basename "$LOCAL_UPLOADS_PATH")"

if [ ! -f "$ARCHIVE_NAME" ]; then
    error "Не удалось создать архив с изображениями"
fi

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
log "Архив создан: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

# Загрузка архива на сервер
log "Загрузка архива на сервер..."
scp "$ARCHIVE_NAME" root@$SERVER_IP:/tmp/

# Распаковка архива на сервере
log "Распаковка архива на сервере..."
ssh root@$SERVER_IP << EOF
    # Создание резервной копии существующих uploads
    if [ -d "/home/kids-toys/app/uploads" ]; then
        echo "Создание резервной копии существующих uploads..."
        mv /home/kids-toys/app/uploads /home/kids-toys/app/uploads_backup_\$(date +%Y%m%d_%H%M%S)
    fi
    
    # Распаковка нового архива
    echo "Распаковка архива..."
    tar -xzf /tmp/$ARCHIVE_NAME -C /home/kids-toys/app/
    
    # Установка правильных прав доступа
    chown -R kids-toys:kids-toys /home/kids-toys/app/uploads
    chmod -R 755 /home/kids-toys/app/uploads
    
    # Очистка временного файла
    rm /tmp/$ARCHIVE_NAME
    
    # Проверка результата
    echo "Проверка восстановленных файлов..."
    ls -la /home/kids-toys/app/uploads/ | head -10
    echo "Всего файлов: \$(find /home/kids-toys/app/uploads -type f | wc -l)"
    
    echo "✅ Изображения успешно восстановлены!"
EOF

# Очистка локального архива
rm "$ARCHIVE_NAME"

log "✅ Восстановление изображений завершено!"
log "🔄 Перезапустите приложение для применения изменений:"
echo "   ssh root@$SERVER_IP 'sudo -u kids-toys pm2 restart kids-toys-backend'"

echo ""
log "📋 Проверьте работу:"
echo "   1. Откройте http://$SERVER_IP в браузере"
echo "   2. Проверьте отображение изображений товаров"
echo "   3. Проверьте загрузку новых изображений"

echo ""
log "🔧 Полезные команды для проверки:"
echo "   ssh root@$SERVER_IP '/home/kids-toys/monitor.sh'"
echo "   ssh root@$SERVER_IP 'sudo -u kids-toys pm2 logs kids-toys-backend'"

