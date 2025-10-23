#!/bin/bash

# Скрипт для исправления проблемы с кодировкой имен пользователей в Google OAuth
# Автор: AI Assistant
# Дата: $(date)

echo "🔧 Исправление проблемы с кодировкой OAuth имен пользователей"
echo "=============================================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверяем подключение к серверу
log_info "Проверяем подключение к серверу..."
if ! ssh -o ConnectTimeout=10 root@91.99.85.48 "echo 'Connected'" > /dev/null 2>&1; then
    log_error "Не удается подключиться к серверу 91.99.85.48"
    exit 1
fi
log_success "Подключение к серверу установлено"

# Проверяем статус PM2
log_info "Проверяем статус приложений PM2..."
PM2_STATUS=$(ssh root@91.99.85.48 "cd /home/kids-toys/app && pm2 status --no-color" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$PM2_STATUS"
    log_success "PM2 статус получен"
else
    log_warning "Не удалось получить статус PM2"
fi

# Проверяем файлы OAuth на сервере
log_info "Проверяем файлы OAuth на сервере..."

# Проверяем OAuthSuccessPage.js
if ssh root@91.99.85.48 "test -f /home/kids-toys/app/frontend/src/components/OAuthSuccessPage.js"; then
    log_success "OAuthSuccessPage.js найден на сервере"
    
    # Проверяем наличие UTF-8 декодирования
    if ssh root@91.99.85.48 "grep -q 'TextDecoder' /home/kids-toys/app/frontend/src/components/OAuthSuccessPage.js"; then
        log_success "UTF-8 декодирование уже настроено в OAuthSuccessPage.js"
    else
        log_warning "UTF-8 декодирование не найдено в OAuthSuccessPage.js"
        log_info "Копируем исправленную версию..."
        scp frontend/src/components/OAuthSuccessPage.js root@91.99.85.48:/home/kids-toys/app/frontend/src/components/
        if [ $? -eq 0 ]; then
            log_success "OAuthSuccessPage.js обновлен"
        else
            log_error "Ошибка при копировании OAuthSuccessPage.js"
        fi
    fi
else
    log_error "OAuthSuccessPage.js не найден на сервере"
fi

# Проверяем файлы переводов
log_info "Проверяем файлы переводов..."

for lang in he ru; do
    if ssh root@91.99.85.48 "test -f /home/kids-toys/app/frontend/src/i18n/locales/${lang}.json"; then
        log_success "Файл переводов ${lang}.json найден"
        
        # Проверяем наличие секции oauthError
        if ssh root@91.99.85.48 "grep -q 'oauthError' /home/kids-toys/app/frontend/src/i18n/locales/${lang}.json"; then
            log_success "Секция oauthError найдена в ${lang}.json"
        else
            log_warning "Секция oauthError не найдена в ${lang}.json"
            log_info "Копируем исправленную версию..."
            scp frontend/src/i18n/locales/${lang}.json root@91.99.85.48:/home/kids-toys/app/frontend/src/i18n/locales/
            if [ $? -eq 0 ]; then
                log_success "${lang}.json обновлен"
            else
                log_error "Ошибка при копировании ${lang}.json"
            fi
        fi
    else
        log_error "Файл переводов ${lang}.json не найден на сервере"
    fi
done

# Проверяем бэкенд на наличие функции decodeUserName
log_info "Проверяем бэкенд на наличие функции decodeUserName..."
if ssh root@91.99.85.48 "grep -q 'decodeUserName' /home/kids-toys/app/backend/src/index.js"; then
    log_success "Функция decodeUserName найдена в бэкенде"
else
    log_warning "Функция decodeUserName не найдена в бэкенде"
    log_info "Копируем исправленную версию бэкенда..."
    scp backend/src/index.js root@91.99.85.48:/home/kids-toys/app/backend/src/
    if [ $? -eq 0 ]; then
        log_success "Бэкенд обновлен"
    else
        log_error "Ошибка при копировании бэкенда"
    fi
fi

# Пересобираем фронтенд
log_info "Пересобираем фронтенд..."
BUILD_OUTPUT=$(ssh root@91.99.85.48 "cd /home/kids-toys/app/frontend && npm run build" 2>&1)
if [ $? -eq 0 ]; then
    log_success "Фронтенд успешно пересобран"
else
    log_error "Ошибка при сборке фронтенда:"
    echo "$BUILD_OUTPUT"
fi

# Перезапускаем приложения
log_info "Перезапускаем приложения..."
ssh root@91.99.85.48 "cd /home/kids-toys/app && pm2 restart all"
if [ $? -eq 0 ]; then
    log_success "Приложения перезапущены"
else
    log_warning "Ошибка при перезапуске приложений"
fi

# Проверяем финальный статус
log_info "Проверяем финальный статус приложений..."
ssh root@91.99.85.48 "cd /home/kids-toys/app && pm2 status --no-color"

echo ""
log_success "Исправление завершено!"
echo ""
log_info "Теперь проверьте сайт: https://simba-tzatzuim.co.il"
log_info "1. Войдите через Google с именем на иврите/русском"
log_info "2. Проверьте, что имя отображается корректно в аппбаре"
log_info "3. Если проблема остается, проверьте логи:"
echo "   ssh root@91.99.85.48 'cd /home/kids-toys/app && pm2 logs backend'"

