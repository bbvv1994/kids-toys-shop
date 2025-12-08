const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCurrentUserRole() {
  try {
    console.log('🔍 Поиск пользователей...');
    
    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log('📋 Найденные пользователи:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
    });
    
    // Находим пользователя с email simbakingoftoys@gmail.com (если это ваш email)
const targetEmail = 'wexkwasexort@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    });
    
    if (!user) {
      console.log(`❌ Пользователь с email ${targetEmail} не найден`);
      await prisma.$disconnect();
      return;
    }
    
    console.log(`🔍 Найден пользователь: ${user.name} (${user.email})`);
    console.log(`📊 Текущая роль: ${user.role}`);
    
    if (user.role === 'admin') {
      console.log('✅ Пользователь уже является администратором!');
      await prisma.$disconnect();
      return;
    }
    
    // Обновляем роль на admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    });
    
    console.log('✅ Роль успешно обновлена на admin!');
    console.log(`📊 Новая роль: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCurrentUserRole(); 