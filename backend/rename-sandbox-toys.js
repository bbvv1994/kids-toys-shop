require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function rename() {
  const updated = await prisma.category.updateMany({
    where: { name: 'Игрушки для песочницы' },
    data: { name: 'Пляжные игрушки' }
  });
  
  console.log(`✅ Обновлено записей: ${updated.count}`);
}

rename().finally(() => prisma.$disconnect());

