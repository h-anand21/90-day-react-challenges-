import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import {
  LayoutDashboard, Map, LogOut, Plane, Settings, Menu, X, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AppShell.css';

const NAV_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard', icon: Map, label: 'My Trips' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate({ to: '/login' });
  };

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <Plane size={22} className="sidebar__logo-icon" />
          <span className="sidebar__logo-text">TripSync</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="sidebar__link"
              activeProps={{ className: 'sidebar__link sidebar__link--active' }}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="sidebar__link-chevron" />
            </Link>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name}</span>
              <span className="sidebar__user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="shell__main">
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="mobile-header__menu" onClick={() => setSidebarOpen((p) => !p)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="mobile-header__logo">
            <Plane size={18} style={{ color: 'var(--brand-500)' }} />
            TripSync
          </div>
        </div>

        <div className="shell__content">{children}</div>
      </main>
    </div>
  );
}
