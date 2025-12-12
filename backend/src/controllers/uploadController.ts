import { Request, Response } from 'express';
import path from 'path';
import { AuthRequest } from '../middleware/auth';

export const uploadFloorPlan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    // Generate public URL for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;

    console.log('✅ Floor plan uploaded:', req.file.filename);

    res.status(200).json({
      message: 'Grundriss erfolgreich hochgeladen',
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen der Datei' });
  }
};

export const deleteFloorPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: 'Kein Dateiname angegeben' });
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Datei nicht gefunden' });
    }

    // Delete file
    fs.unlinkSync(filePath);

    console.log('✅ Floor plan deleted:', filename);

    res.status(200).json({
      message: 'Grundriss erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Datei' });
  }
};
