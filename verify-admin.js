const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    console.log('🔧 Verifying admin user email...');
    
    // Find admin user by email
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found!');
      return;
    }
    
    console.log(`👤 Found admin user: ${adminUser.email} (ID: ${adminUser.id})`);
    
    // Verify the admin user's email
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { emailVerified: true }
    });
    
    console.log('✅ Admin user email verified successfully!');
    console.log(`📧 You can now login with: ${adminUser.email}`);
    
  } catch (error) {
    console.error('❌ Error verifying admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
