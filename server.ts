import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieSession from 'cookie-session';

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

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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

export default app;
