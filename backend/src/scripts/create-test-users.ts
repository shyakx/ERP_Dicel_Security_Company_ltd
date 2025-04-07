import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Create ADMIN user
    await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN'
      }
    });

    // Create MANAGER user
    await prisma.user.upsert({
      where: { email: 'manager@test.com' },
      update: {},
      create: {
        email: 'manager@test.com',
        name: 'Manager User',
        password: await bcrypt.hash('manager123', 10),
        role: 'MANAGER'
      }
    });

    // Create regular USER
    await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {},
      create: {
        email: 'user@test.com',
        name: 'Regular User',
        password: await bcrypt.hash('user123', 10),
        role: 'USER'
      }
    });

    console.log('Test users created successfully!');
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers(); 