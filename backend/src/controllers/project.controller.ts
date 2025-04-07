import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all projects
export const getAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            contactPerson: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching projects', error });
  }
};

// Get project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            contactPerson: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching project', error });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      clientId,
      startDate,
      endDate,
      status,
      location,
      securityRequirements,
      numberOfGuards,
      shiftPattern,
      equipmentNeeded,
      budget,
    } = req.body;

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        location,
        securityRequirements,
        numberOfGuards: parseInt(numberOfGuards),
        shiftPattern,
        equipmentNeeded,
        budget: parseFloat(budget),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            contactPerson: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating project', error });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      clientId,
      startDate,
      endDate,
      status,
      location,
      securityRequirements,
      numberOfGuards,
      shiftPattern,
      equipmentNeeded,
      budget,
    } = req.body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if client exists when clientId is provided
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
    }

    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        clientId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        status,
        location,
        securityRequirements,
        numberOfGuards: numberOfGuards ? parseInt(numberOfGuards) : undefined,
        shiftPattern,
        equipmentNeeded,
        budget: budget ? parseFloat(budget) : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            contactPerson: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating project', error });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete project
    await prisma.project.delete({
      where: { id },
    });

    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting project', error });
  }
};

// Assign employees to project
export const assignEmployees = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if all employees exist
    const employees = await prisma.employee.findMany({
      where: {
        id: {
          in: employeeIds,
        },
      },
    });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({ message: 'One or more employees not found' });
    }

    // Create project assignments
    const assignments = await prisma.$transaction(
      employeeIds.map((employeeId: string) =>
        prisma.projectAssignment.create({
          data: {
            projectId: id,
            employeeId,
            assignedDate: new Date(),
          },
        })
      )
    );

    return res.json({
      message: 'Employees assigned successfully',
      assignments,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning employees', error });
  }
}; 