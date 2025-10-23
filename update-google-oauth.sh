#!/bin/bash

# 🔐 Скрипт для обновления Google OAuth настроек
# Использование: ./update-google-oauth.sh NEW_CLIENT_ID NEW_CLIENT_SECRET

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

# Проверка параметров
if [ $# -ne 2 ]; then
    echo "Использование: $0 <NEW_CLIENT_ID> <NEW_CLIENT_SECRET>"
    echo ""
    echo "Пример:"
    echo "  $0 123456789-abcdefg.apps.googleusercontent.com GOCSPX-abcdefghijklmnop"
    echo ""
    echo "Получите новые credentials в Google Cloud Console:"
    echo "  https://console.cloud.google.com/apis/credentials"
    exit 1
fi

NEW_CLIENT_ID=$1
NEW_CLIENT_SECRET=$2

log "🔐 Обновление Google OAuth настроек"
log "📡 Сервер: 91.99.85.48"
log "🆔 Новый Client ID: $NEW_CLIENT_ID"
echo "=================================================="

# Проверка подключения к серверу
log "Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@91.99.85.48 "echo 'Подключение успешно'" 2>/dev/null; then
    error "Не удается подключиться к серверу 91.99.85.48"
fi

# Создание резервной копии текущих настроек
log "Создание резервной копии текущих настроек..."
ssh root@91.99.85.48 "
    cd /home/kids-toys/app/backend
    cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
    echo '✅ Резервная копия создана'
"

# Обновление переменных окружения
log "Обновление переменных окружения..."
ssh root@91.99.85.48 "
    cd /home/kids-toys/app/backend
    
    # Обновляем GOOGLE_CLIENT_ID
    sed -i 's/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$NEW_CLIENT_ID/' .env
    
    # Обновляем GOOGLE_CLIENT_SECRET
    sed -i 's/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$NEW_CLIENT_SECRET/' .env
    
    echo '✅ Переменные окружения обновлены'
"

# Проверка обновления
log "Проверка обновления..."
ssh root@91.99.85.48 "
    cd /home/kids-toys/app/backend
    echo '📋 Текущие настройки Google OAuth:'
    grep 'GOOGLE_CLIENT' .env
"

# Перезапуск бэкенда
log "Перезапуск бэкенда..."
ssh root@91.99.85.48 "
    cd /home/kids-toys/app
    pm2 restart backend
    echo '✅ Бэкенд перезапущен'
"

# Проверка статуса
log "Проверка статуса бэкенда..."
ssh root@91.99.85.48 "
    cd /home/kids-toys/app
    pm2 status backend
"

# Тестирование Google OAuth маршрута
log "Тестирование Google OAuth маршрута..."
if ssh root@91.99.85.48 "curl -I http://localhost:5000/api/auth/google" 2>/dev/null | grep -q "302\|301"; then
    log "✅ Google OAuth маршрут работает"
else
    warning "⚠️ Google OAuth маршрут может не работать корректно"
fi

# Создание тестового скрипта
log "Создание тестового скрипта..."
cat > test-new-google-oauth.js << 'EOF'
require('dotenv').config();

async function testNewGoogleOAuth() {
  try {
    console.log('🔍 Тестирование новых настроек Google OAuth...');
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const frontendUrl = process.env.FRONTEND_URL;
    
    console.log('📋 Новые настройки Google OAuth:');
    console.log('• GOOGLE_CLIENT_ID:', googleClientId ? '✅ Настроен' : '❌ Не настроен');
    console.log('• GOOGLE_CLIENT_SECRET:', googleClientSecret ? '✅ Настроен' : '❌ Не настроен');
    console.log('• FRONTEND_URL:', frontendUrl || 'http://localhost:3000');
    
    if (googleClientId && googleClientSecret) {
      console.log('✅ Новые настройки Google OAuth загружены успешно!');
      console.log('🎯 Готово к тестированию на сайте');
    } else {
      console.log('❌ Ошибка загрузки настроек Google OAuth');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testNewGoogleOAuth();
EOF

# Копирование и запуск тестового скрипта
log "Запуск тестового скрипта..."
scp test-new-google-oauth.js root@91.99.85.48:/home/kids-toys/app/backend/
ssh root@91.99.85.48 "cd /home/kids-toys/app/backend && node test-new-google-oauth.js"

# Очистка временных файлов
rm test-new-google-oauth.js

log "=================================================="
log "✅ Google OAuth настройки обновлены успешно!"
log ""
log "🎯 Следующие шаги:"
log "1. Проверьте настройки в Google Cloud Console"
log "2. Убедитесь, что redirect URI настроен правильно:"
log "   https://simba-tzatzuim.co.il/api/auth/google/callback"
log "3. Протестируйте авторизацию на сайте"
log "4. Проверьте email уведомления"
log ""
log "🌐 Тестирование:"
log "• Откройте: https://simba-tzatzuim.co.il"
log "• Нажмите 'Войти' → 'Войти через Google'"
log "• Проверьте успешную авторизацию"
log ""
log "📞 Если возникли проблемы:"
log "• Проверьте логи: pm2 logs backend"
log "• Проверьте настройки в Google Console"
log "• Убедитесь в правильности redirect URI"









