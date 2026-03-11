import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { exportQuerySchema } from '../validators';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize('ADMIN'));

// GET /api/admin/overview — vue globale tous managers
adminRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: { select: { team: true } },
      },
    });

    const entries = await prisma.kpiEntry.findMany({
      where: { date: { gte: since } },
      include: {
        kpiDefinition: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Regrouper par manager
    const overview = managers.map(manager => ({
      manager: {
        id: manager.id,
        name: `${manager.firstName} ${manager.lastName}`,
        teamSize: manager._count.team,
      },
      entries: entries.filter(e => e.userId === manager.id),
    }));

    res.json(overview);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/export — export CSV
adminRouter.get('/export', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = exportQuerySchema.parse(req.query);

    const entries = await prisma.kpiEntry.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        kpiDefinition: true,
        user: { select: { firstName: true, lastName: true } },
        comments: true,
      },
      orderBy: [{ date: 'asc' }, { userId: 'asc' }],
    });

    // Génération CSV
    const header = 'Date;Manager;KPI;Valeur;Unité;Commentaires\n';
    const rows = entries.map(e => {
      const date = e.date.toISOString().split('T')[0];
      const manager = `${e.user.firstName} ${e.user.lastName}`;
      const comments = e.comments.map(c => c.text).join(' | ');
      return `${date};${manager};${e.kpiDefinition.name};${e.value};${e.kpiDefinition.unit};${comments}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=kpi-export-${startDate}-${endDate}.csv`);
    // BOM pour Excel
    res.send('\ufeff' + header + rows);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Paramètres invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
