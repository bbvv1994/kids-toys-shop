const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking for "Праздничная символика" category...');
    let category = await prisma.category.findUnique({
      where: { name: 'Праздничная символика' }
    });

    if (!category) {
      console.log('➕ Creating "Праздничная символика" category...');
      category = await prisma.category.create({
        data: {
          name: 'Праздничная символика',
          active: true,
          order: 99, // Place it at the end
          image: '/holiday.png'
        }
      });
      console.log('✅ Created category with ID:', category.id);
    } else {
      console.log('ℹ️ Category already exists with ID:', category.id);
    }
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
