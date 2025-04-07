import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all attendance records
export const getAllAttendance = async (_req: Request, res: Response) => {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            position: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
      },
    });

    return res.json(attendance);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching attendance records', error });
  }
};

// Get attendance by ID
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            position: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    return res.json(attendance);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching attendance record', error });
  }
};

// Get attendance by employee
export const getAttendanceByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            position: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    return res.json(attendance);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching attendance records', error });
  }
};

// Check in
export const checkIn = async (req: Request, res: Response) => {
  try {
    const { employeeId, location } = req.body;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee has already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        checkIn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Employee has already checked in today' });
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        checkIn: new Date(),
        location: location ? location : undefined,
        status: 'PRESENT',
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            position: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
      },
    });

    return res.status(201).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: 'Error checking in', error });
  }
};

// Check out
export const checkOut = async (req: Request, res: Response) => {
  try {
    const { employeeId, location } = req.body;

    // Find today's attendance record
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        checkIn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Employee has already checked out today' });
    }

    // Update attendance record with check-out time
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        checkOutLocation: location ? location : undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            position: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
        },
      },
    });

    return res.json(updatedAttendance);
  } catch (error) {
    return res.status(500).json({ message: 'Error checking out', error });
  }
};

// Update attendance status
export const updateAttendanceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if attendance record exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update attendance status
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: { status },
    });

    return res.json(updatedAttendance);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating attendance status', error });
  }
}; 