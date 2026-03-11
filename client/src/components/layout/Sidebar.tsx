import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Users,
  ClipboardList,
  LayoutGrid,
  Shield,
  LogOut,
  PlusSquare,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard KPI', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'COLLABORATEUR'] },
  { to: '/attendance', label: 'Présences', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'COLLABORATEUR'] },
  { to: '/sections', label: 'Sections', icon: PlusSquare, roles: ['ADMIN', 'MANAGER'] },
  { to: '/team', label: 'Équipe', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin', label: 'Vue globale', icon: LayoutGrid, roles: ['ADMIN'] },
  { to: '/admin/users', label: 'Utilisateurs', icon: Shield, roles: ['ADMIN'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  const filtered = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e2a3a] text-white flex flex-col z-40">
      {/* Logo / Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">Bergerat Monnoyeur</h1>
        <p className="text-xs text-gray-400 mt-1">Dashboard KPI</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
        <div className="text-xs text-gray-400 capitalize">{user?.role.toLowerCase()}</div>
        <button
          onClick={logout}
          className="flex items-center gap-2 mt-3 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
