import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all incidents
export const getAllIncidents = async (_req: Request, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        project: true,
      },
    });
    return res.status(200).json(incidents);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching incidents', error });
  }
};

// Get incident by ID
export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching incident', error });
  }
};

// Create incident
export const createIncident = async (req: Request, res: Response) => {
  try {
    const { projectId, title, description, severity, status, reportedBy } = req.body;

    const incident = await prisma.incident.create({
      data: {
        projectId,
        title,
        description,
        severity,
        status,
        reportedBy,
      },
      include: {
        project: true,
      },
    });

    return res.status(201).json(incident);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating incident', error });
  }
};

// Update incident
export const updateIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, severity, status, resolution } = req.body;

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        title,
        description,
        severity,
        status,
        resolution,
      },
      include: {
        project: true,
      },
    });

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating incident', error });
  }
};

// Update incident status
export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    const incident = await prisma.incident.update({
      where: { id },
      data: { 
        status,
        resolution,
        resolvedDate: status === 'RESOLVED' ? new Date() : null,
      },
      include: {
        project: true,
      },
    });

    return res.status(200).json(incident);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating incident status', error });
  }
};

// Delete incident
export const deleteIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.incident.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting incident', error });
  }
}; 