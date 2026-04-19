import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import multer from 'multer';
import cookieSession from 'cookie-session';
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
app.use(cookieSession({
  name: 'google-drive-session',
  // Using a stable key for sessions to prevent resets on deployment
  keys: [process.env.SESSION_SECRET || 'postal-knowledge-secure-fallback-key-2024'],
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  secure: true,
  sameSite: 'none',
  httpOnly: false
}));

// Google OAuth Setup
const sanitizeUrl = (url: string | undefined) => {
  if (!url) return '';
  // Remove "URL " prefix if accidentally added, trim spaces and trailing slashes
  return url.replace(/^URL\s+/i, '').trim().replace(/\/+$/, '');
};

const rawAppUrl = process.env.APP_URL || 'http://localhost:3000';
const sanitizedAppUrl = sanitizeUrl(rawAppUrl);
const redirectUri = sanitizeUrl(process.env.GOOGLE_REDIRECT_URI) || `${sanitizedAppUrl}/auth/callback`;

console.log('--- Google OAuth Init ---');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'MISSING');
console.log('App URL:', sanitizedAppUrl);
console.log('Redirect URI:', redirectUri);
console.log('-------------------------');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

// Endpoints
app.get('/api/auth/google/url', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google Client ID or Secret is missing in environment variables.' });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    prompt: 'consent',
    redirect_uri: redirectUri // Explicitly passing it to be safe
  });
  res.json({ url });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    req.session!.tokens = tokens;
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/internal-portal';
            }
          </script>
          <p>Authentication successful. You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/api/auth/google/status', (req, res) => {
  res.json({ connected: !!req.session?.tokens });
});

// NEW: Server-to-Server Google Drive Upload (No popups required)
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
      parents: [folderId] // Save directly to the user's specific folder
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

    // Make the file publicly readable so users can see it on the portal
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

app.post('/api/drive/upload', upload.single('file'), async (req, res) => {
  if (!req.session?.tokens) return res.status(401).json({ error: 'Not connected to Google Drive' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: req.file.originalname,
    };
    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    // Make file public if requested or just return the link
    // Note: By default files are private. Let's make it readable by anyone with the link
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    res.json({ 
      id: response.data.id,
      link: response.data.webViewLink
    });
  } catch (error: any) {
    console.error('Drive Upload Error:', error);
    const errorMessage = error.response?.data?.error_description || error.message || 'Failed to upload to Google Drive';
    res.status(500).json({ error: errorMessage });
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
    // Vercel / Production Path
    // On Vercel, assets are usually in the same directory as the function or predictable
    const possiblePaths = [
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, 'dist'),
      path.resolve(process.cwd(), 'app/applet/dist'),
      path.resolve(process.cwd(), '.next/server/chunks/dist') // Some Vercel internals
    ];
    
    let distPath = possiblePaths[0];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        distPath = p;
        break;
      }
    }
    
    console.log('[Server] Static Assets Root:', distPath);
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`Application Error: build files not found. Please ensure "npm run build" completed.`);
      }
    });
  }

  // Only listen if not on Vercel
  if (!isVercel && (isProd || process.env.VITE_DEV === 'true')) {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });
  }
}

setupVite();
