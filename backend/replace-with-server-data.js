const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function replaceWithServerData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Замена локальных данных данными с сервера...\n');
    
    // Проверяем наличие файла с данными сервера
    const serverDataPath = path.join(__dirname, '..', 'server-export.json');
    if (!fs.existsSync(serverDataPath)) {
      console.error('❌ Файл server-export.json не найден!');
      console.log('💡 Сначала выполните: npm run download-api');
      return;
    }
    
    const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf8'));
    console.log('📋 Данные с сервера:');
    console.log(`   - Категории: ${serverData.categories?.length || 0}`);
    console.log(`   - Товары: ${serverData.products?.length || 0}`);
    console.log(`   - Пользователи: ${serverData.users?.length || 0}`);
    console.log(`   - Заказы: ${serverData.orders?.length || 0}`);
    console.log(`   - Вопросы: ${serverData.productQuestions?.length || 0}`);
    
    // Очищаем все данные в правильном порядке
    console.log('\n🗑️ Очистка существующих данных...');
    await prisma.productQuestion.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.review.deleteMany();
    await prisma.shopReview.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.availabilityNotification.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    console.log('✅ Данные очищены');
    
    // Восстанавливаем данные с сервера в правильном порядке
    console.log('\n📂 Восстановление данных с сервера...');
    
    // 1. Категории (сначала родительские, потом дочерние)
    if (serverData.categories?.length > 0) {
      console.log('📂 Восстановление категорий...');
      const parentCategories = serverData.categories.filter(cat => !cat.parentId);
      const childCategories = serverData.categories.filter(cat => cat.parentId);
      
      // Сначала создаем родительские категории
      for (const category of parentCategories) {
        await prisma.category.create({
          data: {
            id: category.id,
            name: category.name,
            active: category.active,
            image: category.image,
            order: category.order
          }
        });
      }
      
      // Потом создаем дочерние категории
      for (const category of childCategories) {
        await prisma.category.create({
          data: {
            id: category.id,
            name: category.name,
            active: category.active,
            image: category.image,
            parentId: category.parentId,
            order: category.order
          }
        });
      }
      console.log(`✅ Восстановлено ${serverData.categories.length} категорий`);
    }
    
    // 2. Пользователи
    if (serverData.users?.length > 0) {
      console.log('👥 Восстановление пользователей...');
      for (const user of serverData.users) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            googleId: user.googleId,
            facebookId: user.facebookId,
            role: user.role,
            phone: user.phone,
            surname: user.surname
          }
        });
      }
      console.log(`✅ Восстановлено ${serverData.users.length} пользователей`);
    }
    
    // 3. Товары
    if (serverData.products?.length > 0) {
      console.log('🛍️ Восстановление товаров...');
      for (const product of serverData.products) {
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            ageGroup: product.ageGroup,
            imageUrls: product.imageUrls || [],
            quantity: product.quantity || 0,
            article: product.article,
            brand: product.brand,
            country: product.country,
            height: product.height,
            length: product.length,
            width: product.width,
            subcategoryId: product.subcategoryId,
            isHidden: product.isHidden || false,
            gender: product.gender,
            categoryId: product.categoryId,
            categoryName: product.categoryName
          }
        });
      }
      console.log(`✅ Восстановлено ${serverData.products.length} товаров`);
    }
    
    // 4. Заказы
    if (serverData.orders?.length > 0) {
      console.log('📦 Восстановление заказов...');
      for (const order of serverData.orders) {
        const { items, ...orderData } = order;
        await prisma.order.create({
          data: {
            id: orderData.id,
            userId: orderData.userId,
            pickupStore: orderData.pickupStore,
            status: orderData.status,
            guestName: orderData.guestName,
            guestEmail: orderData.guestEmail,
            guestPhone: orderData.guestPhone
          }
        });
        
        // Восстанавливаем элементы заказа
        if (items?.length > 0) {
          for (const item of items) {
            await prisma.orderItem.create({
              data: {
                orderId: orderData.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }
            });
          }
        }
      }
      console.log(`✅ Восстановлено ${serverData.orders.length} заказов`);
    }
    
    // 5. Вопросы
    if (serverData.productQuestions?.length > 0) {
      console.log('❓ Восстановление вопросов...');
      for (const question of serverData.productQuestions) {
        await prisma.productQuestion.create({
          data: {
            id: question.id,
            productId: question.productId,
            userId: question.userId,
            question: question.question,
            answer: question.answer,
            status: question.status
          }
        });
      }
      console.log(`✅ Восстановлено ${serverData.productQuestions.length} вопросов`);
    }
    
    // Проверяем результат
    console.log('\n📊 Проверка восстановленных данных:');
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const questionsCount = await prisma.productQuestion.count();
    const usersCount = await prisma.user.count();
    const ordersCount = await prisma.order.count();
    
    console.log(`   - Товары: ${productsCount}`);
    console.log(`   - Категории: ${categoriesCount}`);
    console.log(`   - Вопросы: ${questionsCount}`);
    console.log(`   - Пользователи: ${usersCount}`);
    console.log(`   - Заказы: ${ordersCount}`);
    
    if (productsCount === 2) {
      console.log('\n🎉 Замена данных завершена успешно!');
      console.log('✅ Теперь у вас локально точная копия сервера с 2 товарами!');
    } else {
      console.log(`\n⚠️ Внимание: восстановлено ${productsCount} товаров вместо ожидаемых 2`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при замене данных:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

replaceWithServerData(); 