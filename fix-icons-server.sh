#!/bin/bash

echo "🔧 Fixing category icons on server..."

# Create backup
echo "📦 Creating backup of nginx config..."
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Copy new config
echo "📝 Updating nginx configuration..."
cp /root/nginx-config.conf /etc/nginx/sites-available/default

# Test nginx config
echo "🔍 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
        echo "🎉 Category icons fix applied successfully!"
        
        # Test static files
        echo "🧪 Testing static files..."
        curl -I https://simba-tzatzuim.co.il/public/toys.png
        curl -I https://simba-tzatzuim.co.il/public/constructor.png
        
    else
        echo "❌ Failed to reload nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "🔄 Restoring backup..."
    cp /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/default
    exit 1
fi

echo "✅ Fix completed! Check CMS categories page."







