#!/bin/bash

# 📊 Скрипт для восстановления базы данных на сервере Hetzner
# Используйте этот скрипт для загрузки и импорта database-export.json

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
    echo "Использование: $0 <SERVER_IP> [DATABASE_EXPORT_FILE]"
    echo ""
    echo "Примеры:"
    echo "  $0 123.456.789.012                           # Загрузить database-export.json из текущей папки"
    echo "  $0 123.456.789.012 /path/to/database-export.json  # Загрузить указанный файл"
    echo ""
    echo "Этот скрипт загрузит и импортирует данные в базу данных на сервере Hetzner"
    exit 1
fi

SERVER_IP=$1
DATABASE_EXPORT_FILE=${2:-"./database-export.json"}

# Проверка существования файла экспорта
if [ ! -f "$DATABASE_EXPORT_FILE" ]; then
    error "Файл экспорта базы данных не найден: $DATABASE_EXPORT_FILE"
fi

log "📊 Восстановление базы данных на сервере Hetzner"
log "📡 Сервер: $SERVER_IP"
log "📁 Файл экспорта: $DATABASE_EXPORT_FILE"
echo ""

# Проверка подключения к серверу
log "Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP "echo 'Подключение успешно'" 2>/dev/null; then
    error "Не удается подключиться к серверу $SERVER_IP. Проверьте:"
    echo "1. IP адрес сервера"
    echo "2. SSH ключ настроен"
    echo "3. Сервер доступен"
fi

# Загрузка файла экспорта на сервер
log "Загрузка файла экспорта на сервер..."
scp "$DATABASE_EXPORT_FILE" root@$SERVER_IP:/tmp/database-export.json

# Импорт данных на сервере
log "Импорт данных в базу данных..."
ssh root@$SERVER_IP << 'EOF'
    # Перемещение файла в правильную директорию
    mv /tmp/database-export.json /home/kids-toys/app/backend/
    chown kids-toys:kids-toys /home/kids-toys/app/backend/database-export.json
    
    # Переключение на пользователя приложения
    sudo -u kids-toys bash << 'INNER_EOF'
        cd /home/kids-toys/app/backend
        
        # Проверка существования файла
        if [ ! -f "database-export.json" ]; then
            echo "❌ Файл database-export.json не найден"
            exit 1
        fi
        
        # Проверка размера файла
        FILE_SIZE=$(du -h database-export.json | cut -f1)
        echo "📁 Размер файла экспорта: $FILE_SIZE"
        
        # Проверка подключения к базе данных
        echo "🔍 Проверка подключения к базе данных..."
        if ! node -e "
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            prisma.\$connect().then(() => {
                console.log('✅ Подключение к базе данных успешно');
                process.exit(0);
            }).catch(err => {
                console.error('❌ Ошибка подключения к базе данных:', err.message);
                process.exit(1);
            });
        "; then
            echo "❌ Не удается подключиться к базе данных"
            exit 1
        fi
        
        # Импорт данных через API
        echo "📥 Импорт данных через API..."
        
        # Запуск сервера в фоне для импорта
        echo "🚀 Запуск сервера для импорта..."
        pm2 start ecosystem.config.js --name temp-import
        
        # Ожидание запуска сервера
        sleep 10
        
        # Проверка статуса сервера
        if ! curl -f -s http://localhost:5000/api/products > /dev/null; then
            echo "❌ Сервер не отвечает"
            pm2 delete temp-import
            exit 1
        fi
        
        # Импорт данных
        echo "📊 Импорт данных..."
        if curl -X POST http://localhost:5000/api/import-data \
            -H "Content-Type: application/json" \
            -d @database-export.json \
            -f -s > /dev/null; then
            echo "✅ Данные успешно импортированы"
        else
            echo "❌ Ошибка при импорте данных"
            pm2 delete temp-import
            exit 1
        fi
        
        # Остановка временного сервера
        pm2 delete temp-import
        
        # Запуск основного сервера
        echo "🔄 Запуск основного сервера..."
        pm2 start ecosystem.config.js
        
        # Проверка импортированных данных
        echo "📊 Проверка импортированных данных..."
        sleep 5
        
        # Получение статистики
        echo "📈 Статистика импортированных данных:"
        curl -s http://localhost:5000/api/export-data | node -e "
            const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
            console.log('   - Категории:', data.categories.length);
            console.log('   - Товары:', data.products.length);
            console.log('   - Пользователи:', data.users.length);
            console.log('   - Заказы:', data.orders.length);
            console.log('   - Вопросы:', data.productQuestions.length);
            console.log('   - Отзывы:', data.reviews.length);
            console.log('   - Отзывы магазина:', data.shopReviews.length);
            console.log('   - Избранное:', data.wishlists.length);
            console.log('   - Уведомления:', data.notifications.length);
        "
        
        echo "✅ Импорт базы данных завершен успешно!"
        
    INNER_EOF
EOF

log "✅ Восстановление базы данных завершено!"
log "🔄 Проверьте работу приложения:"
echo "   ssh root@$SERVER_IP '/home/kids-toys/monitor.sh'"

echo ""
log "📋 Проверьте работу:"
echo "   1. Откройте http://$SERVER_IP в браузере"
echo "   2. Проверьте отображение товаров и категорий"
echo "   3. Проверьте работу корзины и заказов"

echo ""
log "🔧 Полезные команды для проверки:"
echo "   ssh root@$SERVER_IP 'sudo -u kids-toys pm2 logs kids-toys-backend'"
echo "   ssh root@$SERVER_IP 'sudo -u postgres psql kids_toys_db -c \"SELECT COUNT(*) FROM products;\"'"

