#!/bin/bash

# 🚀 Простой скрипт быстрого старта для Hetzner
# Создайте этот файл на сервере и запустите

echo "🚀 Простой старт настройки сервера Hetzner..."

# Создание основного скрипта
cat > setup.sh << 'EOF'
#!/bin/bash

# 🚀 Простая настройка сервера Hetzner
# Запускать от имени root: sudo bash setup.sh

echo "🚀 Начинаем настройку сервера..."

# Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y
apt install -y curl wget git unzip

# Установка Node.js
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Установка PostgreSQL
echo "📦 Установка PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Установка Nginx
echo "📦 Установка Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

# Создание пользователя
echo "👤 Создание пользователя..."
adduser --disabled-password --gecos "" kids-toys
usermod -aG sudo kids-toys

# Клонирование репозитория
echo "📥 Клонирование репозитория..."
su - kids-toys -c "
    mkdir -p /home/kids-toys/app
    cd /home/kids-toys/app
    git clone https://github.com/bbvv1994/kids-toys-shop.git .
"

# Настройка переменных окружения
echo "⚙️ Настройка переменных окружения..."
su - kids-toys -c "
    cd /home/kids-toys/app/backend
    cat > .env << 'ENV_EOF'
DATABASE_URL=\"postgresql://postgres@localhost:5432/kids_toys_db\"
JWT_SECRET=\"$(openssl rand -base64 64)\"
NODE_ENV=\"production\"
PORT=5000
ENV_EOF
"

# Создание базы данных
echo "🗄️ Создание базы данных..."
sudo -u postgres psql -c "CREATE DATABASE kids_toys_db;"

# Установка зависимостей
echo "📦 Установка зависимостей..."
su - kids-toys -c "
    cd /home/kids-toys/app/backend
    npm install
    npx prisma generate
"

su - kids-toys -c "
    cd /home/kids-toys/app/frontend
    npm install
    npm run build
"

# Настройка базы данных
echo "🗄️ Настройка базы данных..."
su - kids-toys -c "
    cd /home/kids-toys/app/backend
    npx prisma migrate deploy
"

# Настройка Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/kids-toys-shop << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        root /home/kids-toys/app/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/kids-toys-shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx

# Запуск backend
echo "🚀 Запуск backend..."
su - kids-toys -c "
    cd /home/kids-toys/app/backend
    pm2 start src/index.js --name kids-toys-backend
    pm2 save
    pm2 startup
"

echo "🎉 Настройка завершена!"
echo "🌐 Frontend: http://$(hostname -I | awk '{print $1}')"
echo "🔌 Backend: http://$(hostname -I | awk '{print $1}'):5000"
echo "📊 PM2: pm2 status"
EOF

# Делаем скрипт исполняемым
chmod +x setup.sh

echo "✅ Скрипт setup.sh создан!"
echo ""
echo "🚀 Теперь запустите:"
echo "sudo bash setup.sh"
echo ""
echo "📝 Простая настройка за 15-20 минут"
