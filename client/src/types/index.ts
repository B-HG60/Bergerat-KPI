export type Role = 'ADMIN' | 'MANAGER' | 'COLLABORATEUR';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'CONGE' | 'FORMATION';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  position?: string;
  managerId?: string;
}

export interface KpiDefinition {
  id: string;
  name: string;
  unit: string;
  order: number;
  isDefault: boolean;
  sectionId?: string;
  section?: CustomSection;
}

export interface KpiEntry {
  id: string;
  value: number;
  date: string;
  kpiDefinitionId: string;
  userId: string;
  kpiDefinition: KpiDefinition;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  kpiEntryId: string;
  userId: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export interface AttendanceRecord {
  user: { id: string; firstName: string; lastName: string; position?: string };
  status: AttendanceStatus | null;
  date: string;
}

export interface AttendanceResponse {
  attendances: AttendanceRecord[];
  stats: { total: number; present: number; rate: number };
}

export interface CustomSection {
  id: string;
  name: string;
  hidden: boolean;
  createdBy: string;
  creator: { firstName: string; lastName: string };
  kpiDefinitions: KpiDefinition[];
}

export interface ManagerOverview {
  manager: { id: string; name: string; teamSize: number };
  entries: KpiEntry[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
