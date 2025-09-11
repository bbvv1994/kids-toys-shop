const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function setPassword() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    
    if (!email || !password) {
      console.log('❌ Укажите email и пароль');
      console.log('💡 Использование: node set-password.js user@example.com newpassword');
      return;
    }
    
    console.log(`🔧 Установка пароля для: ${email}`);
    
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
    
    // Хешировать пароль
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Обновить пароль
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: passwordHash }
    });
    
    console.log('✅ Пароль успешно установлен!');
    console.log(`🎯 Теперь вы можете войти с:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Ошибка установки пароля:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword();
