import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

export const getRoomsByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const rooms = await prisma.room.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            defects: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        project: true,
        defects: {
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, name, floor, area, description } = req.body;

    const room = await prisma.room.create({
      data: {
        projectId,
        name,
        floor,
        area: area ? parseFloat(area) : null,
        description,
      },
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, floor, area, description } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        floor,
        area: area ? parseFloat(area) : null,
        description,
      },
    });

    res.json(room);
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.room.delete({
      where: { id },
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};
