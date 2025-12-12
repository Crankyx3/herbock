import { Response } from 'express';
import db from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getRoomsByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const result = await db.query(
      `SELECT
        r.*,
        COUNT(d.id) as defect_count
       FROM rooms r
       LEFT JOIN defects d ON d."roomId" = r.id
       WHERE r."projectId" = $1
       GROUP BY r.id
       ORDER BY r.name ASC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const roomResult = await db.query(
      'SELECT * FROM rooms WHERE id = $1',
      [id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [roomResult.rows[0].projectId]
    );

    const defectsResult = await db.query(
      'SELECT * FROM defects WHERE "roomId" = $1 ORDER BY "createdAt" DESC',
      [id]
    );

    const room = {
      ...roomResult.rows[0],
      project: projectResult.rows[0],
      defects: defectsResult.rows,
    };

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, name, floor, area, description, floorPlanUrl } = req.body;

    const result = await db.query(
      `INSERT INTO rooms (id, "projectId", name, floor, area, description, "floorPlanUrl", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [projectId, name, floor, area ? parseFloat(area) : null, description, floorPlanUrl || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, floor, area, description, floorPlanUrl } = req.body;

    const result = await db.query(
      `UPDATE rooms
       SET name = $1, floor = $2, area = $3, description = $4, "floorPlanUrl" = $5, "updatedAt" = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, floor, area ? parseFloat(area) : null, description, floorPlanUrl !== undefined ? floorPlanUrl : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};
