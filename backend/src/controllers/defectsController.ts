import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../middleware/auth';

export const getDefectsByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const defects = await prisma.defect.findMany({
      where: { projectId },
      include: {
        room: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match mobile app structure
    const transformedDefects = defects.map((defect) => ({
      id: defect.id,
      projectId: defect.projectId,
      roomId: defect.roomId,
      title: defect.title,
      description: defect.description,
      originalDescription: defect.originalDescription,
      originalLanguage: defect.originalLanguage,
      status: defect.status,
      priority: defect.priority,
      assignedTo: defect.assignedTo?.id,
      createdBy: defect.createdBy.id,
      location: defect.locationX && defect.locationY
        ? {
            x: defect.locationX,
            y: defect.locationY,
            floor: defect.locationFloor,
          }
        : undefined,
      images: defect.images,
      audioUrl: defect.audioUrl,
      createdAt: defect.createdAt,
      updatedAt: defect.updatedAt,
    }));

    res.json(transformedDefects);
  } catch (error) {
    console.error('Get defects error:', error);
    res.status(500).json({ error: 'Failed to fetch defects' });
  }
};

export const getDefectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const defect = await prisma.defect.findUnique({
      where: { id },
      include: {
        project: true,
        room: true,
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
    });

    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    res.json(defect);
  } catch (error) {
    console.error('Get defect error:', error);
    res.status(500).json({ error: 'Failed to fetch defect' });
  }
};

export const createDefect = async (req: AuthRequest, res: Response) => {
  try {
    const {
      projectId,
      roomId,
      title,
      description,
      originalDescription,
      originalLanguage,
      priority,
      assignedToId,
      location,
      images,
      audioUrl,
    } = req.body;

    // Create defect
    const defect = await prisma.defect.create({
      data: {
        projectId,
        roomId,
        title,
        description,
        originalDescription,
        originalLanguage,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        createdById: req.userId!,
        assignedToId,
        locationX: location?.x,
        locationY: location?.y,
        locationFloor: location?.floor,
        images: images || [],
        audioUrl,
      },
      include: {
        room: true,
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
    });

    // Update project's open defects count
    await prisma.project.update({
      where: { id: projectId },
      data: {
        openDefects: {
          increment: 1,
        },
      },
    });

    res.status(201).json(defect);
  } catch (error) {
    console.error('Create defect error:', error);
    res.status(500).json({ error: 'Failed to create defect' });
  }
};

export const updateDefect = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      assignedToId,
      location,
      images,
      audioUrl,
    } = req.body;

    // Get old defect to check status change
    const oldDefect = await prisma.defect.findUnique({
      where: { id },
    });

    if (!oldDefect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    // Update defect
    const defect = await prisma.defect.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        assignedToId,
        locationX: location?.x,
        locationY: location?.y,
        locationFloor: location?.floor,
        images,
        audioUrl,
      },
      include: {
        room: true,
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
    });

    // Update project's open defects count if status changed
    if (status && oldDefect.status !== status) {
      const wasOpen = oldDefect.status === 'OPEN';
      const isNowOpen = status === 'OPEN';

      if (wasOpen && !isNowOpen) {
        // Defect was closed
        await prisma.project.update({
          where: { id: oldDefect.projectId },
          data: {
            openDefects: {
              decrement: 1,
            },
          },
        });
      } else if (!wasOpen && isNowOpen) {
        // Defect was reopened
        await prisma.project.update({
          where: { id: oldDefect.projectId },
          data: {
            openDefects: {
              increment: 1,
            },
          },
        });
      }
    }

    res.json(defect);
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({ error: 'Failed to update defect' });
  }
};

export const deleteDefect = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const defect = await prisma.defect.findUnique({
      where: { id },
    });

    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    await prisma.defect.delete({
      where: { id },
    });

    // Update project's open defects count if it was open
    if (defect.status === 'OPEN') {
      await prisma.project.update({
        where: { id: defect.projectId },
        data: {
          openDefects: {
            decrement: 1,
          },
        },
      });
    }

    res.json({ message: 'Defect deleted successfully' });
  } catch (error) {
    console.error('Delete defect error:', error);
    res.status(500).json({ error: 'Failed to delete defect' });
  }
};
