#!/usr/bin/env node

/**
 * Создает простое тестовое изображение для проверки двойного сохранения
 */

const sharp = require('sharp');
const fs = require('fs');

async function createTestImage() {
  console.log('🖼️ Создание тестового изображения...');
  
  try {
    // Создаем простое изображение 100x100 пикселей
    const imageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 } // Красный фон
      }
    })
    .png()
    .toBuffer();
    
    // Сохраняем в файл
    fs.writeFileSync('test-image.png', imageBuffer);
    
    console.log('✅ Тестовое изображение создано: test-image.png');
    console.log(`   Размер: ${imageBuffer.length} байт`);
    console.log(`   Размеры: 100x100 пикселей`);
    
    return imageBuffer;
    
  } catch (error) {
    console.error('❌ Ошибка создания тестового изображения:', error.message);
    throw error;
  }
}

// Запускаем создание
if (require.main === module) {
  createTestImage().catch(console.error);
}

module.exports = { createTestImage };

