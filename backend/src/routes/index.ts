import { Router } from 'express';
import * as projectsController from '../controllers/projectsController';
import * as roomsController from '../controllers/roomsController';
import * as defectsController from '../controllers/defectsController';
import * as uploadController from '../controllers/uploadController';
import { upload } from '../middleware/upload';

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

// ==================== Defect Routes ====================
router.get('/projects/:projectId/defects', defectsController.getDefectsByProject);
router.get('/defects/:id', defectsController.getDefectById);
router.post('/defects', defectsController.createDefect);
router.put('/defects/:id', defectsController.updateDefect);
router.delete('/defects/:id', defectsController.deleteDefect);

// ==================== Upload Routes ====================
router.post('/upload/floorplan', upload.single('floorplan'), uploadController.uploadFloorPlan);
router.delete('/upload/floorplan/:filename', uploadController.deleteFloorPlan);

// TODO: Add authentication middleware back when auth is implemented
// TODO: Add auth routes

export default router;
