import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create default roles
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
          name: 'ADMIN',
          description: 'System Administrator'
        }
      }),
      prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: {
          name: 'MANAGER',
          description: 'Department Manager'
        }
      }),
      prisma.role.upsert({
        where: { name: 'EMPLOYEE' },
        update: {},
        create: {
          name: 'EMPLOYEE',
          description: 'Regular Employee'
        }
      })
    ]);

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@dicelsecurity.com' },
      update: {},
      create: {
        email: 'admin@dicelsecurity.com',
        password: hashedPassword,
        role: {
          connect: {
            name: 'ADMIN'
          }
        },
        employee: {
          create: {
            firstName: 'System',
            lastName: 'Administrator',
            employeeId: 'EMP001',
            phoneNumber: '+1234567890',
            position: 'System Administrator',
            department: 'IT',
            dateOfBirth: new Date('1990-01-01'),
            dateJoined: new Date(),
            status: 'ACTIVE'
          }
        }
      }
    });

    // Create default departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { name: 'IT' },
        update: {},
        create: {
          name: 'IT',
          description: 'Information Technology Department'
        }
      }),
      prisma.department.upsert({
        where: { name: 'HR' },
        update: {},
        create: {
          name: 'HR',
          description: 'Human Resources Department'
        }
      }),
      prisma.department.upsert({
        where: { name: 'OPERATIONS' },
        update: {},
        create: {
          name: 'OPERATIONS',
          description: 'Operations Department'
        }
      }),
      prisma.department.upsert({
        where: { name: 'FINANCE' },
        update: {},
        create: {
          name: 'FINANCE',
          description: 'Finance Department'
        }
      })
    ]);

    // Create default equipment types
    const equipmentTypes = await Promise.all([
      prisma.equipmentType.upsert({
        where: { name: 'WEAPON' },
        update: {},
        create: {
          name: 'WEAPON',
          description: 'Security Weapons'
        }
      }),
      prisma.equipmentType.upsert({
        where: { name: 'VEHICLE' },
        update: {},
        create: {
          name: 'VEHICLE',
          description: 'Company Vehicles'
        }
      }),
      prisma.equipmentType.upsert({
        where: { name: 'UNIFORM' },
        update: {},
        create: {
          name: 'UNIFORM',
          description: 'Security Uniforms'
        }
      }),
      prisma.equipmentType.upsert({
        where: { name: 'COMMUNICATION' },
        update: {},
        create: {
          name: 'COMMUNICATION',
          description: 'Communication Devices'
        }
      })
    ]);

    // Create default leave types
    const leaveTypes = await Promise.all([
      prisma.leaveType.upsert({
        where: { name: 'ANNUAL' },
        update: {},
        create: {
          name: 'ANNUAL',
          description: 'Annual Leave',
          daysAllowed: 21
        }
      }),
      prisma.leaveType.upsert({
        where: { name: 'SICK' },
        update: {},
        create: {
          name: 'SICK',
          description: 'Sick Leave',
          daysAllowed: 14
        }
      }),
      prisma.leaveType.upsert({
        where: { name: 'MATERNITY' },
        update: {},
        create: {
          name: 'MATERNITY',
          description: 'Maternity Leave',
          daysAllowed: 90
        }
      }),
      prisma.leaveType.upsert({
        where: { name: 'PATERNITY' },
        update: {},
        create: {
          name: 'PATERNITY',
          description: 'Paternity Leave',
          daysAllowed: 14
        }
      })
    ]);

    console.log('Database seeded successfully');
    console.log('Created roles:', roles);
    console.log('Created admin user:', adminUser);
    console.log('Created departments:', departments);
    console.log('Created equipment types:', equipmentTypes);
    console.log('Created leave types:', leaveTypes);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 