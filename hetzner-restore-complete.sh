#!/bin/bash

# 🚀 Полное восстановление Kids Toys Shop на Hetzner с коммитом b0b2411
# Включает восстановление базы данных, изображений и всех файлов

set -e  # Остановка при ошибке

echo "🚀 Начинаем полное восстановление Kids Toys Shop на Hetzner"
echo "📅 Дата: $(date)"
echo "🎯 Коммит: b0b241184133ae08c5d3f01ba4816b3a4c0afdb1"
echo "=================================================="

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
    error "Пожалуйста, запустите скрипт от root: sudo bash hetzner-restore-complete.sh"
fi

# Переменные
APP_USER="kids-toys"
APP_DIR="/home/$APP_USER/app"
BACKUP_DIR="/home/$APP_USER/backups"
COMMIT_HASH="b0b241184133ae08c5d3f01ba4816b3a4c0afdb1"
DB_NAME="kids_toys_db"
DB_USER="kids_toys_user"

log "Начинаем восстановление..."

# Шаг 1: Обновление системы
log "Шаг 1: Обновление системы"
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Шаг 2: Установка Node.js
log "Шаг 2: Установка Node.js 18 LTS"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Проверка версии
NODE_VERSION=$(node --version)
log "Node.js установлен: $NODE_VERSION"

# Шаг 3: Установка PostgreSQL
log "Шаг 3: Установка PostgreSQL"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Создание базы данных и пользователя
log "Создание базы данных и пользователя"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

# Шаг 4: Установка Nginx
log "Шаг 4: Установка Nginx"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Шаг 5: Установка PM2
log "Шаг 5: Установка PM2"
npm install -g pm2

# Шаг 6: Создание пользователя приложения
log "Шаг 6: Создание пользователя приложения"
if ! id "$APP_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $APP_USER
    usermod -aG sudo $APP_USER
    log "Пользователь $APP_USER создан"
else
    log "Пользователь $APP_USER уже существует"
fi

# Шаг 7: Настройка firewall
log "Шаг 7: Настройка firewall"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 5000
ufw --force enable

# Шаг 8: Клонирование репозитория
log "Шаг 8: Клонирование репозитория"
if [ -d "$APP_DIR" ]; then
    warning "Директория $APP_DIR уже существует, удаляем..."
    rm -rf $APP_DIR
fi

mkdir -p $APP_DIR
cd $APP_DIR

# Клонирование репозитория
git clone https://github.com/bbvv1994/kids-toys-shop.git .

# Переключение на нужный коммит
log "Переключение на коммит $COMMIT_HASH"
git checkout $COMMIT_HASH

# Установка владельца файлов
chown -R $APP_USER:$APP_USER $APP_DIR

# Шаг 9: Создание .env файла
log "Шаг 9: Создание .env файла"
cat > backend/.env << EOF
# База данных
DATABASE_URL="postgresql://$DB_USER:secure_password_123@localhost:5432/$DB_NAME"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random-$(date +%s)"

# Окружение
NODE_ENV="production"
PORT=5000

# Frontend URL (замените на ваш домен)
FRONTEND_URL="https://your-domain.com"

# Cloudinary (опционально - для облачного хранения изображений)
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"

# Email (Brevo) - опционально
# BREVO_API_KEY="your-brevo-api-key"

# Telegram - опционально
# TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
# TELEGRAM_CHAT_ID="your-telegram-chat-id"
EOF

# Установка владельца .env файла
chown $APP_USER:$APP_USER backend/.env
chmod 600 backend/.env

# Шаг 10: Установка зависимостей
log "Шаг 10: Установка зависимостей"
cd backend
sudo -u $APP_USER npm install
sudo -u $APP_USER npx prisma generate
sudo -u $APP_USER npx prisma migrate deploy

# Шаг 11: Сборка frontend
log "Шаг 11: Сборка frontend"
cd ../frontend
sudo -u $APP_USER npm install
sudo -u $APP_USER npm run build

# Шаг 12: Создание папки uploads
log "Шаг 12: Создание папки uploads"
cd ..
mkdir -p uploads/hd
chown -R $APP_USER:$APP_USER uploads

# Шаг 13: Создание конфигурации PM2
log "Шаг 13: Создание конфигурации PM2"
cat > ecosystem.config.js << EOF
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
EOF

# Создание директорий для логов
mkdir -p backend/logs
chown -R $APP_USER:$APP_USER backend/logs

# Шаг 14: Настройка Nginx
log "Шаг 14: Настройка Nginx"
cat > /etc/nginx/sites-available/kids-toys-shop << EOF
server {
    listen 80;
    server_name _;
    
    # Frontend (статичные файлы)
    location / {
        root $APP_DIR/frontend/build;
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
EOF

# Активация конфигурации
ln -sf /etc/nginx/sites-available/kids-toys-shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Шаг 15: Запуск приложения
log "Шаг 15: Запуск приложения"
cd $APP_DIR
sudo -u $APP_USER pm2 start ecosystem.config.js
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# Шаг 16: Создание скриптов управления
log "Шаг 16: Создание скриптов управления"

# Скрипт мониторинга
cat > /home/$APP_USER/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Kids Toys Shop Server Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h)"
echo "Disk: $(df -h /)"
echo "PM2 Status:"
pm2 status
echo "Nginx Status:"
sudo systemctl status nginx --no-pager
echo "PostgreSQL Status:"
sudo systemctl status postgresql --no-pager
EOF

# Скрипт резервного копирования
cat > /home/$APP_USER/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/kids-toys/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Создание директории для резервных копий
mkdir -p $BACKUP_DIR

# Резервное копирование базы данных
pg_dump -U kids_toys_user -h localhost kids_toys_db > $BACKUP_DIR/db_backup_$DATE.sql

# Резервное копирование загруженных файлов
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /home/kids-toys/app uploads/

# Резервное копирование конфигурации
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C /home/kids-toys/app backend/.env backend/prisma/

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

# Скрипт деплоя
cat > /home/$APP_USER/deploy.sh << 'EOF'
#!/bin/bash
echo "Starting deployment..."

# Переход в директорию проекта
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

echo "Deployment completed!"
EOF

# Делаем скрипты исполняемыми
chmod +x /home/$APP_USER/monitor.sh
chmod +x /home/$APP_USER/backup.sh
chmod +x /home/$APP_USER/deploy.sh
chown $APP_USER:$APP_USER /home/$APP_USER/*.sh

# Шаг 17: Создание инструкции по восстановлению данных
log "Шаг 17: Создание инструкции по восстановлению данных"
cat > /home/$APP_USER/RESTORE_DATA_INSTRUCTIONS.md << 'EOF'
# 📋 Инструкция по восстановлению данных

## 🎯 Что нужно сделать после установки:

### 1. Восстановить базу данных
```bash
# Скопируйте файл database-export.json в папку backend
cp /path/to/database-export.json /home/kids-toys/app/backend/

# Импортируйте данные через API
curl -X POST http://localhost:5000/api/import-data \
  -H "Content-Type: application/json" \
  -d @database-export.json
```

### 2. Восстановить изображения
```bash
# Скопируйте папку uploads с локального компьютера
scp -r /path/to/local/uploads/* root@YOUR_SERVER_IP:/home/kids-toys/app/uploads/

# Или загрузите архив с изображениями
tar -xzf uploads_backup.tar.gz -C /home/kids-toys/app/
```

### 3. Настроить домен и SSL
```bash
# Получите SSL сертификат
certbot --nginx -d your-domain.com

# Обновите FRONTEND_URL в .env файле
nano /home/kids-toys/app/backend/.env
```

### 4. Проверить работу
```bash
# Проверьте статус
/home/kids-toys/monitor.sh

# Проверьте логи
pm2 logs kids-toys-backend

# Откройте сайт в браузере
```

## 🔧 Полезные команды:

```bash
# Мониторинг
/home/kids-toys/monitor.sh

# Резервное копирование
/home/kids-toys/backup.sh

# Обновление
/home/kids-toys/deploy.sh

# Перезапуск
pm2 restart kids-toys-backend

# Логи
pm2 logs kids-toys-backend
```

## 📞 Поддержка:
- Телефон: 053-377-4509
- WhatsApp: 053-377-4509
- Email: simbakingoftoys@gmail.com
EOF

chown $APP_USER:$APP_USER /home/$APP_USER/RESTORE_DATA_INSTRUCTIONS.md

# Шаг 18: Финальная проверка
log "Шаг 18: Финальная проверка"

# Проверка статуса PM2
sudo -u $APP_USER pm2 status

# Проверка Nginx
systemctl status nginx --no-pager

# Проверка PostgreSQL
systemctl status postgresql --no-pager

# Проверка портов
netstat -tlnp | grep -E ':(80|443|5000|5432)'

log "✅ Установка завершена!"
log "📋 Следующие шаги:"
log "1. Восстановите данные из database-export.json"
log "2. Скопируйте папку uploads с изображениями"
log "3. Настройте домен и SSL сертификат"
log "4. Проверьте работу приложения"

log "📖 Подробные инструкции: /home/$APP_USER/RESTORE_DATA_INSTRUCTIONS.md"
log "🔧 Мониторинг: /home/$APP_USER/monitor.sh"
log "💾 Резервное копирование: /home/$APP_USER/backup.sh"

echo "=================================================="
log "🎉 Kids Toys Shop успешно восстановлен на Hetzner!"
log "🌐 Откройте http://YOUR_SERVER_IP в браузере"
log "📅 Дата завершения: $(date)"

