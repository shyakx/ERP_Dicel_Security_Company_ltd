import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all clients
export const getAllClients = async (_req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        projects: true,
      },
    });

    return res.json(clients);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching clients', error });
  }
};

// Get client by ID
export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: true,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    return res.json(client);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching client', error });
  }
};

// Create new client
export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      contractStartDate,
      contractEndDate,
      status,
    } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        contactPerson,
        email,
        phone,
        address,
        contractStartDate: new Date(contractStartDate),
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        status,
      },
    });

    return res.status(201).json(client);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating client', error });
  }
};

// Update client
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      contractStartDate,
      contractEndDate,
      status,
    } = req.body;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        contactPerson,
        email,
        phone,
        address,
        contractStartDate: contractStartDate ? new Date(contractStartDate) : undefined,
        contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        status,
      },
    });

    return res.json(client);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating client', error });
  }
};

// Delete client
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete client
    await prisma.client.delete({
      where: { id },
    });

    return res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting client', error });
  }
}; 