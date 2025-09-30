#!/bin/bash

# Скрипт для настройки SSL сертификата для домена simba-tzatzuim.co.il

echo "🔐 Настройка SSL для simba-tzatzuim.co.il..."

# Проверка, что скрипт запущен от root или с sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с sudo: sudo ./setup-ssl-simba.sh"
    exit 1
fi

# Проверка установки certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Установка Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Проверка DNS настроек
echo "🌐 Проверка DNS настроек..."
if nslookup simba-tzatzuim.co.il | grep -q "Address:"; then
    echo "✅ DNS запись для simba-tzatzuim.co.il найдена"
else
    echo "❌ DNS запись для simba-tzatzuim.co.il не найдена"
    echo "   Убедитесь, что DNS настроен перед продолжением"
    exit 1
fi

# Проверка nginx конфигурации
echo "🔧 Проверка конфигурации nginx..."
if nginx -t; then
    echo "✅ Конфигурация nginx корректна"
else
    echo "❌ Ошибка в конфигурации nginx"
    exit 1
fi

# Получение SSL сертификата
echo "🔐 Получение SSL сертификата..."
certbot --nginx -d simba-tzatzuim.co.il -d www.simba-tzatzuim.co.il --non-interactive --agree-tos --email admin@simba-tzatzuim.co.il

if [ $? -eq 0 ]; then
    echo "✅ SSL сертификат успешно получен"
    
    # Проверка автообновления
    echo "🔄 Проверка автообновления сертификата..."
    certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        echo "✅ Автообновление настроено корректно"
    else
        echo "⚠️ Проблема с автообновлением, но сертификат работает"
    fi
    
    # Финальная проверка
    echo "🧪 Финальная проверка..."
    echo "   Проверьте сайт: https://simba-tzatzuim.co.il"
    echo "   Проверьте www: https://www.simba-tzatzuim.co.il"
    echo "   Проверьте редирект: http://simba-tzatzuim.co.il"
    
    # Показать информацию о сертификате
    echo "📋 Информация о сертификате:"
    certbot certificates
    
    echo "🎉 SSL настройка завершена успешно!"
    echo "🌐 Ваш сайт доступен по адресу: https://simba-tzatzuim.co.il"
    
else
    echo "❌ Ошибка получения SSL сертификата"
    echo "   Проверьте:"
    echo "   1. DNS настройки (nslookup simba-tzatzuim.co.il)"
    echo "   2. Доступность порта 80 (netstat -tlnp | grep :80)"
    echo "   3. Конфигурацию nginx (nginx -t)"
    exit 1
fi

