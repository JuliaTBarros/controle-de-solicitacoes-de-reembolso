import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types/user';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  {
    to:    '/',
    label: 'Dashboard',
    icon:  LayoutDashboard,
    roles: [Role.COLABORADOR, Role.GESTOR, Role.FINANCEIRO, Role.ADMIN],
    end:   true,
  },
  {
    to:    '/categories',
    label: 'Categorias',
    icon:  FolderOpen,
    roles: [Role.ADMIN],
    end:   false,
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const visibleLinks = NAV_LINKS.filter(l => l.roles.includes(user.role));

  return (
    <aside className="w-56 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-base shrink-0">
          💸
        </div>
        <div>
          <p className="text-sm font-extrabold leading-tight">ReembolsoApp</p>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
            Pitang
          </p>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {visibleLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <link.icon className="w-4 h-4 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
