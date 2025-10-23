#!/usr/bin/env python3
"""
Скрипт для проверки Cloudinary URL в базе данных через API
"""

import requests
import json

def check_cloudinary_urls():
    try:
        # Получаем данные через API
        response = requests.get('http://localhost:5000/api/products?admin=true')
        products = response.json()
        
        print("🔍 Анализ Cloudinary URL в базе данных:")
        print("=" * 50)
        
        cloudinary_count = 0
        local_count = 0
        products_with_cloudinary = []
        
        for product in products:
            if 'imageUrls' in product and product['imageUrls']:
                for url in product['imageUrls']:
                    if url.startswith('http') and 'cloudinary.com' in url:
                        cloudinary_count += 1
                        products_with_cloudinary.append({
                            'id': product['id'],
                            'name': product['name'],
                            'url': url
                        })
                    elif url.startswith('/uploads/'):
                        local_count += 1
        
        print(f"📊 Статистика:")
        print(f"   - Cloudinary URL: {cloudinary_count}")
        print(f"   - Локальные пути: {local_count}")
        print(f"   - Товаров с Cloudinary: {len(products_with_cloudinary)}")
        
        if products_with_cloudinary:
            print(f"\n☁️ Товары с Cloudinary изображениями:")
            for item in products_with_cloudinary:
                print(f"   - ID {item['id']}: {item['name']}")
                print(f"     URL: {item['url']}")
        
        return cloudinary_count, local_count
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return 0, 0

if __name__ == '__main__':
    check_cloudinary_urls()

