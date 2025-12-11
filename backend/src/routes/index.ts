import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as projectsController from '../controllers/projectsController';
import * as roomsController from '../controllers/roomsController';
import * as defectsController from '../controllers/defectsController';

const router = Router();

// ==================== Auth Routes ====================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// ==================== Project Routes ====================
router.get('/projects', authenticateToken, projectsController.getAllProjects);
router.get('/projects/:id', authenticateToken, projectsController.getProjectById);
router.post('/projects', authenticateToken, requireAdmin, projectsController.createProject);
router.put('/projects/:id', authenticateToken, requireAdmin, projectsController.updateProject);
router.delete('/projects/:id', authenticateToken, requireAdmin, projectsController.deleteProject);

// ==================== Room Routes ====================
router.get('/projects/:projectId/rooms', authenticateToken, roomsController.getRoomsByProject);
router.get('/rooms/:id', authenticateToken, roomsController.getRoomById);
router.post('/rooms', authenticateToken, requireAdmin, roomsController.createRoom);
router.put('/rooms/:id', authenticateToken, requireAdmin, roomsController.updateRoom);
router.delete('/rooms/:id', authenticateToken, requireAdmin, roomsController.deleteRoom);

// ==================== Defect Routes ====================
router.get('/projects/:projectId/defects', authenticateToken, defectsController.getDefectsByProject);
router.get('/defects/:id', authenticateToken, defectsController.getDefectById);
router.post('/defects', authenticateToken, defectsController.createDefect);
router.put('/defects/:id', authenticateToken, defectsController.updateDefect);
router.delete('/defects/:id', authenticateToken, defectsController.deleteDefect);

export default router;
