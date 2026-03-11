import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { customSectionSchema } from '../validators';

export const sectionsRouter = Router();

sectionsRouter.use(authenticate);

// GET /api/sections — lister les sections personnalisées
sectionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;

    const where: any = {};
    if (role !== 'ADMIN') {
      where.OR = [
        { createdBy: userId },
        { hidden: false },
      ];
    }

    const sections = await prisma.customSection.findMany({
      where,
      include: {
        kpiDefinitions: { orderBy: { order: 'asc' } },
        creator: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sections);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sections — créer une section
sectionsRouter.post('/', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { name, kpis } = customSectionSchema.parse(req.body);

    const section = await prisma.customSection.create({
      data: {
        name,
        createdBy: req.user!.userId,
        kpiDefinitions: {
          create: kpis.map((kpi, index) => ({
            name: kpi.name,
            unit: kpi.unit,
            order: index,
            isDefault: false,
          })),
        },
      },
      include: { kpiDefinitions: true },
    });

    res.status(201).json(section);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/sections/:id/toggle — masquer/afficher
sectionsRouter.patch('/:id/toggle', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const section = await prisma.customSection.findUnique({ where: { id } });

    if (!section) {
      res.status(404).json({ error: 'Section non trouvée' });
      return;
    }

    // Un manager ne peut modifier que ses propres sections
    if (req.user!.role === 'MANAGER' && section.createdBy !== req.user!.userId) {
      res.status(403).json({ error: 'Accès interdit' });
      return;
    }

    const updated = await prisma.customSection.update({
      where: { id },
      data: { hidden: !section.hidden },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/sections/:id
sectionsRouter.delete('/:id', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const section = await prisma.customSection.findUnique({ where: { id } });

    if (!section) {
      res.status(404).json({ error: 'Section non trouvée' });
      return;
    }

    if (req.user!.role === 'MANAGER' && section.createdBy !== req.user!.userId) {
      res.status(403).json({ error: 'Accès interdit' });
      return;
    }

    await prisma.customSection.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
