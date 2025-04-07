// Mock data
const mockAttendanceData = [
  {
    id: 1,
    employeeId: 1,
    date: new Date(),
    checkIn: new Date(),
    checkOut: new Date(),
    status: 'PRESENT',
  },
];

const mockLeaveData = [
  {
    id: 1,
    employeeId: 1,
    startDate: new Date(),
    endDate: new Date(),
    type: 'ANNUAL',
    status: 'PENDING',
  },
];

const mockPayrollData = [
  {
    id: 1,
    employeeId: 1,
    month: 1,
    year: 2024,
    basicSalary: 1000,
    allowances: 200,
    deductions: 100,
    netSalary: 1100,
  },
];

const mockIncidentData = [
  {
    id: 1,
    title: 'Test Incident',
    description: 'Test Description',
    location: 'Test Location',
    severity: 'LOW',
    status: 'OPEN',
    reportedBy: 1,
    assignedTo: 1,
  },
];

const mockEquipmentData = [
  {
    id: 1,
    name: 'Test Equipment',
    type: 'WEAPON',
    status: 'ACTIVE',
    assignedTo: 1,
  },
];

const mockProjectData = [
  {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    status: 'ACTIVE',
    managerId: 1,
  },
];

// Mock Prisma client
const mockPrismaClient = {
  attendance: {
    findMany: jest.fn().mockResolvedValue(mockAttendanceData),
    count: jest.fn().mockResolvedValue(1),
  },
  leave: {
    findMany: jest.fn().mockResolvedValue(mockLeaveData),
    count: jest.fn().mockResolvedValue(1),
  },
  payroll: {
    findMany: jest.fn().mockResolvedValue(mockPayrollData),
    count: jest.fn().mockResolvedValue(1),
  },
  incident: {
    findMany: jest.fn().mockResolvedValue(mockIncidentData),
    count: jest.fn().mockResolvedValue(1),
  },
  equipment: {
    findMany: jest.fn().mockResolvedValue(mockEquipmentData),
    count: jest.fn().mockResolvedValue(1),
  },
  project: {
    findMany: jest.fn().mockResolvedValue(mockProjectData),
    count: jest.fn().mockResolvedValue(1),
  },
};

export class PrismaClient {
  constructor() {
    return mockPrismaClient;
  }
}

export { mockPrismaClient }; 