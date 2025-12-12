import { Response } from 'express';
import db from '../services/db';
import { AuthRequest } from '../middleware/auth';

export const getAllProjects = async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT
        p.*,
        COUNT(DISTINCT r.id) as room_count,
        COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'OPEN') as open_defects_count
      FROM projects p
      LEFT JOIN rooms r ON r."projectId" = p.id
      LEFT JOIN defects d ON d."projectId" = p.id
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const roomsResult = await db.query(
      'SELECT * FROM rooms WHERE "projectId" = $1 ORDER BY name',
      [id]
    );

    const defectsResult = await db.query(
      'SELECT * FROM defects WHERE "projectId" = $1 ORDER BY "createdAt" DESC',
      [id]
    );

    const project = {
      ...projectResult.rows[0],
      rooms: roomsResult.rows,
      defects: defectsResult.rows,
    };

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, startDate, endDate, floorPlanUrl } = req.body;

    const result = await db.query(
      `INSERT INTO projects (id, name, description, status, "startDate", "endDate", "floorPlanUrl", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'ACTIVE', $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [name, description, startDate, endDate, floorPlanUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate, floorPlanUrl } = req.body;

    const result = await db.query(
      `UPDATE projects
       SET name = $1, description = $2, status = $3, "startDate" = $4, "endDate" = $5, "floorPlanUrl" = $6, "updatedAt" = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, status, startDate, endDate, floorPlanUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
