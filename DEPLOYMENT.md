# Инструкции по развертыванию Kids Toys Shop

## Автоматическая конфигурация

Система теперь автоматически определяет среду и настраивает URL:

### Локальная разработка (localhost)
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- Автоматически определяется как development

### Production сервер
- **Frontend**: https://your-domain.com
- **Backend**: https://your-domain.com:5000 (или отдельный домен)
- Автоматически определяется как production

## Шаги развертывания

### 1. Подготовка сервера

```bash
# Установка Node.js (версия 16+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка nginx
sudo apt-get install nginx
```

### 2. Настройка SSL (рекомендуется)

```bash
# Установка Certbot
sudo apt-get install certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com
```

### 3. Настройка nginx

Создайте файл `/etc/nginx/sites-available/kids-toys-shop`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/kids-toys-shop/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Загруженные файлы
    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/kids-toys-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Развертывание приложения

```bash
# Создание директории
sudo mkdir -p /var/www/kids-toys-shop
sudo chown $USER:$USER /var/www/kids-toys-shop

# Клонирование репозитория
cd /var/www/kids-toys-shop
git clone your-repository-url .

# Установка зависимостей
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Сборка frontend
cd frontend
npm run build
cd ..

# Настройка базы данных
cd backend
npx prisma migrate deploy
cd ..
```

### 5. Настройка PM2

Создайте файл `ecosystem.config.js` в корне проекта:

```javascript
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
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

Запустите приложение:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Настройка CORS (если нужно)

Если frontend и backend на разных доменах, настройте CORS в `backend/src/index.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

## Автоматическое обновление

Создайте скрипт для автоматического обновления:

```bash
#!/bin/bash
# deploy.sh

cd /var/www/kids-toys-shop

# Получение обновлений
git pull origin main

# Установка зависимостей
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Сборка frontend
cd frontend
npm run build
cd ..

# Перезапуск backend
pm2 restart kids-toys-backend

echo "Deployment completed!"
```

Сделайте скрипт исполняемым:

```bash
chmod +x deploy.sh
```

## Мониторинг

```bash
# Просмотр логов
pm2 logs kids-toys-backend

# Статус процессов
pm2 status

# Мониторинг ресурсов
pm2 monit
```

## Резервное копирование

```bash
# Создание резервной копии базы данных
sqlite3 backend/prisma/dev.db ".backup '/backup/db-$(date +%Y%m%d-%H%M%S).db'"

# Резервное копирование загруженных файлов
tar -czf "/backup/uploads-$(date +%Y%m%d-%H%M%S).tar.gz" backend/uploads/
```

## Важные замечания

1. **Автоматическая конфигурация**: Система автоматически определяет URL на основе домена
2. **SSL обязателен**: Для production используйте HTTPS
3. **Кэширование**: Настроено кэширование статических файлов
4. **Безопасность**: Используйте переменные окружения для секретов
5. **Мониторинг**: Настройте логирование и мониторинг

## Переменные окружения (опционально)

Если нужно переопределить автоматические URL, создайте файл `.env.production` в папке frontend:

```env
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_FRONTEND_URL=https://your-domain.com
```

Если переменные не указаны, система автоматически определит URL на основе текущего домена. 