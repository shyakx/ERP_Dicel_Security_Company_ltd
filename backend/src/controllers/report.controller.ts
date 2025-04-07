import { Request, Response } from 'express';
import { handleExport } from '../utils/export.utils';
import prisma from '../lib/prisma';

type ExportFormat = 'csv' | 'excel' | 'pdf' | 'preview';

interface AttendanceRecord {
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  checkIn: Date;
  checkOut: Date | null;
}

// Report controllers
export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Validate date format
    if (startDate && !Date.parse(startDate as string)) {
      return res.status(500).json({ message: 'Error generating attendance report', error: 'Invalid start date format' });
    }
    if (endDate && !Date.parse(endDate as string)) {
      return res.status(500).json({ message: 'Error generating attendance report', error: 'Invalid end date format' });
    }

    // Handle export format validation before database query
    if (format && format !== 'json' && !['csv', 'excel', 'pdf', 'preview'].includes(format as string)) {
      return res.status(500).json({ message: 'Error generating attendance report', error: 'Invalid export format' });
    }

    let attendance;
    try {
      attendance = await prisma.attendance.findMany({
        where: {
          ...(startDate && {
            checkIn: {
              gte: new Date(startDate as string)
            }
          }),
          ...(endDate && {
            checkOut: {
              lte: new Date(endDate as string)
            }
          })
        },
        include: {
          employee: true
        }
      });
    } catch (dbError) {
      return res.status(500).json({
        message: 'Error generating attendance report',
        error: dbError
      });
    }

    const formattedData = attendance.map((record: AttendanceRecord) => ({
      employeeId: record.employeeId,
      employeeName: `${record.employee.firstName} ${record.employee.lastName}`,
      checkIn: record.checkIn.toISOString(),
      checkOut: record.checkOut?.toISOString() || '',
      duration: record.checkOut ? 
        Math.round((record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60)) : 
        0
    }));

    if (format && format !== 'json') {
      return handleExport(formattedData, format as ExportFormat, 'attendance-report', res, {
        fields: ['employeeId', 'employeeName', 'checkIn', 'checkOut', 'duration'],
        title: 'Attendance Report',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`
      });
    }

    return res.status(200).json(formattedData);
  } catch (error) {
    return res.status(500).json({
      message: 'Error generating attendance report',
      error
    });
  }
};

export const getLeaveReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status, format } = req.query;

    // Validate date formats if provided
    if (startDate && !Date.parse(startDate as string)) {
      return res.status(500).json({ message: 'Error generating leave report', error: 'Invalid start date format' });
    }

    if (endDate && !Date.parse(endDate as string)) {
      return res.status(500).json({ message: 'Error generating leave report', error: 'Invalid end date format' });
    }

    // Validate status if provided
    if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      return res.status(500).json({ message: 'Error generating leave report', error: 'Invalid status value' });
    }

    // Handle export format
    if (format && !['csv', 'excel', 'pdf', 'preview'].includes(format as string)) {
      return res.status(500).json({ message: 'Error generating leave report', error: 'Invalid export format' });
    }

    const leaves = await prisma.leave.findMany({
      where: {
        ...(startDate && { startDate: { gte: new Date(startDate as string) } }),
        ...(endDate && { endDate: { lte: new Date(endDate as string) } }),
        ...(status && { status }),
      },
      include: {
        employee: true,
      },
    });

    if (format && format !== 'json') {
      return handleExport(
        leaves,
        format as ExportFormat,
        'leave-report',
        res,
        {
          fields: ['employee.firstName', 'employee.lastName', 'startDate', 'endDate', 'type', 'status'],
          title: 'Leave Report',
          subtitle: 'Generated on ' + new Date().toLocaleDateString(),
        }
      );
    }

    return res.status(200).json(leaves);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating leave report', error });
  }
};

export const getPayrollReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status, format } = req.query;

    // Validate date formats if provided
    if (startDate && !Date.parse(startDate as string)) {
      return res.status(500).json({ message: 'Error generating payroll report', error: 'Invalid start date format' });
    }

    if (endDate && !Date.parse(endDate as string)) {
      return res.status(500).json({ message: 'Error generating payroll report', error: 'Invalid end date format' });
    }

    // Validate status if provided
    if (status && !['PENDING', 'PAID'].includes(status as string)) {
      return res.status(500).json({ message: 'Error generating payroll report', error: 'Invalid status value' });
    }

    // Handle export format
    if (format && !['csv', 'excel', 'pdf', 'preview'].includes(format as string)) {
      return res.status(500).json({ message: 'Error generating payroll report', error: 'Invalid export format' });
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        ...(startDate && { date: { gte: new Date(startDate as string) } }),
        ...(endDate && { date: { lte: new Date(endDate as string) } }),
        ...(status && { status }),
      },
      include: {
        employee: true,
      },
    });

    if (format && format !== 'json') {
      return handleExport(
        payrolls,
        format as ExportFormat,
        'payroll-report',
        res,
        {
          fields: ['employee.firstName', 'employee.lastName', 'amount', 'month', 'year', 'status'],
          title: 'Payroll Report',
          subtitle: 'Generated on ' + new Date().toLocaleDateString(),
        }
      );
    }

    return res.status(200).json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating payroll report', error });
  }
};

export const getIncidentReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status, format } = req.query;

    // Validate date formats if provided
    if (startDate && !Date.parse(startDate as string)) {
      return res.status(500).json({ message: 'Error generating incident report', error: 'Invalid start date format' });
    }

    if (endDate && !Date.parse(endDate as string)) {
      return res.status(500).json({ message: 'Error generating incident report', error: 'Invalid end date format' });
    }

    // Validate status if provided
    if (status && !['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status as string)) {
      return res.status(500).json({ message: 'Error generating incident report', error: 'Invalid status value' });
    }

    // Handle export format
    if (format && !['csv', 'excel', 'pdf', 'preview'].includes(format as string)) {
      return res.status(500).json({ message: 'Error generating incident report', error: 'Invalid export format' });
    }

    const incidents = await prisma.incident.findMany({
      where: {
        ...(startDate && { date: { gte: new Date(startDate as string) } }),
        ...(endDate && { date: { lte: new Date(endDate as string) } }),
        ...(status && { status }),
      },
      include: {
        employee: true,
        project: true,
      },
    });

    if (format && format !== 'json') {
      return handleExport(
        incidents,
        format as ExportFormat,
        'incident-report',
        res,
        {
          fields: ['employee.firstName', 'employee.lastName', 'project.name', 'description', 'status', 'date'],
          title: 'Incident Report',
          subtitle: 'Generated on ' + new Date().toLocaleDateString(),
        }
      );
    }

    return res.status(200).json(incidents);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating incident report', error });
  }
};

export const getEquipmentReport = async (req: Request, res: Response) => {
  try {
    const { status, format } = req.query;

    // Validate status if provided
    if (status && !['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'].includes(status as string)) {
      return res.status(500).json({ message: 'Error generating equipment report', error: 'Invalid status value' });
    }

    // Handle export format
    if (format && !['csv', 'excel', 'pdf', 'preview'].includes(format as string)) {
      return res.status(500).json({ message: 'Error generating equipment report', error: 'Invalid export format' });
    }

    const equipment = await prisma.equipment.findMany({
      where: {
        ...(status && { status }),
      },
      include: {
        project: true,
      },
    });

    if (format && format !== 'json') {
      return handleExport(
        equipment,
        format as ExportFormat,
        'equipment-report',
        res,
        {
          fields: ['name', 'type', 'status', 'project.name'],
          title: 'Equipment Report',
          subtitle: 'Generated on ' + new Date().toLocaleDateString(),
        }
      );
    }

    return res.status(200).json(equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating equipment report', error });
  }
};

export const getProjectReport = async (req: Request, res: Response) => {
  try {
    const { status, format } = req.query;

    // Validate status if provided
    if (status && !['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].includes(status as string)) {
      return res.status(500).json({ message: 'Error generating project report', error: 'Invalid status value' });
    }

    // Handle export format
    if (format && !['csv', 'excel', 'pdf', 'preview'].includes(format as string)) {
      return res.status(500).json({ message: 'Error generating project report', error: 'Invalid export format' });
    }

    const projects = await prisma.project.findMany({
      where: {
        ...(status && { status }),
      },
      include: {
        client: true,
        employees: true,
        equipment: true,
      },
    });

    if (format && format !== 'json') {
      return handleExport(
        projects,
        format as ExportFormat,
        'project-report',
        res,
        {
          fields: ['name', 'client.name', 'status', 'startDate', 'endDate'],
          title: 'Project Report',
          subtitle: 'Generated on ' + new Date().toLocaleDateString(),
        }
      );
    }

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating project report', error });
  }
};