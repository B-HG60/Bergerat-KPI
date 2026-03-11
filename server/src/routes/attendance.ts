import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { attendanceSchema } from '../validators';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

// GET /api/attendance?date=YYYY-MM-DD — présences du jour
attendanceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);
    const { role, userId } = req.user!;

    let teamIds: string[] = [];

    if (role === 'ADMIN') {
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      teamIds = allUsers.map(u => u.id);
    } else if (role === 'MANAGER') {
      const team = await prisma.user.findMany({
        where: { managerId: userId },
        select: { id: true },
      });
      teamIds = team.map(u => u.id);
    } else {
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { managerId: true } });
      if (me?.managerId) {
        const team = await prisma.user.findMany({
          where: { managerId: me.managerId },
          select: { id: true },
        });
        teamIds = team.map(u => u.id);
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        date,
        userId: { in: teamIds },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, position: true } },
      },
    });

    // Ajouter les collaborateurs sans saisie (non renseignés)
    const recordedIds = new Set(attendances.map(a => a.userId));
    const allTeam = await prisma.user.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, firstName: true, lastName: true, position: true },
    });

    const result = allTeam.map(member => {
      const attendance = attendances.find(a => a.userId === member.id);
      return {
        user: member,
        status: attendance?.status || null,
        date: dateStr,
      };
    });

    // Statistiques
    const total = result.length;
    const present = result.filter(r => r.status === 'PRESENT').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({ attendances: result, stats: { total, present, rate } });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/attendance — saisir une présence
attendanceRouter.post('/', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const data = attendanceSchema.parse(req.body);
    const { role, userId } = req.user!;

    // Un manager ne peut gérer que son équipe
    if (role === 'MANAGER') {
      const target = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!target || target.managerId !== userId) {
        res.status(403).json({ error: 'Ce collaborateur ne fait pas partie de votre équipe' });
        return;
      }
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        date_userId: {
          date: new Date(data.date),
          userId: data.userId,
        },
      },
      update: { status: data.status },
      create: {
        date: new Date(data.date),
        userId: data.userId,
        status: data.status,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json(attendance);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
