import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all equipment
export const getAllEquipment = async (_req: Request, res: Response) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        assignments: {
          where: {
            returnDate: null
          },
          select: {
            id: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching equipment', error });
  }
};

// Get equipment by ID
export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        assignments: {
          where: {
            returnDate: null
          },
          select: {
            id: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    return res.json(equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching equipment', error });
  }
};

// Create equipment
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name, type, serialNumber, status, purchaseDate } = req.body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        type,
        serialNumber,
        status,
        purchaseDate: new Date(purchaseDate),
      },
    });

    return res.status(201).json(equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating equipment', error });
  }
};

// Update equipment
export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, serialNumber, status, purchaseDate, lastMaintenance, nextMaintenance } = req.body;

    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Update equipment
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        type,
        serialNumber,
        status,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : undefined,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
      },
      include: {
        assignments: {
          where: {
            returnDate: null
          },
          select: {
            id: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return res.json(equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating equipment', error });
  }
};

// Assign equipment to project
export const assignEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectId, notes } = req.body;

    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        assignments: {
          where: {
            returnDate: null
          }
        }
      }
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if equipment is already assigned
    if (existingEquipment.assignments.length > 0) {
      return res.status(400).json({ message: 'Equipment is already assigned' });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Create assignment and update equipment status
    const [assignment] = await prisma.$transaction([
      prisma.equipmentAssignment.create({
        data: {
          equipmentId: id,
          projectId,
          notes,
          status: 'ASSIGNED',
        },
      }),
      prisma.equipment.update({
        where: { id },
        data: {
          status: 'ASSIGNED',
        },
      }),
    ]);

    return res.json(assignment);
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning equipment', error });
  }
};

// Delete equipment
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if equipment exists and has no active assignments
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        assignments: {
          where: {
            returnDate: null
          }
        }
      }
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if equipment has active assignments
    if (existingEquipment.assignments.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete equipment that is currently assigned' 
      });
    }

    // Delete equipment
    await prisma.equipment.delete({
      where: { id },
    });

    return res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting equipment', error });
  }
}; 