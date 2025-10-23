#!/bin/bash

# 🚀 Развертывание системы двойного сохранения изображений на сервере
# Cloudinary (основное) + Локальное (резерв в сжатом качестве)

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
APP_USER="kids-toys"
APP_DIR="/home/$APP_USER/app"

log "🚀 Развертывание системы двойного сохранения изображений"
log "📡 Сервер: $SERVER_IP"
log "👤 Пользователь: $APP_USER"
echo "=================================================="

# 1. Копируем новые файлы на сервер
info "📁 Копирование файлов системы двойного сохранения..."

# Копируем DualStorageImageHandler
scp backend/src/dualStorageImageHandler.js root@$SERVER_IP:$APP_DIR/backend/src/
log "✅ DualStorageImageHandler скопирован"

# Копируем DualStorageUploadMiddleware
scp backend/src/dualStorageUploadMiddleware.js root@$SERVER_IP:$APP_DIR/backend/src/
log "✅ DualStorageUploadMiddleware скопирован"

# Копируем обновленный бэкап скрипт
scp weekly_backup_dual_storage.sh root@$SERVER_IP:/home/$APP_USER/google-drive-backup/weekly_backup.sh
log "✅ Обновленный бэкап скрипт скопирован"

# 2. Обновляем index.js для использования двойного сохранения
info "🔧 Обновление index.js для использования двойного сохранения..."

# Создаем временный файл с изменениями
cat > update_index.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Читаем текущий index.js
const indexPath = '/home/kids-toys/app/backend/src/index.js';
let content = fs.readFileSync(indexPath, 'utf8');

// Заменяем SmartImageUploadMiddleware на DualStorageUploadMiddleware
content = content.replace(
  "const SmartImageUploadMiddleware = require('./smartImageUploadMiddleware');",
  "const DualStorageUploadMiddleware = require('./dualStorageUploadMiddleware');"
);

content = content.replace(
  "const smartImageUploadMiddleware = new SmartImageUploadMiddleware();",
  "const dualStorageUploadMiddleware = new DualStorageUploadMiddleware();"
);

// Заменяем все использования smartImageUploadMiddleware на dualStorageUploadMiddleware
content = content.replace(/smartImageUploadMiddleware/g, 'dualStorageUploadMiddleware');

// Записываем обновленный файл
fs.writeFileSync(indexPath, content);
console.log('✅ index.js обновлен для использования двойного сохранения');
EOF

# Копируем и выполняем скрипт обновления
scp update_index.js root@$SERVER_IP:/tmp/
ssh root@$SERVER_IP "cd /home/kids-toys/app/backend && node /tmp/update_index.js"
log "✅ index.js обновлен для двойного сохранения"

# 3. Перезапускаем приложение
info "🔄 Перезапуск приложения..."
ssh root@$SERVER_IP "cd /home/kids-toys/app && pm2 restart kids-toys-shop"
log "✅ Приложение перезапущено"

# 4. Проверяем статус
info "🔍 Проверка статуса приложения..."
ssh root@$SERVER_IP "pm2 status kids-toys-shop"

# 5. Тестируем новую систему
info "🧪 Тестирование системы двойного сохранения..."
ssh root@$SERVER_IP "curl -s 'http://localhost:5000/api/images/config' | head -c 500"

# 6. Обновляем cron для нового бэкап скрипта
info "⏰ Обновление cron для нового бэкап скрипта..."
ssh root@$SERVER_IP "crontab -l | grep -v weekly_backup || true; echo '0 2 * * 0 cd /home/kids-toys/google-drive-backup && ./weekly_backup.sh >> /home/kids-toys/backup.log 2>&1' | crontab -"
log "✅ Cron обновлен для нового бэкап скрипта"

# 7. Очистка временных файлов
rm -f update_index.js

log "🎉 Развертывание системы двойного сохранения завершено!"
log "📊 Что изменилось:"
echo "   - Изображения сохраняются в Cloudinary (основное хранилище)"
echo "   - Сжатые копии сохраняются локально (резерв)"
echo "   - При недоступности Cloudinary используется локальное хранилище"
echo "   - Бэкап система обновлена для учета резервных копий"
echo "   - Cron настроен для автоматических еженедельных бэкапов"

log "💡 Для проверки работы:"
echo "   1. Загрузите новое изображение через админ-панель"
echo "   2. Проверьте, что оно появилось в Cloudinary"
echo "   3. Проверьте, что сжатая копия создалась в /home/kids-toys/app/uploads/"
echo "   4. Проверьте конфигурацию: curl 'http://localhost:5000/api/images/config'"

echo "=================================================="

