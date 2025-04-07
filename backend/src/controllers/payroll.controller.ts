import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all payroll records
export const getAllPayrolls = async (_req: Request, res: Response) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: {
        employee: true,
      },
    });
    return res.status(200).json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching payrolls', error });
  }
};

// Get payroll by ID
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    return res.status(200).json(payroll);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching payroll', error });
  }
};

// Get payrolls by employee ID
export const getPayrollsByEmployeeId = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const payrolls = await prisma.payroll.findMany({
      where: {
        employeeId,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        month: 'desc',
      },
    });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payrolls', error });
  }
};

// Create payroll
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const { 
      employeeId, 
      month, 
      year, 
      basicSalary, 
      allowances, 
      deductions, 
      netSalary,
      status,
      paymentDate 
    } = req.body;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
      },
      include: {
        employee: true,
      },
    });

    return res.status(201).json(payroll);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating payroll', error });
  }
};

// Update payroll
export const updatePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      month, 
      year, 
      basicSalary, 
      allowances, 
      deductions, 
      netSalary,
      status,
      paymentDate 
    } = req.body;

    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        month,
        year,
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      },
      include: {
        employee: true,
      },
    });

    return res.status(200).json(payroll);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating payroll', error });
  }
};

// Update payroll status
export const updatePayrollStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentDate } = req.body;

    const payroll = await prisma.payroll.update({
      where: { id },
      data: { 
        status,
        paymentDate: status === 'PAID' ? new Date() : paymentDate ? new Date(paymentDate) : undefined,
      },
      include: {
        employee: true,
      },
    });

    return res.status(200).json(payroll);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating payroll status', error });
  }
};

// Delete payroll
export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.payroll.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting payroll', error });
  }
}; 