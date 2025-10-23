#!/usr/bin/env python3
"""
Скрипт для проверки изображений в базе данных
"""

import psycopg2
import json
import os

# Подключение к базе данных
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="kids_toys_db",
        user="kids_toys_user",
        password="3454746978"
    )

def check_product_images():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Получаем первые 5 товаров с изображениями
        cursor.execute("""
            SELECT id, name, imageUrls 
            FROM "Product" 
            WHERE imageUrls IS NOT NULL AND array_length(imageUrls, 1) > 0
            LIMIT 5
        """)
        
        products = cursor.fetchall()
        
        print("🔍 Анализ изображений в базе данных:")
        print("=" * 50)
        
        cloudinary_count = 0
        local_count = 0
        
        for product in products:
            product_id, name, image_urls = product
            print(f"\n📦 Товар ID: {product_id}")
            print(f"📝 Название: {name}")
            print(f"🖼️ Изображения ({len(image_urls)}):")
            
            for i, url in enumerate(image_urls):
                print(f"  {i+1}. {url}")
                
                if url.startswith('http') and 'cloudinary.com' in url:
                    cloudinary_count += 1
                    print(f"     ✅ Cloudinary URL")
                elif url.startswith('/uploads/'):
                    local_count += 1
                    print(f"     📁 Локальный файл")
                else:
                    print(f"     ❓ Неизвестный тип URL")
        
        print(f"\n📊 Статистика:")
        print(f"   - Cloudinary изображений: {cloudinary_count}")
        print(f"   - Локальных изображений: {local_count}")
        
        # Проверяем общую статистику
        cursor.execute("""
            SELECT 
                COUNT(*) as total_products,
                COUNT(CASE WHEN imageUrls IS NOT NULL AND array_length(imageUrls, 1) > 0 THEN 1 END) as products_with_images
            FROM "Product"
        """)
        
        stats = cursor.fetchone()
        print(f"   - Всего товаров: {stats[0]}")
        print(f"   - Товаров с изображениями: {stats[1]}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    check_product_images()

