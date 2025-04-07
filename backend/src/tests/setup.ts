import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Extend global for Prisma
declare global {
  var prisma: PrismaClient;
}

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock data
export const mockAttendanceData = [
  { id: '1', employeeId: '1', status: 'PRESENT', checkIn: new Date(), checkOut: null },
  { id: '2', employeeId: '2', status: 'ABSENT', checkIn: new Date(), checkOut: new Date() },
];

export const mockLeaveData = [
  { id: '1', employeeId: '1', status: 'APPROVED', startDate: new Date(), endDate: new Date() },
  { id: '2', employeeId: '2', status: 'PENDING', startDate: new Date(), endDate: new Date() },
];

export const mockPayrollData = [
  { id: '1', employeeId: '1', amount: 1000, status: 'PAID', month: 1, year: 2024 },
  { id: '2', employeeId: '2', amount: 2000, status: 'PENDING', month: 1, year: 2024 },
];

export const mockIncidentData = [
  { id: '1', title: 'Incident 1', severity: 'HIGH', status: 'OPEN', reportedById: '1' },
  { id: '2', title: 'Incident 2', severity: 'LOW', status: 'CLOSED', reportedById: '2' },
];

export const mockEquipmentData = [
  { id: '1', name: 'Equipment 1', type: 'Type 1', status: 'AVAILABLE' },
  { id: '2', name: 'Equipment 2', type: 'Type 2', status: 'ASSIGNED' },
];

export const mockProjectData = [
  { id: '1', name: 'Project 1', status: 'ACTIVE', startDate: new Date(), endDate: new Date() },
  { id: '2', name: 'Project 2', status: 'COMPLETED', startDate: new Date(), endDate: new Date() },
];

// Create a new Prisma client for testing with mock implementation
const prisma = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
  $queryRaw: jest.fn().mockResolvedValue([
    { tablename: 'users' },
    { tablename: 'employees' },
    { tablename: 'attendance' },
    { tablename: 'leave' },
    { tablename: 'payroll' },
    { tablename: 'incidents' },
    { tablename: 'equipment' },
    { tablename: 'projects' }
  ]),
  attendance: {
    findMany: jest.fn().mockResolvedValue(mockAttendanceData),
    count: jest.fn().mockResolvedValue(2),
  },
  leave: {
    findMany: jest.fn().mockResolvedValue(mockLeaveData),
    count: jest.fn().mockResolvedValue(2),
  },
  payroll: {
    findMany: jest.fn().mockResolvedValue(mockPayrollData),
    count: jest.fn().mockResolvedValue(2),
  },
  incident: {
    findMany: jest.fn().mockResolvedValue(mockIncidentData),
    count: jest.fn().mockResolvedValue(2),
  },
  equipment: {
    findMany: jest.fn().mockResolvedValue(mockEquipmentData),
    count: jest.fn().mockResolvedValue(2),
  },
  project: {
    findMany: jest.fn().mockResolvedValue(mockProjectData),
    count: jest.fn().mockResolvedValue(2),
  },
} as unknown as PrismaClient;

// Global setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Global teardown
afterAll(async () => {
  // Clean up database
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }: { tablename: string }) => tablename)
    .filter((name: string) => name !== '_prisma_migrations')
    .map((name: string) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log('Error cleaning up test database:', error);
  }

  // Disconnect Prisma
  await prisma.$disconnect();
});

// Reset database before each test
beforeEach(async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }: { tablename: string }) => tablename)
    .filter((name: string) => name !== '_prisma_migrations')
    .map((name: string) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log('Error resetting test database:', error);
  }
});

// Make prisma available globally in tests
global.prisma = prisma;

// Mock handleExport function
jest.mock('../utils/export.utils', () => ({
  handleExport: jest.fn().mockResolvedValue({ data: 'mock-export-data' }),
})); 