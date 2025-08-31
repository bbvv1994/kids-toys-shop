#!/bin/bash

# 🧹 Полная очистка сервера Hetzner
# Запускать от имени root: sudo bash clean-server.sh

set -e

echo "🧹 Начинаем полную очистку сервера..."

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

# Проверка, что скрипт запущен от root
if [[ $EUID -ne 0 ]]; then
   error "Этот скрипт должен быть запущен от имени root"
   exit 1
fi

# Подтверждение очистки
echo "⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные и настройки!"
read -p "Вы уверены? Введите 'YES' для подтверждения: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "Очистка отменена"
    exit 0
fi

# Остановка сервисов
log "Остановка сервисов..."

# Остановка PM2 процессов
if command -v pm2 &> /dev/null; then
    su - kids-toys -c "pm2 delete all" 2>/dev/null || true
    su - kids-toys -c "pm2 kill" 2>/dev/null || true
    log "PM2 процессы остановлены"
fi

# Остановка Nginx
if systemctl is-active --quiet nginx; then
    systemctl stop nginx
    systemctl disable nginx
    log "Nginx остановлен"
fi

# Остановка PostgreSQL
if systemctl is-active --quiet postgresql; then
    systemctl stop postgresql
    systemctl disable postgresql
    log "PostgreSQL остановлен"
fi

# Удаление пользователя kids-toys
log "Удаление пользователя kids-toys..."
if id "kids-toys" &>/dev/null; then
    # Удаление всех файлов пользователя
    rm -rf /home/kids-toys
    userdel -r kids-toys 2>/dev/null || true
    log "Пользователь kids-toys удален"
fi

# Удаление приложений
log "Удаление приложений..."

# Удаление Node.js
if command -v node &> /dev/null; then
    apt remove --purge -y nodejs npm
    apt autoremove -y
    rm -rf /usr/local/bin/npm
    rm -rf /usr/local/bin/npx
    rm -rf /usr/local/lib/node_modules
    log "Node.js удален"
fi

# Удаление PostgreSQL
if dpkg -l | grep -q postgresql; then
    apt remove --purge -y postgresql postgresql-contrib postgresql-client
    apt autoremove -y
    rm -rf /var/lib/postgresql
    rm -rf /var/log/postgresql
    rm -rf /etc/postgresql
    log "PostgreSQL удален"
fi

# Удаление Nginx
if dpkg -l | grep -q nginx; then
    apt remove --purge -y nginx nginx-common nginx-full
    apt autoremove -y
    rm -rf /etc/nginx
    rm -rf /var/log/nginx
    rm -rf /var/www
    log "Nginx удален"
fi

# Удаление PM2
if command -v pm2 &> /dev/null; then
    npm uninstall -g pm2
    rm -rf ~/.pm2
    log "PM2 удален"
fi

# Удаление Certbot
if dpkg -l | grep -q certbot; then
    apt remove --purge -y certbot python3-certbot-nginx
    apt autoremove -y
    log "Certbot удален"
fi

# Удаление UFW
if dpkg -l | grep -q ufw; then
    apt remove --purge -y ufw
    apt autoremove -y
    log "UFW удален"
fi

# Очистка конфигураций
log "Очистка конфигураций..."

# Удаление конфигураций Nginx
rm -rf /etc/nginx/sites-available/kids-toys-shop
rm -rf /etc/nginx/sites-enabled/kids-toys-shop

# Удаление логов
rm -rf /var/log/*.log
rm -rf /var/log/nginx
rm -rf /var/log/postgresql

# Очистка временных файлов
log "Очистка временных файлов..."
apt clean
apt autoremove -y
rm -rf /tmp/*
rm -rf /var/tmp/*

# Сброс firewall
log "Сброс firewall..."
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

# Очистка истории команд
log "Очистка истории команд..."
rm -f /root/.bash_history
rm -f /home/*/.bash_history

# Очистка SSH ключей (оставляем только текущий)
log "Очистка SSH ключей..."
find /root/.ssh -name "*.pub" -delete 2>/dev/null || true

# Финальная очистка
log "Финальная очистка..."
apt update
apt upgrade -y

log "🎉 Сервер полностью очищен!"
log "🚀 Теперь можно запускать скрипт настройки заново"

echo ""
echo "✅ Очистка завершена!"
echo "🚀 Теперь запустите:"
echo "bash quick-start.sh"
echo ""
echo "📝 Сервер готов к чистой установке"
