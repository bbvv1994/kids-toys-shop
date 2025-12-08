const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');

// Load env from backend/.env
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
  require('dotenv').config();
  // For debug purposes
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
} catch (e) {
  console.log('dotenv load error (ignored):', e?.message);
}

// Simple args parser: supports --email= --password= --role=
function parseArgs(argv) {
  const result = {};
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      result[key] = rest.join('=');
    }
  }
  return result;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const args = parseArgs(process.argv.slice(2));
    const email = args.email || process.env.EMAIL;
    const password = args.password || process.env.PASSWORD;
    const role = args.role || process.env.ROLE || 'user';
    const name = args.name || process.env.NAME || 'User';

    if (!email || !password) {
      console.error('Usage: node backend/set-user-credentials.js --email=user@example.com --password=Secret123 --role=admin');
      process.exit(1);
    }

    console.log(`Updating/creating user: ${email}`);
    const passwordHash = await bcrypt.hash(password, 10);

    // Try find existing user
    const existing = await prisma.user.findUnique({ where: { email } });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          role,
          name: existing.name || name,
          emailVerified: true,
          verificationToken: null,
        },
      });
      console.log('User updated and marked emailVerified=true');
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          passwordHash,
          emailVerified: true,
        },
      });
      console.log('User created and marked emailVerified=true');
    }

    console.log({ id: user.id, email: user.email, role: user.role, emailVerified: user.emailVerified });
  } catch (err) {
    console.error('Error setting user credentials:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

