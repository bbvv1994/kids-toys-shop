const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Укажите email пользователя для подтверждения');
      console.log('💡 Использование: node verify-user.js user@example.com');
      return;
    }
    
    console.log(`🔧 Подтверждение email для: ${email}`);
    
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      console.log(`❌ Пользователь с email ${email} не найден!`);
      return;
    }
    
    console.log(`👤 Найден пользователь: ${user.name} (ID: ${user.id})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Роль: ${user.role}`);
    console.log(`✅ Подтвержден: ${user.emailVerified}`);
    
    if (user.emailVerified) {
      console.log('✅ Email уже подтвержден!');
      return;
    }
    
    // Подтвердить email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    });
    
    console.log('✅ Email успешно подтвержден!');
    console.log(`🎯 Теперь вы можете войти с: ${email}`);
    
  } catch (error) {
    console.error('❌ Ошибка подтверждения:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();
