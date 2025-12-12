import { Response } from 'express';
import db from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getDefectsByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const result = await db.query(
      `SELECT
        d.*,
        r.name as room_name,
        creator.id as creator_id,
        creator."firstName" as creator_first_name,
        creator."lastName" as creator_last_name,
        creator.email as creator_email,
        assigned.id as assigned_id,
        assigned."firstName" as assigned_first_name,
        assigned."lastName" as assigned_last_name,
        assigned.email as assigned_email
       FROM defects d
       LEFT JOIN rooms r ON r.id = d."roomId"
       LEFT JOIN users creator ON creator.id = d."createdById"
       LEFT JOIN users assigned ON assigned.id = d."assignedToId"
       WHERE d."projectId" = $1
       ORDER BY d."createdAt" DESC`,
      [projectId]
    );

    const defects = result.rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      roomId: row.roomId,
      title: row.title,
      description: row.description,
      originalDescription: row.originalDescription,
      originalLanguage: row.originalLanguage,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_id,
      createdBy: row.creator_id,
      location: row.locationX && row.locationY
        ? {
            x: row.locationX,
            y: row.locationY,
            floor: row.locationFloor,
          }
        : undefined,
      images: row.images,
      audioUrl: row.audioUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      room: {
        name: row.room_name,
      },
    }));

    res.json(defects);
  } catch (error) {
    console.error('Get defects error:', error);
    res.status(500).json({ error: 'Failed to fetch defects' });
  }
};

export const getDefectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
        d.*,
        p.name as project_name,
        r.name as room_name,
        creator.id as creator_id,
        creator."firstName" as creator_first_name,
        creator."lastName" as creator_last_name,
        creator.email as creator_email,
        assigned.id as assigned_id,
        assigned."firstName" as assigned_first_name,
        assigned."lastName" as assigned_last_name,
        assigned.email as assigned_email
       FROM defects d
       LEFT JOIN projects p ON p.id = d."projectId"
       LEFT JOIN rooms r ON r.id = d."roomId"
       LEFT JOIN users creator ON creator.id = d."createdById"
       LEFT JOIN users assigned ON assigned.id = d."assignedToId"
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    const row = result.rows[0];
    const defect = {
      ...row,
      project: { name: row.project_name },
      room: { name: row.room_name },
      createdBy: row.creator_id ? {
        id: row.creator_id,
        firstName: row.creator_first_name,
        lastName: row.creator_last_name,
        email: row.creator_email,
      } : null,
      assignedTo: row.assigned_id ? {
        id: row.assigned_id,
        firstName: row.assigned_first_name,
        lastName: row.assigned_last_name,
        email: row.assigned_email,
      } : null,
    };

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

    const result = await db.query(
      `INSERT INTO defects (
        id,
        "projectId",
        "roomId",
        title,
        description,
        "originalDescription",
        "originalLanguage",
        priority,
        status,
        "createdById",
        "assignedToId",
        "locationX",
        "locationY",
        "locationFloor",
        images,
        "audioUrl",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        $1, $2, $3, $4, $5, $6, $7, 'OPEN', $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      ) RETURNING *`,
      [
        projectId,
        roomId,
        title,
        description,
        originalDescription,
        originalLanguage,
        priority || 'MEDIUM',
        req.userId!,
        assignedToId,
        location?.x,
        location?.y,
        location?.floor,
        images || [],
        audioUrl,
      ]
    );

    res.status(201).json(result.rows[0]);
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

    const result = await db.query(
      `UPDATE defects
       SET
         title = $1,
         description = $2,
         status = $3,
         priority = $4,
         "assignedToId" = $5,
         "locationX" = $6,
         "locationY" = $7,
         "locationFloor" = $8,
         images = $9,
         "audioUrl" = $10,
         "updatedAt" = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        title,
        description,
        status,
        priority,
        assignedToId,
        location?.x,
        location?.y,
        location?.floor,
        images ? JSON.stringify(images) : null,
        audioUrl,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({ error: 'Failed to update defect' });
  }
};

export const deleteDefect = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM defects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    res.json({ message: 'Defect deleted successfully' });
  } catch (error) {
    console.error('Delete defect error:', error);
    res.status(500).json({ error: 'Failed to delete defect' });
  }
};
