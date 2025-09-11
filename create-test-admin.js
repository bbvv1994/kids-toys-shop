#!/usr/bin/env node

/**
 * Скрипт для создания тестового администратора
 * Создает пользователя с подтвержденным email и правами администратора
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createTestAdmin() {
  try {
    console.log('🔧 Создание тестового администратора...');
    
    const testAdmin = {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Test Admin',
      role: 'admin'
    };
    
    // Проверяем, существует ли уже такой пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: testAdmin.email }
    });
    
    if (existingUser) {
      console.log('ℹ️ Пользователь уже существует, обновляем данные...');
      
      // Обновляем существующего пользователя
      const passwordHash = await bcrypt.hash(testAdmin.password, 10);
      
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: passwordHash,
          role: 'admin',
          emailVerified: true,
          verificationToken: null
        }
      });
      
      console.log('✅ Данные пользователя обновлены');
    } else {
      console.log('➕ Создаем нового пользователя...');
      
      // Создаем нового пользователя
      const passwordHash = await bcrypt.hash(testAdmin.password, 10);
      
      await prisma.user.create({
        data: {
          email: testAdmin.email,
          passwordHash: passwordHash,
          name: testAdmin.name,
          role: 'admin',
          emailVerified: true,
          verificationToken: null
        }
      });
      
      console.log('✅ Новый пользователь создан');
    }
    
    console.log('\n🎯 Данные для входа:');
    console.log(`📧 Email: ${testAdmin.email}`);
    console.log(`🔑 Password: ${testAdmin.password}`);
    console.log(`👤 Role: ${testAdmin.role}`);
    console.log('\n✅ Теперь вы можете войти в систему с этими данными!');
    
  } catch (error) {
    console.error('❌ Ошибка создания тестового администратора:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
