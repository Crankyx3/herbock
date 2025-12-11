import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import db from './services/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ==================== Middleware ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== File Upload Configuration ====================
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and audio files are allowed.'));
    }
  },
});

// ==================== File Upload Routes ====================
// Upload single image/audio
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple images
app.post('/api/upload/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    res.json({ files: urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// ==================== API Routes ====================
app.use('/api', routes);

// ==================== Health Check ====================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Herbock Backend API is running' });
});

// ==================== Root Route ====================
app.get('/', (req, res) => {
  res.json({
    message: 'Herbock Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      projects: '/api/projects',
      rooms: '/api/rooms',
      defects: '/api/defects',
      upload: '/api/upload',
    },
  });
});

// ==================== Error Handler ====================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ==================== Start Server ====================
const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
      console.log(`🌐 External access: http://21.0.0.22:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await db.end();
  process.exit(0);
});

startServer();
