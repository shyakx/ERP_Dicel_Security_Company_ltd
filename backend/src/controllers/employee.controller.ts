import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all employees
export const getAllEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching employees', error });
  }
};

// Get employee by ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching employee', error });
  }
};

// Create new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      employeeId,
      department,
      position,
      hireDate,
      salary,
      status,
    } = req.body;

    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        userId,
        employeeId,
        department,
        position,
        hireDate: new Date(hireDate),
        salary: parseFloat(salary),
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json(employee);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating employee', error });
  }
};

// Update employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      department,
      position,
      hireDate,
      salary,
      status,
    } = req.body;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        department,
        position,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary ? parseFloat(salary) : undefined,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating employee', error });
  }
};

// Delete employee
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete employee
    await prisma.employee.delete({
      where: { id },
    });

    return res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting employee', error });
  }
}; 