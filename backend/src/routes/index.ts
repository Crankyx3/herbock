import { Router } from 'express';
import * as projectsController from '../controllers/projectsController';
import * as roomsController from '../controllers/roomsController';

const router = Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ==================== Project Routes ====================
router.get('/projects', projectsController.getAllProjects);
router.get('/projects/:id', projectsController.getProjectById);
router.post('/projects', projectsController.createProject);
router.put('/projects/:id', projectsController.updateProject);
router.delete('/projects/:id', projectsController.deleteProject);

// ==================== Room Routes ====================
router.get('/projects/:projectId/rooms', roomsController.getRoomsByProject);
router.get('/rooms/:id', roomsController.getRoomById);
router.post('/rooms', roomsController.createRoom);
router.put('/rooms/:id', roomsController.updateRoom);
router.delete('/rooms/:id', roomsController.deleteRoom);

// TODO: Add authentication middleware back when auth is implemented
// TODO: Add defects routes
// TODO: Add auth routes

export default router;
