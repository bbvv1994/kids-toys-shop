const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
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
    
    // Спрашиваем, какого пользователя сделать админом
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Введите ID пользователя, которого хотите сделать администратором: ', async (userId) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) }
        });
        
        if (!user) {
          console.log('❌ Пользователь не найден');
          rl.close();
          await prisma.$disconnect();
          return;
        }
        
        console.log(`🔍 Найден пользователь: ${user.name} (${user.email})`);
        console.log(`📊 Текущая роль: ${user.role}`);
        
        // Обновляем роль на admin
        const updatedUser = await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { role: 'admin' }
        });
        
        console.log('✅ Роль успешно обновлена на admin!');
        console.log(`📊 Новая роль: ${updatedUser.role}`);
        
      } catch (error) {
        console.error('❌ Ошибка обновления роли:', error);
      } finally {
        rl.close();
        await prisma.$disconnect();
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await prisma.$disconnect();
  }
}

updateUserRole(); 