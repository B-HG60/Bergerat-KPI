import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { createUserSchema, collaboratorSchema } from '../validators';

export const usersRouter = Router();

usersRouter.use(authenticate);

// GET /api/users — liste des utilisateurs (admin: tous, manager: son équipe)
usersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;

    let users;
    if (role === 'ADMIN') {
      users = await prisma.user.findMany({
        select: { id: true, email: true, firstName: true, lastName: true, role: true, position: true, managerId: true },
        orderBy: { lastName: 'asc' },
      });
    } else if (role === 'MANAGER') {
      users = await prisma.user.findMany({
        where: { managerId: userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, position: true, managerId: true },
        orderBy: { lastName: 'asc' },
      });
    } else {
      // Collaborateur voit son équipe
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { managerId: true } });
      users = await prisma.user.findMany({
        where: { managerId: me?.managerId ?? undefined },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, position: true },
        orderBy: { lastName: 'asc' },
      });
    }

    res.json(users);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/users — créer un utilisateur (admin uniquement)
usersRouter.post('/', authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);
    const hashed = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Cet email existe déjà' });
      return;
    }
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/users/collaborator — manager ajoute un collaborateur à son équipe
usersRouter.post('/collaborator', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const data = collaboratorSchema.parse(req.body);
    const defaultPassword = await bcrypt.hash('Bergerat2024!', 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: defaultPassword,
        role: 'COLLABORATEUR',
        managerId: req.user!.userId,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, position: true },
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Cet email existe déjà' });
      return;
    }
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Données invalides', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/users/:id — supprimer un collaborateur
usersRouter.delete('/:id', authorize('ADMIN', 'MANAGER'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    // Un manager ne peut supprimer que ses propres collaborateurs
    if (role === 'MANAGER') {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target || target.managerId !== userId) {
        res.status(403).json({ error: 'Accès interdit' });
        return;
      }
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
