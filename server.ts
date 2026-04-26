import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieSession from 'cookie-session';
import { google } from 'googleapis';
import { Readable } from 'stream';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = 3000;
app.set('trust proxy', 1);
app.set('strict routing', false);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'dakshiksha-secret-key-v1'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true,
  httpOnly: true,
  sameSite: 'none'
}));

const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const isNetlify = process.env.NETLIFY === 'true' || !!process.env.LAMBDA_TASK_ROOT;
const upload = multer({ storage: multer.memoryStorage() });

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

// Aggressive sanitization for credentials (handles accidental JSON pasting or prefixes)
const sanitizeCredential = (val: string | undefined, keyName: string): string => {
  if (!val) return '';
  let clean = val.trim();
  
  // If user pasted a JSON line like '"client_email": "abc@def.com"', extract the value
  if (clean.includes(':') && (clean.includes('"') || clean.includes("'"))) {
    const parts = clean.split(':');
    if (parts.length > 1) {
      // Check if it's the right part by looking at the key before the colon
      const keyPrefix = parts[0].toLowerCase();
      if (keyPrefix.includes('email') || keyPrefix.includes('private_key')) {
        clean = parts.slice(1).join(':').trim();
      }
    }
  }
  
  // Remove surrounding quotes
  clean = clean.replace(/^['"]|['"]$/g, '');
  
  // For private keys, handle literal \n sequences and fix formatting
  if (keyName === 'private_key') {
    // 1. Convert literal \n sequences to real newlines
    clean = clean.replace(/\\n/g, '\n');
    
    // 2. Remove all spaces that might have been accidentally added during copy-paste
    // (But keep the newlines!)
    
    // 3. Ensure the PEM format is clean (no extra text outside markers)
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    
    if (clean.includes(header) && clean.includes(footer)) {
      const startIndex = clean.indexOf(header);
      const endIndex = clean.indexOf(footer) + footer.length;
      
      // Extract just the part between and inclusive of headers
      let keyPart = clean.substring(startIndex, endIndex);
      
      // Remove any extra text from the lines (like "private_key": or quotes)
      const lines = keyPart.split('\n').map(l => l.trim()).filter(Boolean);
      
      // Rebuild carefully
      if (lines.length > 2) {
        const top = lines[0]; // Header
        const bottom = lines[lines.length - 1]; // Footer
        const middle = lines.slice(1, -1).join('\n');
        clean = `${top}\n${middle}\n${bottom}`;
      } else {
        clean = lines.join('\n');
      }
    } else if (clean.length > 100) {
      // If headers are missing but it looks like a long b64 string, wrap it
      clean = `${header}\n${clean}\n${footer}`;
    }
  }
  
  return clean.trim();
};

const getDriveService = () => {
  const clientEmail = sanitizeCredential(process.env.GOOGLE_CLIENT_EMAIL, 'email');
  const privateKey = sanitizeCredential(process.env.GOOGLE_PRIVATE_KEY, 'private_key');

  if (clientEmail) {
    console.log(`[Drive Service] Attempting auth for: ${clientEmail}`);
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    return google.drive({ version: 'v3', auth });
  } catch (err: any) {
    console.error('[Drive Service Error]: Failed to decode Service Account Key.', err.message);
    throw new Error('CORRUPT_KEY');
  }
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
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'OAuth credentials not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment variables.' });
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const dynamicRedirect = `${protocol}://${host}/auth/callback`;
  
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || dynamicRedirect
  );

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get('/api/auth/google/status', (req, res) => {
  let driveConfigured = false;
  let serviceEmail = 'NOT CONFIGURED';
  
  try {
    const email = sanitizeCredential(process.env.GOOGLE_CLIENT_EMAIL, 'email');
    const key = sanitizeCredential(process.env.GOOGLE_PRIVATE_KEY, 'private_key');
    
    if (email && key && key.length > 50) {
      serviceEmail = email;
      // Real check: If it's malformed, JWT throws even on initialization sometimes, 
      // but definitely on signing. We use a light check here.
      if (key.includes('BEGIN PRIVATE KEY') && key.includes('END PRIVATE KEY')) {
         driveConfigured = true;
      }
    }
  } catch (e) {
    console.warn('[Status Check] Drive configuration appears corrupt.');
    driveConfigured = false;
  }

  res.json({
    configured: driveConfigured,
    manualConnected: !!(req.session && req.session.tokens),
    serviceAccountEmail: serviceEmail,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '1paMc3Olh8yEEsnOQ8cRosKSrGuiY7tVo'
  });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const dynamicRedirect = `${protocol}://${host}/auth/callback`;

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || dynamicRedirect
  );

  try {
    const { tokens } = await client.getToken(code as string);
    if (req.session) {
      req.session.tokens = tokens;
    }
    // Send success message to parent window and close popup
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
          <p style="font-family: monospace; text-align: center; margin-top: 50px;">
            Drive connected! This window will close automatically.
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.post('/api/auth/google/logout', (req, res) => {
  if (req.session) {
    req.session.tokens = null;
  }
  res.json({ success: true });
});

// Manual Upload Endpoint
app.post('/api/drive/upload-manual', upload.single('file'), async (req, res) => {
  try {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: 'Manual Drive not connected. Please connect your Google Drive first.' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const dynamicRedirect = `${protocol}://${host}/auth/callback`;

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || dynamicRedirect
    );

    client.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth: client });

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
      fields: 'id, webViewLink'
    });

    // Share publicly
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    res.json({ id: response.data.id, link: response.data.webViewLink });
  } catch (error: any) {
    console.error('Manual Drive Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload to manual Drive' });
  }
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
