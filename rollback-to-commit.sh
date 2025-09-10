#!/bin/bash

# 🔄 Скрипт отката к коммиту b0b241184133ae08c5d3f01ba4816b3a4c0afdb1
# Запускать на сервере от имени пользователя kids-toys

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Целевой коммит
TARGET_COMMIT="b0b241184133ae08c5d3f01ba4816b3a4c0afdb1"

echo "🔄 Начинаем откат к коммиту $TARGET_COMMIT"
echo "=================================================="

# Проверка, что мы в правильной директории
if [ ! -d "/home/kids-toys/app" ]; then
    error "Директория /home/kids-toys/app не найдена. Запустите скрипт от имени пользователя kids-toys"
    exit 1
fi

cd /home/kids-toys/app

# Проверка, что это git репозиторий
if [ ! -d ".git" ]; then
    error "Это не git репозиторий. Проверьте директорию проекта"
    exit 1
fi

# Проверка текущего коммита
CURRENT_COMMIT=$(git rev-parse HEAD)
log "Текущий коммит: $CURRENT_COMMIT"

# Проверка, что целевой коммит существует
if ! git cat-file -e "$TARGET_COMMIT^{commit}" 2>/dev/null; then
    error "Коммит $TARGET_COMMIT не найден в репозитории"
    exit 1
fi

log "Целевой коммит найден: $TARGET_COMMIT"

# Создание резервной копии перед откатом
log "Создание резервной копии текущего состояния..."
BACKUP_DIR="/home/kids-toys/backups/rollback-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Резервное копирование базы данных
log "Создание резервной копии базы данных..."
pg_dump -U kids_toys_user -h localhost kids_toys_db > "$BACKUP_DIR/db_backup_before_rollback.sql"

# Резервное копирование загруженных файлов
log "Создание резервной копии загруженных файлов..."
tar -czf "$BACKUP_DIR/uploads_backup_before_rollback.tar.gz" -C /home/kids-toys/app/backend uploads/ 2>/dev/null || warn "Директория uploads не найдена"

# Резервное копирование конфигурации
log "Создание резервной копии конфигурации..."
tar -czf "$BACKUP_DIR/config_backup_before_rollback.tar.gz" -C /home/kids-toys/app backend/.env backend/prisma/ 2>/dev/null || warn "Некоторые конфигурационные файлы не найдены"

log "Резервная копия создана в: $BACKUP_DIR"

# Остановка приложения
log "Остановка приложения..."
pm2 stop kids-toys-backend || warn "PM2 процесс не найден или уже остановлен"

# Получение последних изменений
log "Получение последних изменений из репозитория..."
git fetch origin

# Откат к целевому коммиту
log "Выполнение отката к коммиту $TARGET_COMMIT..."
git reset --hard "$TARGET_COMMIT"

# Проверка статуса после отката
NEW_COMMIT=$(git rev-parse HEAD)
log "Новый коммит после отката: $NEW_COMMIT"

if [ "$NEW_COMMIT" = "$TARGET_COMMIT" ]; then
    log "✅ Откат выполнен успешно!"
else
    error "❌ Откат не удался. Текущий коммит: $NEW_COMMIT"
    exit 1
fi

# Обновление зависимостей backend
log "Обновление зависимостей backend..."
cd backend
npm install
npx prisma generate

# Проверка и применение миграций
log "Проверка миграций базы данных..."
npx prisma migrate status

# Применение миграций если необходимо
log "Применение миграций..."
npx prisma migrate deploy

cd ..

# Обновление зависимостей frontend
log "Обновление зависимостей frontend..."
cd frontend
npm install
npm run build
cd ..

# Перезапуск приложения
log "Перезапуск приложения..."
pm2 start ecosystem.config.js || pm2 restart kids-toys-backend

# Сохранение конфигурации PM2
pm2 save

# Проверка статуса приложения
log "Проверка статуса приложения..."
sleep 5
pm2 status

# Проверка логов
log "Проверка логов приложения..."
pm2 logs kids-toys-backend --lines 10

# Проверка API
log "Проверка API endpoints..."
sleep 3
if curl -f -s http://localhost:5000/api/products > /dev/null; then
    log "✅ API работает корректно"
else
    warn "⚠️ API не отвечает. Проверьте логи: pm2 logs kids-toys-backend"
fi

# Финальная проверка
log "Выполнение финальной проверки..."
/home/kids-toys/monitor.sh

echo "=================================================="
log "🎉 Откат к коммиту $TARGET_COMMIT завершен успешно!"
log "📊 Резервная копия сохранена в: $BACKUP_DIR"
log "🔄 Приложение перезапущено и готово к работе"
log "📝 Для проверки используйте: /home/kids-toys/monitor.sh"
echo "=================================================="
