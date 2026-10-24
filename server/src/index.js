import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import planRoutes from './routes/plan.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const configuredOrigins = String(process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
const localDevelopmentOrigin = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}):\d+$/;
app.use(cors({ origin(origin, callback) {
  const allowLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production' && localDevelopmentOrigin.test(origin || '');
  if (!origin || configuredOrigins.includes(origin) || allowLocalDevelopmentOrigin) return callback(null, true);
  return callback(new Error('This origin is not allowed by the VNUK CareerBridge demo API CORS policy.'));
} }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'VNUK CareerBridge demo API', aiMode: 'mock' }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/plan', planRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => console.log(`VNUK CareerBridge API running at http://localhost:${PORT}`));
