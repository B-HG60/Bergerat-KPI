import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { kpiEntrySchema, commentSchema } from '../validators';

export const kpiRouter = Router();

kpiRouter.use(authenticate);

// GET /api/kpi/definitions — toutes les définitions KPI
kpiRouter.get('/definitions', async (_req: Request, res: Response) => {
  try {
    const definitions = await prisma.kpiDefinition.findMany({
      include: { section: true },
      orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
    });
    res.json(definitions);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/kpi/entries?days=7&userId=xxx — entrées KPI
kpiRouter.get('/entries', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const targetUserId = req.query.userId as string | undefined;
    const { role, userId } = req.user!;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      date: { gte: since },
    };

    if (role === 'ADMIN' && targetUserId) {
      where.userId = targetUserId;
    } else if (role === 'MANAGER') {
      where.userId = targetUserId || userId;
    } else {
      // Collaborateur : voit les KPIs de son manager
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { managerId: true } });
      where.userId = me?.managerId || userId;
    }

    const entries = await prisma.kpiEntry.findMany({
      where,
      include: {
        kpiDefinition: { include: { section: true } },
        comments: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/kpi/entries — saisir un KPI
kpiRouter.post('/entries', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const data = kpiEntrySchema.parse(req.body);

    const entry = await prisma.kpiEntry.upsert({
      where: {
        date_kpiDefinitionId_userId: {
          date: new Date(data.date),
          kpiDefinitionId: data.kpiDefinitionId,
          userId: req.user!.userId,
        },
      },
      update: { value: data.value },
      create: {
        value: data.value,
        date: new Date(data.date),
        kpiDefinitionId: data.kpiDefinitionId,
        userId: req.user!.userId,
      },
      include: {
        kpiDefinition: true,
        comments: true,
      },
    });

    res.status(201).json(entry);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/kpi/entries/:id/comments — ajouter un commentaire
kpiRouter.post('/entries/:id/comments', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { text } = commentSchema.parse(req.body);
    const { id } = req.params;

    const entry = await prisma.kpiEntry.findUnique({ where: { id } });
    if (!entry) {
      res.status(404).json({ error: 'Entrée KPI non trouvée' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        kpiEntryId: id,
        userId: req.user!.userId,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    res.status(201).json(comment);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
