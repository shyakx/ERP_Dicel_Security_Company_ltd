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

// Mock Prisma client
export const mockPrismaClient = {
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
}; 