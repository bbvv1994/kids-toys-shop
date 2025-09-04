#!/bin/bash

# 🚀 Полная автоматическая настройка сервера Hetzner для Kids Toys Shop (Intel)
# Запускать от имени root: sudo bash hetzner-setup.sh

set -e  # Остановка при ошибке

echo "🚀 Начинаем полную настройку сервера Hetzner для Kids Toys Shop..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Проверка, что скрипт запущен от root
if [[ $EUID -ne 0 ]]; then
   error "Этот скрипт должен быть запущен от имени root"
   exit 1
fi

# Переменные конфигурации
DOMAIN=""
DB_PASSWORD=""
JWT_SECRET=""
GITHUB_REPO="https://github.com/bbvv1994/kids-toys-shop.git"

# Функция для получения пользовательского ввода
get_user_input() {
    echo
    read -p "Введите ваш домен (например: example.com) или нажмите Enter: " DOMAIN
    read -s -p "Введите пароль для базы данных: " DB_PASSWORD
    echo
    read -s -p "Введите JWT секрет (или нажмите Enter для автогенерации): " JWT_SECRET
    echo
    
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 64)
        log "JWT секрет автогенерирован"
    fi
}

# Функция для обновления системы
update_system() {
    log "Обновление системы..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    log "Система обновлена"
}

# Функция для настройки firewall
setup_firewall() {
    log "Настройка firewall..."
    apt install -y ufw
    
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    ufw allow 5000
    ufw --force enable
    
    log "Firewall настроен"
}

# Функция для создания пользователя
create_user() {
    log "Создание пользователя kids-toys..."
    
    if id "kids-toys" &>/dev/null; then
        warn "Пользователь kids-toys уже существует"
    else
        adduser --disabled-password --gecos "" kids-toys
        usermod -aG sudo kids-toys
        log "Пользователь kids-toys создан"
    fi
}

# Функция для установки Node.js (Intel совместимая версия)
install_nodejs() {
    log "Установка Node.js для Intel..."
    
    # Установка Node.js 18.x LTS для Intel
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Проверка архитектуры
    ARCH=$(uname -m)
    log "Архитектура процессора: $ARCH"
    
    log "Node.js установлен: $(node --version)"
    log "npm установлен: $(npm --version)"
}

# Функция для установки PostgreSQL
install_postgresql() {
    log "Установка PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    
    systemctl start postgresql
    systemctl enable postgresql
    
    # Создание базы данных и пользователя
    sudo -u postgres psql -c "CREATE DATABASE kids_toys_db;" || warn "База данных уже существует"
    sudo -u postgres psql -c "CREATE USER kids_toys_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" || warn "Пользователь уже существует"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kids_toys_db TO kids_toys_user;"
    sudo -u postgres psql -c "ALTER USER kids_toys_user CREATEDB;"
    
    log "PostgreSQL установлен и настроен"
}

# Функция для установки Nginx
install_nginx() {
    log "Установка Nginx..."
    apt install -y nginx
    
    systemctl start nginx
    systemctl enable nginx
    
    log "Nginx установлен"
}

# Функция для установки PM2
install_pm2() {
    log "Установка PM2..."
    npm install -g pm2
    
    log "PM2 установлен"
}

# Функция для установки Certbot
install_certbot() {
    log "Установка Certbot..."
    apt install -y certbot python3-certbot-nginx
    
    log "Certbot установлен"
}

# Функция для клонирования репозитория
clone_repository() {
    log "Клонирование репозитория..."
    
    su - kids-toys -c "
        mkdir -p /home/kids-toys/app
        cd /home/kids-toys/app
        git clone $GITHUB_REPO .
    "
    
    log "Репозиторий склонирован"
}

# Функция для настройки переменных окружения
setup_environment() {
    log "Настройка переменных окружения..."
    
    su - kids-toys -c "
        cd /home/kids-toys/app/backend
        cat > .env << 'ENV_EOF'
# База данных
DATABASE_URL=\"postgresql://kids_toys_user:$DB_PASSWORD@localhost:5432/kids_toys_db\"

# JWT
JWT_SECRET=\"$JWT_SECRET\"

# Окружение
NODE_ENV=\"production\"
PORT=5000

# Frontend URL
FRONTEND_URL=\"https://$DOMAIN\"
ENV_EOF
    "
    
    log "Переменные окружения настроены"
}

# Функция для установки зависимостей
install_dependencies() {
    log "Установка зависимостей backend..."
    su - kids-toys -c "
        cd /home/kids-toys/app/backend
        npm install
        npx prisma generate
    "
    
    log "Зависимости backend установлены"
    
    log "Установка зависимостей frontend..."
    su - kids-toys -c "
        cd /home/kids-toys/app/frontend
        npm install
        npm run build
    "
    
    log "Зависимости frontend установлены"
}

# Функция для настройки базы данных
setup_database() {
    log "Настройка базы данных..."
    
    su - kids-toys -c "
        cd /home/kids-toys/app/backend
        npx prisma migrate deploy
    "
    
    log "База данных настроена"
}

# Функция для настройки Nginx
setup_nginx() {
    log "Настройка Nginx..."
    
    # Создание конфигурации
    cat > /etc/nginx/sites-available/kids-toys-shop << 'NGINX_EOF'
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # Frontend (статичные файлы)
    location / {
        root /home/kids-toys/app/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }
        
        # Кэширование HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Загруженные файлы
    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Кэширование изображений
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
NGINX_EOF

    # Активация конфигурации
    ln -sf /etc/nginx/sites-available/kids-toys-shop /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Проверка конфигурации
    nginx -t
    
    # Перезагрузка Nginx
    systemctl reload nginx
    
    log "Nginx настроен"
}

# Функция для настройки PM2
setup_pm2() {
    log "Настройка PM2..."
    
    su - kids-toys -c "
        cd /home/kids-toys/app
        cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'kids-toys-backend',
      script: './backend/src/index.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
PM2_EOF

        mkdir -p backend/logs
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
    "
    
    log "PM2 настроен"
}

# Функция для создания скриптов управления
create_management_scripts() {
    log "Создание скриптов управления..."
    
    su - kids-toys -c "
        cd /home/kids-toys
        
        # Скрипт мониторинга
        cat > monitor.sh << 'MONITOR_EOF'
#!/bin/bash
echo \"=== Kids Toys Shop Server Status ===\"
echo \"Date: \$(date)\"
echo \"Uptime: \$(uptime)\"
echo \"Memory: \$(free -h)\"
echo \"Disk: \$(df -h /)\"
echo \"PM2 Status:\"
pm2 status
echo \"Nginx Status:\"
sudo systemctl status nginx --no-pager
echo \"PostgreSQL Status:\"
sudo systemctl status postgresql --no-pager
MONITOR_EOF

        # Скрипт резервного копирования
        cat > backup.sh << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR=\"/home/kids-toys/backups\"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Резервное копирование базы данных
pg_dump -U kids_toys_user -h localhost kids_toys_db > \$BACKUP_DIR/db_backup_\$DATE.sql

# Резервное копирование загруженных файлов
tar -czf \$BACKUP_DIR/uploads_backup_\$DATE.tar.gz -C /home/kids-toys/app/backend uploads/

# Резервное копирование конфигурации
tar -czf \$BACKUP_DIR/config_backup_\$DATE.tar.gz -C /home/kids-toys/app backend/.env backend/prisma/

# Удаление старых резервных копий (старше 30 дней)
find \$BACKUP_DIR -name \"*.sql\" -mtime +30 -delete
find \$BACKUP_DIR -name \"*.tar.gz\" -mtime +30 -delete

echo \"Backup completed: \$DATE\"
BACKUP_EOF

        # Скрипт деплоя
        cat > deploy.sh << 'DEPLOY_EOF'
#!/bin/bash
echo \"Starting deployment...\"

cd /home/kids-toys/app

# Создание резервной копии перед обновлением
/home/kids-toys/backup.sh

# Получение обновлений
git pull origin main

# Установка зависимостей backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
cd ..

# Установка зависимостей frontend
cd frontend
npm install
npm run build
cd ..

# Перезапуск backend
pm2 restart kids-toys-backend

echo \"Deployment completed!\"
DEPLOY_EOF

        # Делаем скрипты исполняемыми
        chmod +x monitor.sh backup.sh deploy.sh
    "
    
    log "Скрипты управления созданы"
}

# Функция для настройки SSL
setup_ssl() {
    log "Настройка SSL сертификата..."
    
    if [ -n "$DOMAIN" ]; then
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || warn "Не удалось получить SSL сертификат. Проверьте домен и DNS настройки."
    else
        warn "Домен не указан, SSL не настроен"
    fi
}

# Функция для финальной проверки
final_check() {
    log "Выполнение финальной проверки..."
    
    # Проверка статуса сервисов
    if systemctl is-active --quiet nginx; then
        log "✅ Nginx работает"
    else
        error "❌ Nginx не работает"
    fi
    
    if systemctl is-active --quiet postgresql; then
        log "✅ PostgreSQL работает"
    else
        error "❌ PostgreSQL не работает"
    fi
    
    # Проверка PM2
    su - kids-toys -c "pm2 status" | grep -q "kids-toys-backend" && log "✅ PM2 процесс работает" || error "❌ PM2 процесс не работает"
    
    log "🎉 Настройка сервера завершена!"
    if [ -n "$DOMAIN" ]; then
        log "🌐 Ваше приложение будет доступно по адресу: https://$DOMAIN"
    else
        log "🌐 Ваше приложение будет доступно по адресу: http://$(hostname -I | awk '{print $1}'):5000"
    fi
    log "📊 Для мониторинга используйте: sudo -u kids-toys /home/kids-toys/monitor.sh"
    log "🔄 Для обновления используйте: sudo -u kids-toys /home/kids-toys/deploy.sh"
    log "💾 Для резервного копирования используйте: sudo -u kids-toys /home/kids-toys/backup.sh"
}

# Основная функция
main() {
    log "Начинаем полную автоматическую настройку сервера Hetzner (Intel)..."
    
    get_user_input
    update_system
    setup_firewall
    create_user
    install_nodejs
    install_postgresql
    install_nginx
    install_pm2
    install_certbot
    clone_repository
    setup_environment
    install_dependencies
    setup_database
    setup_nginx
    setup_pm2
    create_management_scripts
    setup_ssl
    final_check
    
    log "🎯 Настройка завершена! Теперь вы можете импортировать данные и начать использовать приложение."
}

# Запуск основной функции
main "$@"
