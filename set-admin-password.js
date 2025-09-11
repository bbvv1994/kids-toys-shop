const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function setAdminPassword() {
  try {
    console.log('🔧 Setting admin password...');
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found!');
      return;
    }
    
    console.log(`👤 Found admin user: ${adminUser.email} (ID: ${adminUser.id})`);
    
    // Set password to 'admin123'
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: passwordHash }
    });
    
    console.log('✅ Admin password set successfully!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('🎯 You can now login with these credentials');
    
  } catch (error) {
    console.error('❌ Error setting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPassword();
