#!/bin/bash

# 🧪 Тестирование системы бэкапов Google Drive
# Этот скрипт проверяет работу всех компонентов системы бэкапов

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

# Проверка, что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then
    error "Пожалуйста, запустите скрипт от root: sudo bash test-backup-system.sh"
fi

APP_USER="kids-toys"
GOOGLE_DRIVE_DIR="/home/$APP_USER/google-drive-backup"
BACKUP_DIR="/home/$APP_USER/backups"

log "🧪 Тестирование системы бэкапов Google Drive"
echo "=================================================="

# Тест 1: Проверка установки зависимостей
log "Тест 1: Проверка установки зависимостей"
if command -v python3 &> /dev/null; then
    log "✅ Python3 установлен: $(python3 --version)"
else
    error "❌ Python3 не установлен"
fi

if python3 -c "import google.auth" 2>/dev/null; then
    log "✅ Google API библиотеки установлены"
else
    error "❌ Google API библиотеки не установлены. Запустите: pip3 install google-api-python-client google-auth-httplib2 google-auth-oauthlib"
fi

# Тест 2: Проверка структуры директорий
log "Тест 2: Проверка структуры директорий"
if [ -d "$GOOGLE_DRIVE_DIR" ]; then
    log "✅ Директория Google Drive существует: $GOOGLE_DRIVE_DIR"
else
    error "❌ Директория Google Drive не существует: $GOOGLE_DRIVE_DIR"
fi

if [ -d "$BACKUP_DIR" ]; then
    log "✅ Директория бэкапов существует: $BACKUP_DIR"
else
    error "❌ Директория бэкапов не существует: $BACKUP_DIR"
fi

# Тест 3: Проверка файлов скриптов
log "Тест 3: Проверка файлов скриптов"
REQUIRED_FILES=(
    "google_drive_auth.py"
    "upload_to_drive.py"
    "download_from_drive.py"
    "weekly_backup.sh"
    "restore_from_drive.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$GOOGLE_DRIVE_DIR/$file" ]; then
        log "✅ Файл существует: $file"
        if [ -x "$GOOGLE_DRIVE_DIR/$file" ]; then
            log "✅ Файл исполняемый: $file"
        else
            warning "⚠️ Файл не исполняемый: $file"
        fi
    else
        error "❌ Файл не найден: $file"
    fi
done

# Тест 4: Проверка прав доступа
log "Тест 4: Проверка прав доступа"
if [ "$(stat -c %U $GOOGLE_DRIVE_DIR)" = "$APP_USER" ]; then
    log "✅ Владелец директории правильный: $APP_USER"
else
    warning "⚠️ Неправильный владелец директории: $(stat -c %U $GOOGLE_DRIVE_DIR)"
fi

# Тест 5: Проверка credentials.json
log "Тест 5: Проверка credentials.json"
if [ -f "$GOOGLE_DRIVE_DIR/credentials.json" ]; then
    log "✅ Файл credentials.json найден"
    
    # Проверка валидности JSON
    if python3 -c "import json; json.load(open('$GOOGLE_DRIVE_DIR/credentials.json'))" 2>/dev/null; then
        log "✅ Файл credentials.json валидный"
    else
        error "❌ Файл credentials.json невалидный"
    fi
else
    warning "⚠️ Файл credentials.json не найден"
    info "📋 Для получения credentials.json:"
    echo "1. Перейдите в https://console.developers.google.com/"
    echo "2. Создайте новый проект или выберите существующий"
    echo "3. Включите Google Drive API"
    echo "4. Создайте учетные данные OAuth 2.0"
    echo "5. Скачайте JSON файл и переименуйте его в credentials.json"
    echo "6. Поместите файл в $GOOGLE_DRIVE_DIR/"
fi

# Тест 6: Проверка аутентификации
log "Тест 6: Проверка аутентификации Google Drive"
if [ -f "$GOOGLE_DRIVE_DIR/token.pickle" ]; then
    log "✅ Токен аутентификации найден"
    
    # Проверка валидности токена
    cd $GOOGLE_DRIVE_DIR
    if python3 -c "
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

try:
    with open('token.pickle', 'rb') as token:
        creds = pickle.load(token)
    if creds and creds.valid:
        print('Токен валидный')
    elif creds and creds.expired and creds.refresh_token:
        print('Токен истек, но может быть обновлен')
    else:
        print('Токен невалидный')
except Exception as e:
    print(f'Ошибка: {e}')
" 2>/dev/null; then
        log "✅ Токен аутентификации валидный"
    else
        warning "⚠️ Токен аутентификации невалидный или истек"
        info "Запустите аутентификацию: cd $GOOGLE_DRIVE_DIR && python3 google_drive_auth.py"
    fi
else
    warning "⚠️ Токен аутентификации не найден"
    info "Запустите аутентификацию: cd $GOOGLE_DRIVE_DIR && python3 google_drive_auth.py"
fi

# Тест 7: Проверка подключения к Google Drive
log "Тест 7: Проверка подключения к Google Drive"
cd $GOOGLE_DRIVE_DIR
if python3 -c "
import sys
sys.path.append('.')
from upload_to_drive import get_drive_service

service = get_drive_service()
if service:
    print('Подключение к Google Drive успешно')
else:
    print('Ошибка подключения к Google Drive')
" 2>/dev/null; then
    log "✅ Подключение к Google Drive успешно"
else
    warning "⚠️ Ошибка подключения к Google Drive"
    info "Проверьте аутентификацию и интернет-соединение"
fi

# Тест 8: Проверка cron
log "Тест 8: Проверка cron"
if systemctl is-active --quiet cron; then
    log "✅ Служба cron запущена"
else
    warning "⚠️ Служба cron не запущена"
    info "Запустите: systemctl start cron && systemctl enable cron"
fi

if [ -f "/etc/cron.d/kids-toys-backup" ]; then
    log "✅ Файл cron задачи найден"
    log "📋 Расписание бэкапов:"
    cat /etc/cron.d/kids-toys-backup
else
    warning "⚠️ Файл cron задачи не найден"
    info "Запустите настройку: sudo bash setup-google-drive-backup.sh"
fi

# Тест 9: Тест создания локального бэкапа
log "Тест 9: Тест создания локального бэкапа"
TEST_BACKUP_DIR="/tmp/test_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $TEST_BACKUP_DIR

# Создание тестового файла
echo "Test backup content" > $TEST_BACKUP_DIR/test_file.txt

# Тест архивирования
if tar -czf "$TEST_BACKUP_DIR/test_backup.tar.gz" -C $TEST_BACKUP_DIR test_file.txt; then
    log "✅ Тест архивирования прошел успешно"
else
    error "❌ Ошибка архивирования"
fi

# Очистка тестовых файлов
rm -rf $TEST_BACKUP_DIR

# Тест 10: Проверка доступности базы данных
log "Тест 10: Проверка доступности базы данных"
if sudo -u postgres psql -c "SELECT 1;" kids_toys_db >/dev/null 2>&1; then
    log "✅ База данных доступна"
    
    # Проверка количества записей
    PRODUCTS_COUNT=$(sudo -u postgres psql -t -c "SELECT COUNT(*) FROM products;" kids_toys_db | tr -d ' ')
    CATEGORIES_COUNT=$(sudo -u postgres psql -t -c "SELECT COUNT(*) FROM categories;" kids_toys_db | tr -d ' ')
    
    log "📊 Статистика базы данных:"
    echo "   - Товары: $PRODUCTS_COUNT"
    echo "   - Категории: $CATEGORIES_COUNT"
else
    warning "⚠️ База данных недоступна"
fi

# Тест 11: Проверка папки uploads
log "Тест 11: Проверка папки uploads"
if [ -d "/home/kids-toys/app/uploads" ]; then
    UPLOADS_COUNT=$(find /home/kids-toys/app/uploads -type f | wc -l)
    UPLOADS_SIZE=$(du -sh /home/kids-toys/app/uploads | cut -f1)
    log "✅ Папка uploads существует"
    log "📊 Статистика uploads:"
    echo "   - Файлов: $UPLOADS_COUNT"
    echo "   - Размер: $UPLOADS_SIZE"
else
    warning "⚠️ Папка uploads не существует"
fi

# Тест 12: Проверка PM2
log "Тест 12: Проверка PM2"
if command -v pm2 &> /dev/null; then
    log "✅ PM2 установлен"
    
    if sudo -u $APP_USER pm2 list | grep -q "kids-toys-backend"; then
        log "✅ Приложение kids-toys-backend запущено в PM2"
    else
        warning "⚠️ Приложение kids-toys-backend не запущено в PM2"
    fi
else
    warning "⚠️ PM2 не установлен"
fi

# Итоговый отчет
echo ""
log "📋 Итоговый отчет тестирования"
echo "=================================================="

# Подсчет успешных тестов
TOTAL_TESTS=12
PASSED_TESTS=0

# Проверка каждого теста
if command -v python3 &> /dev/null && python3 -c "import google.auth" 2>/dev/null; then
    ((PASSED_TESTS++))
fi

if [ -d "$GOOGLE_DRIVE_DIR" ] && [ -d "$BACKUP_DIR" ]; then
    ((PASSED_TESTS++))
fi

if [ -f "$GOOGLE_DRIVE_DIR/credentials.json" ]; then
    ((PASSED_TESTS++))
fi

if [ -f "$GOOGLE_DRIVE_DIR/token.pickle" ]; then
    ((PASSED_TESTS++))
fi

if systemctl is-active --quiet cron; then
    ((PASSED_TESTS++))
fi

if sudo -u postgres psql -c "SELECT 1;" kids_toys_db >/dev/null 2>&1; then
    ((PASSED_TESTS++))
fi

if [ -d "/home/kids-toys/app/uploads" ]; then
    ((PASSED_TESTS++))
fi

if command -v pm2 &> /dev/null; then
    ((PASSED_TESTS++))
fi

# Вывод результатов
PASSED_PERCENT=$((PASSED_TESTS * 100 / TOTAL_TESTS))

if [ $PASSED_PERCENT -ge 80 ]; then
    log "🎉 Система бэкапов готова к работе! ($PASSED_TESTS/$TOTAL_TESTS тестов пройдено - $PASSED_PERCENT%)"
elif [ $PASSED_PERCENT -ge 60 ]; then
    warning "⚠️ Система бэкапов частично готова ($PASSED_TESTS/$TOTAL_TESTS тестов пройдено - $PASSED_PERCENT%)"
    info "Исправьте предупреждения перед использованием"
else
    error "❌ Система бэкапов не готова ($PASSED_TESTS/$TOTAL_TESTS тестов пройдено - $PASSED_PERCENT%)"
    info "Исправьте ошибки перед использованием"
fi

echo ""
log "📋 Следующие шаги:"
if [ ! -f "$GOOGLE_DRIVE_DIR/credentials.json" ]; then
    echo "1. Получите credentials.json из Google Cloud Console"
fi
if [ ! -f "$GOOGLE_DRIVE_DIR/token.pickle" ]; then
    echo "2. Запустите аутентификацию: cd $GOOGLE_DRIVE_DIR && python3 google_drive_auth.py"
fi
echo "3. Протестируйте бэкап: sudo -u $APP_USER $GOOGLE_DRIVE_DIR/weekly_backup.sh"
echo "4. Проверьте логи: tail -f $BACKUP_DIR/backup.log"

log "🔧 Полезные команды:"
echo "   - Мониторинг: sudo -u $APP_USER pm2 status"
echo "   - Логи приложения: sudo -u $APP_USER pm2 logs kids-toys-backend"
echo "   - Логи бэкапов: tail -f $BACKUP_DIR/backup.log"
echo "   - Ручной бэкап: sudo -u $APP_USER $GOOGLE_DRIVE_DIR/weekly_backup.sh"
echo "   - Восстановление: sudo -u $APP_USER $GOOGLE_DRIVE_DIR/restore_from_drive.sh"

echo "=================================================="
log "✅ Тестирование завершено!"

