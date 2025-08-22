const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestProducts() {
  try {
    console.log('🛍️ Создаем тестовые товары...\n');

    const testProducts = [
      {
        name: 'Конструктор LEGO Classic',
        description: 'Классический набор LEGO для развития творчества',
        price: 299.99,
        category: 'Конструкторы',
        ageGroup: '5-7',
        gender: 'универсальный',
        imageUrls: ['/lego.jpg'],
        quantity: 10,
        article: 'LEGO001',
        brand: 'LEGO',
        country: 'Дания'
      },
      {
        name: 'Кукла Барби',
        description: 'Красивая кукла Барби для девочек',
        price: 199.99,
        category: 'Куклы',
        ageGroup: '3-5',
        gender: 'девочка',
        imageUrls: ['/barbie.jpg'],
        quantity: 15,
        article: 'BARBIE001',
        brand: 'Barbie',
        country: 'США'
      },
      {
        name: 'Машинка радиоуправляемая',
        description: 'Быстрая машинка на радиоуправлении',
        price: 399.99,
        category: 'Игрушки на радиоуправлении',
        ageGroup: '7-10',
        gender: 'мальчик',
        imageUrls: ['/rc-car.jpg'],
        quantity: 8,
        article: 'RC001',
        brand: 'Hot Wheels',
        country: 'Китай'
      },
      {
        name: 'Пазл 100 деталей',
        description: 'Красивый пазл для развития логики',
        price: 89.99,
        category: 'Пазлы',
        ageGroup: '5-7',
        gender: 'универсальный',
        imageUrls: ['/puzzle.jpg'],
        quantity: 20,
        article: 'PUZZLE001',
        brand: 'Ravensburger',
        country: 'Германия'
      },
      {
        name: 'Набор для рисования',
        description: 'Полный набор для творчества',
        price: 149.99,
        category: 'Творчество',
        ageGroup: '3-5',
        gender: 'универсальный',
        imageUrls: ['/art-set.jpg'],
        quantity: 12,
        article: 'ART001',
        brand: 'Crayola',
        country: 'США'
      }
    ];

    for (const product of testProducts) {
      const created = await prisma.product.create({
        data: product
      });
      console.log(`✅ Создан товар: ${created.name} (₪${created.price})`);
    }

    console.log('\n🎉 Все тестовые товары созданы!');

  } catch (error) {
    console.error('❌ Ошибка при создании товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProducts(); 