import { Router } from 'express';

const router = Router();

// Temporary simplified routes - controllers will be connected once Prisma is fully set up

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// TODO: Enable these routes once Prisma Client is generated
// Import controllers and set up full routes

export default router;
