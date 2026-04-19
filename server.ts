import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import { google } from 'googleapis';
import { Readable } from 'stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = 3000;
app.set('trust proxy', 1);
app.set('strict routing', false);

const isVercel = process.env.VERCEL === '1';
const isNetlify = process.env.NETLIFY === 'true' || !!process.env.LAMBDA_TASK_ROOT;
const isProd = process.env.NODE_ENV === 'production';

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Google Drive Service Account Setup
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1paMc3Olh8yEEsnOQ8cRosKSrGuiY7tVo';

const getDriveService = () => {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly']
  });
  return google.drive({ version: 'v3', auth });
};

// Upload Endpoint for Service Account
app.post('/api/drive/upload-service', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({ error: 'Google Drive Service Account not configured in environment variables.' });
    }

    const drive = getDriveService();
    const fileMetadata = {
      name: req.file.originalname,
      parents: [driveFolderId.split(/[?#]/)[0].trim().replace(/.*\/folders\//, '')] // Extract ID just in case
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer)
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Make file readable by anyone if possible (optional, depends on folder settings)
    try {
      await drive.permissions.create({
        fileId: file.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.warn('Could not set public permissions, file may be private:', permError);
    }

    res.json({ 
      id: file.data.id,
      link: file.data.webViewLink 
    });
  } catch (error: any) {
    console.error('Service Account Drive Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload to Google Drive via Service Account' });
  }
});

// Google OAuth Setup (Optional fallback helpers)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
);

app.get('/api/auth/google/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get('/api/auth/google/status', (req, res) => {
  res.json({
    configured: !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
    serviceAccountEmail: process.env.GOOGLE_CLIENT_EMAIL,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '1paMc3Olh8yEEsnOQ8cRosKSrGuiY7tVo'
  });
});

// Final Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error Handler]:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: err.message || 'An unexpected error occurred on the server.'
  });
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

  // Only listen on port if not in serverless environment
  if (!isVercel && !isNetlify) {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });
  }
}

setupVite();

export default app; // Export at the end to ensure all middleware is registered
