import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe : 6 caractères minimum'),
});

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe : 6 caractères minimum'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  role: z.enum(['ADMIN', 'MANAGER', 'COLLABORATEUR']),
  position: z.string().optional(),
  managerId: z.string().uuid().optional(),
});

export const kpiEntrySchema = z.object({
  value: z.number({ required_error: 'Valeur requise' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date : YYYY-MM-DD'),
  kpiDefinitionId: z.string().uuid('ID de KPI invalide'),
});

export const commentSchema = z.object({
  text: z.string().min(1).max(500, '500 caractères maximum'),
});

export const attendanceSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['PRESENT', 'ABSENT', 'CONGE', 'FORMATION']),
});

export const collaboratorSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  position: z.string().optional(),
});

export const customSectionSchema = z.object({
  name: z.string().min(1, 'Nom de section requis'),
  kpis: z.array(z.object({
    name: z.string().min(1),
    unit: z.string().min(1),
  })).min(1, 'Au moins un KPI requis'),
});

export const exportQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
