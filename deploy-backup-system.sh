#!/bin/bash

# 🚀 Развертывание системы бэкапов на сервере
# Этот скрипт загружает и настраивает систему бэкапов на удаленном сервере

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
if [ $# -eq 0 ]; then
    echo "Использование: $0 <SERVER_IP> [SSH_USER]"
    echo ""
    echo "Примеры:"
    echo "  $0 123.456.789.012                    # Подключение как root"
    echo "  $0 123.456.789.012 ubuntu             # Подключение как ubuntu"
    echo ""
    echo "Этот скрипт развернет систему бэкапов на удаленном сервере"
    exit 1
fi

SERVER_IP=$1
SSH_USER=${2:-root}

log "🚀 Развертывание системы бэкапов на сервере"
log "📡 Сервер: $SERVER_IP"
log "👤 Пользователь: $SSH_USER"
echo "=================================================="

# Проверка подключения к серверу
log "Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SSH_USER@$SERVER_IP "echo 'Подключение успешно'" 2>/dev/null; then
    error "Не удается подключиться к серверу $SERVER_IP. Проверьте:"
    echo "1. IP адрес сервера"
    echo "2. SSH ключ настроен"
    echo "3. Сервер доступен"
fi

# Загрузка скриптов на сервер
log "Загрузка скриптов на сервер..."
scp setup-google-drive-backup.sh $SSH_USER@$SERVER_IP:/tmp/
scp test-backup-system.sh $SSH_USER@$SERVER_IP:/tmp/
scp GOOGLE_DRIVE_BACKUP_SETUP.md $SSH_USER@$SERVER_IP:/tmp/

# Выполнение установки на сервере
log "Выполнение установки на сервере..."
ssh $SSH_USER@$SERVER_IP << 'EOF'
    # Переход в root если необходимо
    if [ "$EUID" -ne 0 ]; then
        sudo bash /tmp/setup-google-drive-backup.sh
    else
        bash /tmp/setup-google-drive-backup.sh
    fi
EOF

# Перемещение документации
log "Перемещение документации..."
ssh $SSH_USER@$SERVER_IP << 'EOF'
    sudo mv /tmp/GOOGLE_DRIVE_BACKUP_SETUP.md /home/kids-toys/google-drive-backup/
    sudo chown kids-toys:kids-toys /home/kids-toys/google-drive-backup/GOOGLE_DRIVE_BACKUP_SETUP.md
EOF

# Очистка временных файлов
log "Очистка временных файлов..."
ssh $SSH_USER@$SERVER_IP "rm -f /tmp/setup-google-drive-backup.sh /tmp/test-backup-system.sh /tmp/GOOGLE_DRIVE_BACKUP_SETUP.md"

# Запуск тестирования
log "Запуск тестирования системы..."
ssh $SSH_USER@$SERVER_IP "sudo bash /home/kids-toys/google-drive-backup/test-backup-system.sh"

log "✅ Развертывание системы бэкапов завершено!"
log "📋 Следующие шаги на сервере:"
echo "1. Получите credentials.json из Google Cloud Console"
echo "2. Загрузите файл на сервер:"
echo "   scp credentials.json $SSH_USER@$SERVER_IP:/home/kids-toys/google-drive-backup/"
echo "3. Запустите аутентификацию:"
echo "   ssh $SSH_USER@$SERVER_IP"
echo "   cd /home/kids-toys/google-drive-backup"
echo "   python3 google_drive_auth.py"
echo "4. Протестируйте бэкап:"
echo "   sudo -u kids-toys /home/kids-toys/google-drive-backup/weekly_backup.sh"

log "📖 Документация: /home/kids-toys/google-drive-backup/GOOGLE_DRIVE_BACKUP_SETUP.md"
log "🧪 Тестирование: sudo bash /home/kids-toys/google-drive-backup/test-backup-system.sh"

echo "=================================================="
log "🎉 Система бэкапов развернута на сервере!"

