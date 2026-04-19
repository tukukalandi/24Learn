import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';

import { Readable } from 'stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export default app; // Required for Vercel

const port = 3000;

// Important: Trust proxy is required for secure cookies behind Nginx
app.set('trust proxy', 1);

const isVercel = process.env.VERCEL === '1';
const isProd = process.env.NODE_ENV === 'production';

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Automated Service Account Upload (No popups required)
app.post('/api/drive/upload-service', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Replace literal \n with actual newlines for the private key
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); 
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      return res.status(500).json({ 
        error: 'Google Drive is not configured. Missing Service Account details in environment variables.' 
      });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId]
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Make the file publicly readable
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    res.json({ link: response.data.webViewLink });
  } catch (error: any) {
    console.error('Service Account Drive Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload to Google Drive' });
  }
});

// Vite Middleware / Static Files
async function setupVite() {
  if (!isProd && !isVercel) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Standard Production Build Path
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA Fallback: Send index.html for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen on port if not on Vercel
  if (!isVercel) {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });
  }
}

setupVite();
