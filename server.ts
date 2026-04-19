import express from 'express';
import path from 'path';
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

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieSession({
  name: 'google-drive-session',
  keys: [process.env.SESSION_SECRET || 'dakshiksha-secret-key'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true,
  sameSite: 'none',
  httpOnly: false // Needed for some iframe scenarios
}));

// Google OAuth Setup
const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;

console.log('--- Google OAuth Init ---');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'MISSING');
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

// Vite Middleware
async function setupVite() {
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Vercel / Production Path
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || process.env.VITE_DEV === 'true') {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });
  }
}

setupVite();
