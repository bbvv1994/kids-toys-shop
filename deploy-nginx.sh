#!/bin/bash

# Скрипт для обновления конфигурации Nginx на сервере

echo "🔧 Обновление конфигурации Nginx (без /uploads/ - используется Cloudinary)..."

# Создать бэкап текущей конфигурации
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Скопировать новую конфигурацию
sudo cp nginx-config.conf /etc/nginx/sites-available/default

# Проверить конфигурацию
if sudo nginx -t; then
    echo "✅ Конфигурация Nginx корректна"
    
    # Перезагрузить Nginx
    sudo systemctl reload nginx
    echo "✅ Nginx перезагружен"
    
    # Проверить права доступа к uploads
    sudo chmod -R 755 /root/backend/backend/uploads/
    sudo chown -R www-data:www-data /root/backend/backend/uploads/
    echo "✅ Права доступа к uploads обновлены"
    
    # Проверить статус
    sudo systemctl status nginx --no-pager -l
    echo "🎉 Nginx обновлен и работает"
else
    echo "❌ Ошибка в конфигурации Nginx"
    exit 1
fi
