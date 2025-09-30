#!/bin/bash

# Скрипт для обновления конфигурации Nginx на сервере для домена simba-tzatzuim.co.il

echo "🔧 Обновление конфигурации Nginx для домена simba-tzatzuim.co.il..."

# Создать бэкап текущей конфигурации
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Скопировать новую конфигурацию для домена
sudo cp nginx-config.conf /etc/nginx/sites-available/simba-tzatzuim

# Создать символическую ссылку
sudo ln -sf /etc/nginx/sites-available/simba-tzatzuim /etc/nginx/sites-enabled/

# Удалить default конфигурацию если есть
sudo rm -f /etc/nginx/sites-enabled/default

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
