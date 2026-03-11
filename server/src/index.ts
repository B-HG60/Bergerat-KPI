import express from 'express';
import cors from 'cors';
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

// Routes
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

// Gestion des erreurs
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;
