const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Генерируем Prisma Client
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Применяем миграции
    console.log('Applying migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDatabase(); 