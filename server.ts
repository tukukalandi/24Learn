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

// Helper to clean Folder IDs from extra junk (URLs, spaces, quotes)
const sanitizeId = (id: string | undefined): string => {
  if (!id) return '';
  // Remove everything after ? or #, and trim whitespace
  const base = id.split(/[?#]/)[0].trim().replace(/^['"]|['"]$/g, '');
  // If it's a URL, extract the ID after /folders/
  if (base.includes('/folders/')) {
    return base.split('/folders/')[1].split('/')[0];
  }
  return base;
};

// Google Drive Service Account Setup
const driveFolderId = sanitizeId(process.env.GOOGLE_DRIVE_FOLDER_ID || '1paMc3Olh8yEEsnOQ8cRosKSrGuiY7tVo');

const getDriveService = () => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  // Handle literal \n strings which often happen when pasting into env editors
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^['"]|['"]$/g, '');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.file']
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
      parents: [driveFolderId]
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true // Required for shared folders and shared drives
    });

    // Make the file publicly viewable so the link works for anyone on the site
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      },
      supportsAllDrives: true
    });

    res.json({ 
      id: response.data.id,
      link: response.data.webViewLink 
    });
  } catch (error: any) {
    console.error('Service Account Drive Upload Error:', error);
    
    let message = error.message || 'Failed to upload to Google Drive';
    if (message.includes('File not found')) {
      message = `Folder ID "${driveFolderId}" not found. Verify the ID and ensure you shared the folder with the Service Account email.`;
    } else if (message.includes('storage quota')) {
      message = 'Service Account Quota Exceeded. You MUST share the destination folder with the Service Account and ensure the folder owner has space.';
    }

    res.status(500).json({ error: message });
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
