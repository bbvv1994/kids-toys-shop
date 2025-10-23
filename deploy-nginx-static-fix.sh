#!/bin/bash

echo "🔧 Deploying nginx static files fix..."

# Проверяем, что мы на сервере
if [ ! -f "/etc/nginx/sites-available/default" ]; then
    echo "❌ This script should be run on the server"
    exit 1
fi

# Создаем резервную копию текущей конфигурации
echo "📦 Creating backup of current nginx config..."
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Копируем новую конфигурацию
echo "📝 Updating nginx configuration..."
sudo cp nginx-config.conf /etc/nginx/sites-available/default

# Проверяем конфигурацию nginx
echo "🔍 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Перезагружаем nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
        echo "🎉 Static files fix deployed successfully!"
        echo ""
        echo "📋 What was fixed:"
        echo "   - Added /public/ location block to serve static files from backend"
        echo "   - Fixed category icons serving from backend/public folder"
        echo "   - Updated alt text in CMS to be more descriptive"
        echo ""
        echo "🔗 Test URLs:"
        echo "   - https://simba-tzatzuim.co.il/public/toys.png"
        echo "   - https://simba-tzatzuim.co.il/public/constructor.png"
        echo "   - https://simba-tzatzuim.co.il/public/puzzle.png"
    else
        echo "❌ Failed to reload nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "🔄 Restoring backup..."
    sudo cp /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/default
    exit 1
fi

echo "🎯 Next steps:"
echo "   1. Check CMS categories page - icons should now display correctly"
echo "   2. If issues persist, check nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "   3. Verify backend is running: sudo systemctl status kids-toys-backend"







