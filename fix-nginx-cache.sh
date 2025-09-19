#!/bin/bash

# Скрипт для исправления кэширования nginx
# Решает проблему с кэшированием файлов на уровне системы

set -e

echo "🔧 Исправление кэширования nginx..."

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo ./fix-nginx-cache.sh"
    exit 1
fi

# 1. Создание резервной копии текущей конфигурации
log "📋 Создание резервной копии конфигурации nginx..."
if [ -f /etc/nginx/sites-available/kids-toys-shop ]; then
    cp /etc/nginx/sites-available/kids-toys-shop /etc/nginx/sites-available/kids-toys-shop.backup.$(date +%Y%m%d_%H%M%S)
    log "✅ Резервная копия создана"
else
    log "⚠️  Файл конфигурации не найден, создаем новый"
fi

# 2. Создание правильной конфигурации nginx
log "⚙️  Создание конфигурации nginx с правильным кэшированием..."

# Определяем путь к приложению
APP_DIR="/home/kids-toys/app"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="/root/kids-toys-shop"
fi

if [ ! -d "$APP_DIR" ]; then
    log "❌ Директория приложения не найдена. Проверьте путь: $APP_DIR"
    exit 1
fi

# Создание конфигурации nginx
cat > /etc/nginx/sites-available/kids-toys-shop << EOF
server {
    listen 80;
    server_name _;
    
    # Frontend (статичные файлы)
    location / {
        root $APP_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Кэширование статических файлов (JS, CSS, изображения)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
            add_header ETag "";
            # Отключаем кэширование для файлов с хэшами в имени
            if (\$uri ~* "\.[a-f0-9]{8,}\.(js|css)$") {
                expires max;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # Кэширование HTML файлов - НЕ кэшируем для обновлений
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header ETag "";
        }
        
        # Кэширование JSON файлов - НЕ кэшируем для обновлений
        location ~* \.json$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
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
        
        # Отключаем кэширование для API запросов
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        
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

log "✅ Конфигурация nginx создана"

# 3. Активация конфигурации
log "🔗 Активация конфигурации nginx..."
ln -sf /etc/nginx/sites-available/kids-toys-shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Проверка конфигурации
log "🔍 Проверка конфигурации nginx..."
if nginx -t; then
    log "✅ Конфигурация nginx корректна"
else
    log "❌ Ошибка в конфигурации nginx"
    exit 1
fi

# 5. Перезагрузка nginx
log "🔄 Перезагрузка nginx..."
systemctl reload nginx
log "✅ Nginx перезагружен"

# 6. Очистка кэша браузера (если возможно)
log "🧹 Очистка системного кэша..."

# Очистка кэша nginx (если есть)
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
    log "✅ Кэш nginx очищен"
fi

# Очистка временных файлов
if [ -d "/tmp" ]; then
    find /tmp -name "nginx*" -type f -delete 2>/dev/null || true
    log "✅ Временные файлы nginx очищены"
fi

# 7. Проверка статуса
log "📊 Проверка статуса nginx..."
if systemctl is-active --quiet nginx; then
    log "✅ Nginx работает корректно"
else
    log "❌ Nginx не работает"
    systemctl status nginx
    exit 1
fi

# 8. Создание скрипта для очистки кэша
log "📝 Создание скрипта для очистки кэша..."
cat > /usr/local/bin/clear-nginx-cache << 'EOF'
#!/bin/bash
# Скрипт для очистки кэша nginx

echo "🧹 Очистка кэша nginx..."

# Очистка кэша nginx
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
    echo "✅ Кэш nginx очищен"
fi

# Очистка временных файлов
find /tmp -name "nginx*" -type f -delete 2>/dev/null || true
echo "✅ Временные файлы очищены"

# Перезагрузка nginx
systemctl reload nginx
echo "✅ Nginx перезагружен"

echo "🎉 Кэш очищен успешно!"
EOF

chmod +x /usr/local/bin/clear-nginx-cache
log "✅ Скрипт очистки кэша создан: /usr/local/bin/clear-nginx-cache"

# 9. Создание инструкций
log "📋 Создание инструкций..."
cat > /root/nginx-cache-fix-instructions.md << 'EOF'
# Исправление кэширования nginx - Завершено

## Что было исправлено:

1. **Кэширование статических файлов**: JS, CSS, изображения кэшируются на 1 год
2. **HTML файлы**: НЕ кэшируются для обеспечения обновлений
3. **JSON файлы**: НЕ кэшируются для обеспечения обновлений
4. **API запросы**: НЕ кэшируются для обеспечения актуальности данных
5. **Gzip сжатие**: Включено для оптимизации

## Команды для управления:

### Очистка кэша:
```bash
sudo clear-nginx-cache
```

### Проверка конфигурации:
```bash
sudo nginx -t
```

### Перезагрузка nginx:
```bash
sudo systemctl reload nginx
```

### Просмотр логов:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Проверка работы:

1. Откройте сайт в браузере
2. Нажмите Ctrl+F5 для принудительного обновления
3. Проверьте, что изменения отображаются корректно

## Резервные копии:

Резервные копии конфигурации сохранены в:
- /etc/nginx/sites-available/kids-toys-shop.backup.*

## Примечания:

- Статические файлы (JS, CSS, изображения) кэшируются на 1 год
- HTML и JSON файлы НЕ кэшируются для обеспечения обновлений
- API запросы НЕ кэшируются для обеспечения актуальности данных
- При обновлении фронтенда используйте Ctrl+F5 для принудительного обновления
EOF

log "✅ Инструкции созданы: /root/nginx-cache-fix-instructions.md"

# 10. Финальная проверка
log "🔍 Финальная проверка..."
echo ""
echo "📊 Статус сервисов:"
systemctl status nginx --no-pager -l
echo ""
echo "🌐 Проверка доступности:"
curl -I http://localhost/ 2>/dev/null | head -5 || echo "⚠️  Сайт недоступен"

echo ""
log "🎉 Исправление кэширования nginx завершено!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Проверьте работу сайта в браузере"
echo "2. Используйте Ctrl+F5 для принудительного обновления"
echo "3. При необходимости очистите кэш: sudo clear-nginx-cache"
echo "4. Прочитайте инструкции: cat /root/nginx-cache-fix-instructions.md"
echo ""



