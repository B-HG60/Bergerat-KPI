import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { kpiRouter } from './routes/kpi';
import { attendanceRouter } from './routes/attendance';
import { sectionsRouter } from './routes/sections';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : '*' }));
app.use(express.json());

// Routes API
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/kpi', kpiRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Servir le frontend buildé
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Gestion des erreurs
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;
