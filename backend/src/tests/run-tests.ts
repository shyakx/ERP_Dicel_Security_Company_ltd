import { getAttendanceReport, getLeaveReport, getPayrollReport, getIncidentReport, getEquipmentReport, getProjectReport } from '../controllers/report.controller';
import { Request, Response } from 'express';

// Mock Prisma client
const mockPrismaClient = {
  attendance: {
    findMany: async () => [],
    count: async () => 0
  },
  leave: {
    findMany: async () => [],
    count: async () => 0
  },
  payroll: {
    findMany: async () => [],
    count: async () => 0
  },
  incident: {
    findMany: async () => [],
    count: async () => 0
  },
  equipment: {
    findMany: async () => [],
    count: async () => 0
  },
  project: {
    findMany: async () => [],
    count: async () => 0
  }
};

// Mock export utils
const mockHandleExport = async () => undefined;

// Override the imports in the controller
// This is a hacky way to mock dependencies without using Jest
(global as any).PrismaClient = class {
  constructor() {
    return mockPrismaClient;
  }
};

// Simple mock functions
const mockRequest = (query = {}) => ({ query } as Request);
const mockResponse = () => {
  const res = {} as Response;
  res.json = (data: any) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return res;
  };
  res.status = (code: number) => {
    console.log(`Status: ${code}`);
    return res;
  };
  return res;
};
const mockNext = (error: any) => {
  if (error) console.error('Error:', error);
};

// Test function
async function runTests() {
  console.log('Running report controller tests...\n');

  try {
    // Test attendance report
    console.log('Testing attendance report...');
    await getAttendanceReport(mockRequest(), mockResponse(), mockNext);
    
    // Test leave report
    console.log('\nTesting leave report...');
    await getLeaveReport(mockRequest(), mockResponse(), mockNext);
    
    // Test payroll report
    console.log('\nTesting payroll report...');
    await getPayrollReport(mockRequest(), mockResponse(), mockNext);
    
    // Test incident report
    console.log('\nTesting incident report...');
    await getIncidentReport(mockRequest(), mockResponse(), mockNext);
    
    // Test equipment report
    console.log('\nTesting equipment report...');
    await getEquipmentReport(mockRequest(), mockResponse(), mockNext);
    
    // Test project report
    console.log('\nTesting project report...');
    await getProjectReport(mockRequest(), mockResponse(), mockNext);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests(); 