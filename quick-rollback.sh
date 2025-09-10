#!/bin/bash

# ⚡ Быстрый откат к коммиту b0b241184133ae08c5d3f01ba4816b3a4c0afdb1
# БЕЗ создания резервных копий - только откат и перезапуск

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

TARGET_COMMIT="b0b241184133ae08c5d3f01ba4816b3a4c0afdb1"

echo "⚡ Быстрый откат к коммиту $TARGET_COMMIT"
echo "=========================================="

# Переход в директорию проекта
cd /home/kids-toys/app

# Остановка приложения
log "Остановка приложения..."
pm2 stop kids-toys-backend 2>/dev/null || warn "PM2 процесс не найден"

# Получение изменений и откат
log "Получение изменений и откат..."
git fetch origin
git reset --hard "$TARGET_COMMIT"

# Обновление зависимостей
log "Обновление зависимостей..."
cd backend && npm install && npx prisma generate && npx prisma migrate deploy
cd ../frontend && npm install && npm run build
cd ..

# Перезапуск приложения
log "Перезапуск приложения..."
pm2 start ecosystem.config.js 2>/dev/null || pm2 restart kids-toys-backend
pm2 save

# Проверка
sleep 3
if curl -f -s http://localhost:5000/api/products > /dev/null; then
    log "✅ Откат завершен успешно! API работает"
else
    warn "⚠️ API не отвечает. Проверьте: pm2 logs kids-toys-backend"
fi

echo "=========================================="
log "🎉 Быстрый откат завершен!"
