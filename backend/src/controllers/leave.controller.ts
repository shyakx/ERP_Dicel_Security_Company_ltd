import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all leave requests
export const getAllLeaves = async (_req: Request, res: Response) => {
  try {
    const leaves = await prisma.leave.findMany({
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching leave requests', error });
  }
};

// Get leave request by ID
export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leave.findUnique({
      where: { id },
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    return res.json(leave);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching leave request', error });
  }
};

// Get leave requests by employee ID
export const getLeavesByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Build query
    const where: any = {
      employeeId,
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching leave requests', error });
  }
};

// Create leave request
export const createLeave = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, type, reason } = req.body;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await prisma.leave.findFirst({
      where: {
        employeeId,
        status: 'PENDING',
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
        ],
      },
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        message: 'Employee already has a pending leave request for this period' 
      });
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: 'PENDING',
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
    });

    return res.status(201).json(leave);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating leave request', error });
  }
};

// Update leave request
export const updateLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, type, reason } = req.body;

    // Check if leave request exists
    const existingLeave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!existingLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow updates if status is PENDING
    if (existingLeave.status !== 'PENDING') {
      return res.status(400).json({ 
        message: 'Cannot update leave request that has already been processed' 
      });
    }

    // Update leave request
    const leave = await prisma.leave.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
        reason,
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
    });

    return res.json(leave);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating leave request', error });
  }
};

// Process leave request (approve/reject)
export const processLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedById } = req.body;

    // Check if leave request exists
    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Update leave request
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedById,
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
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.json(updatedLeave);
  } catch (error) {
    return res.status(500).json({ message: 'Error processing leave request', error });
  }
};

// Delete leave request
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if leave request exists
    const existingLeave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!existingLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow deletion if status is PENDING
    if (existingLeave.status !== 'PENDING') {
      return res.status(400).json({ 
        message: 'Cannot delete leave request that has already been processed' 
      });
    }

    // Delete leave request
    await prisma.leave.delete({
      where: { id },
    });

    return res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting leave request', error });
  }
}; 