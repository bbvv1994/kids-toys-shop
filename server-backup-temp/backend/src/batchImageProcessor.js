const ImageProcessor = require('./imageProcessor');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

class BatchImageProcessor {
  constructor() {
    this.imageProcessor = new ImageProcessor();
    this.prisma = new PrismaClient();
  }

  /**
   * Обрабатывает все изображения товаров в базе данных
   */
  async processAllProductImages() {
    try {
      console.log('🔍 Поиск товаров с изображениями...');
      
      const products = await this.prisma.product.findMany({
        where: {
          imageUrls: {
            isEmpty: false
          }
        },
        select: {
          id: true,
          name: true,
          imageUrls: true
        }
      });

      console.log(`Найдено ${products.length} товаров с изображениями`);

      let totalProcessed = 0;
      let totalSaved = 0;
      let errors = [];

      for (const product of products) {
        console.log(`\n📦 Обработка товара: ${product.name} (ID: ${product.id})`);
        
        if (!product.imageUrls || product.imageUrls.length === 0) {
          console.log('  ⚠️  Нет изображений для обработки');
          continue;
        }

        const updatedImageUrls = [];
        let productSaved = 0;

        for (const imageUrl of product.imageUrls) {
          const filePath = path.join(__dirname, '..', imageUrl);
          
          if (!fs.existsSync(filePath)) {
            console.log(`  ⚠️  Файл не найден: ${imageUrl}`);
            updatedImageUrls.push(imageUrl); // Оставляем как есть
            continue;
          }

          const stats = fs.statSync(filePath);
          const originalSize = stats.size;
          
          // Проверяем, не является ли файл уже WebP
          if (path.extname(filePath).toLowerCase() === '.webp') {
            console.log(`  ✅ Уже WebP: ${path.basename(filePath)}`);
            updatedImageUrls.push(imageUrl);
            continue;
          }

          console.log(`  🖼️  Обработка: ${path.basename(filePath)} (${(originalSize / 1024).toFixed(1)}KB)`);

          const result = await this.imageProcessor.processImage(filePath, filePath.replace(/\.[^.]+$/, '.webp'));

          if (result.success) {
            try {
              // Удаляем исходный файл и переименовываем обработанный
              fs.unlinkSync(filePath);
              fs.renameSync(filePath.replace(/\.[^.]+$/, '.webp'), filePath);
              
              const newImageUrl = imageUrl.replace(/\.[^.]+$/, '.webp');
              updatedImageUrls.push(newImageUrl);
              
              const saved = originalSize - result.processedSize;
              productSaved += saved;
              
              console.log(`  ✅ Обработано: ${(result.processedSize / 1024).toFixed(1)}KB (сэкономлено: ${(saved / 1024).toFixed(1)}KB)`);
            } catch (error) {
              console.log(`  ⚠️  Файл заблокирован, оставляем как есть: ${path.basename(filePath)}`);
              updatedImageUrls.push(imageUrl);
              errors.push({ product: product.name, image: imageUrl, error: 'File is locked' });
            }
          } else {
            console.log(`  ❌ Ошибка: ${result.error}`);
            errors.push({ product: product.name, image: imageUrl, error: result.error });
            updatedImageUrls.push(imageUrl); // Оставляем как есть
          }
        }

        // Обновляем товар в базе данных
        try {
          await this.prisma.product.update({
            where: { id: product.id },
            data: { imageUrls: updatedImageUrls }
          });
          
          totalProcessed++;
          totalSaved += productSaved;
          
          console.log(`  💾 Обновлен в БД, сэкономлено: ${(productSaved / 1024).toFixed(1)}KB`);
        } catch (error) {
          console.log(`  ❌ Ошибка обновления БД: ${error.message}`);
          errors.push({ product: product.name, error: 'Database update failed' });
        }
      }

      console.log('\n📊 ИТОГИ ОБРАБОТКИ:');
      console.log(`   Обработано товаров: ${totalProcessed}`);
      console.log(`   Общий объем сэкономлен: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Ошибок: ${errors.length}`);

      if (errors.length > 0) {
        console.log('\n❌ ОШИБКИ:');
        errors.forEach(error => {
          console.log(`   - ${error.product}: ${error.error}`);
        });
      }

      return { totalProcessed, totalSaved, errors };

    } catch (error) {
      console.error('Ошибка пакетной обработки:', error);
      throw error;
    }
  }

  /**
   * Обрабатывает изображения категорий
   */
  async processCategoryImages() {
    try {
      console.log('🔍 Поиск категорий с изображениями...');
      
      const categories = await this.prisma.category.findMany({
        where: {
          image: {
            not: null
          }
        },
        select: {
          id: true,
          name: true,
          image: true
        }
      });

      console.log(`Найдено ${categories.length} категорий с изображениями`);

      let totalProcessed = 0;
      let totalSaved = 0;
      let errors = [];

      for (const category of categories) {
        console.log(`\n📁 Обработка категории: ${category.name} (ID: ${category.id})`);
        
        const filePath = path.join(__dirname, '..', 'uploads', category.image);
        
        if (!fs.existsSync(filePath)) {
          console.log(`  ⚠️  Файл не найден: ${category.image}`);
          continue;
        }

        const stats = fs.statSync(filePath);
        const originalSize = stats.size;
        
        // Проверяем, не является ли файл уже WebP
        if (path.extname(filePath).toLowerCase() === '.webp') {
          console.log(`  ✅ Уже WebP: ${category.image}`);
          continue;
        }

        console.log(`  🖼️  Обработка: ${category.image} (${(originalSize / 1024).toFixed(1)}KB)`);

        const result = await this.imageProcessor.processImage(filePath, filePath.replace(/\.[^.]+$/, '.webp'));

        if (result.success) {
          // Удаляем исходный файл и переименовываем обработанный
          fs.unlinkSync(filePath);
          fs.renameSync(filePath.replace(/\.[^.]+$/, '.webp'), filePath);
          
          const newImageName = category.image.replace(/\.[^.]+$/, '.webp');
          
          // Обновляем в базе данных
          await this.prisma.category.update({
            where: { id: category.id },
            data: { image: newImageName }
          });
          
          const saved = originalSize - result.processedSize;
          totalSaved += saved;
          totalProcessed++;
          
          console.log(`  ✅ Обработано: ${(result.processedSize / 1024).toFixed(1)}KB (сэкономлено: ${(saved / 1024).toFixed(1)}KB)`);
        } else {
          console.log(`  ❌ Ошибка: ${result.error}`);
          errors.push({ category: category.name, image: category.image, error: result.error });
        }
      }

      console.log('\n📊 ИТОГИ ОБРАБОТКИ КАТЕГОРИЙ:');
      console.log(`   Обработано категорий: ${totalProcessed}`);
      console.log(`   Общий объем сэкономлен: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Ошибок: ${errors.length}`);

      return { totalProcessed, totalSaved, errors };

    } catch (error) {
      console.error('Ошибка обработки изображений категорий:', error);
      throw error;
    }
  }

  /**
   * Получает статистику по изображениям
   */
  async getImageStats() {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          imageUrls: {
            isEmpty: false
          }
        },
        select: {
          imageUrls: true
        }
      });

      const categories = await this.prisma.category.findMany({
        where: {
          image: {
            not: null
          }
        },
        select: {
          image: true
        }
      });

      let totalImages = 0;
      let totalSize = 0;
      let webpCount = 0;

      // Подсчитываем изображения товаров
      for (const product of products) {
        for (const imageUrl of product.imageUrls) {
          const filePath = path.join(__dirname, '..', imageUrl);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            totalImages++;
            if (path.extname(filePath).toLowerCase() === '.webp') {
              webpCount++;
            }
          }
        }
      }

      // Подсчитываем изображения категорий
      for (const category of categories) {
        const filePath = path.join(__dirname, '..', 'uploads', category.image);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
          totalImages++;
          if (path.extname(filePath).toLowerCase() === '.webp') {
            webpCount++;
          }
        }
      }

      return {
        totalImages,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        webpCount,
        otherFormatCount: totalImages - webpCount,
        webpPercentage: totalImages > 0 ? ((webpCount / totalImages) * 100).toFixed(1) : 0
      };

    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }
}

module.exports = BatchImageProcessor; 