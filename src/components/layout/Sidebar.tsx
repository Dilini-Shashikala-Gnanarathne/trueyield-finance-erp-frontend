import { NavLink, useNavigate } from 'react-router-dom';
import { env } from '@/env';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',                icon: '📊', label: 'Dashboard'      },
  { to: '/payroll',         icon: '💰', label: 'Process Payroll' },
  { to: '/journal-entries', icon: '📒', label: 'Journal Entry'   },
  { to: '/history',         icon: '🕑', label: 'History'         },
];

const ROLE_ICON: Record<string, string> = {
  FARMER: '🚜',
  BUYER:  '🛒',
  ADMIN:  '🔑',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">🌾</div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">{env.appName}</span>
          <span className="sidebar__brand-sub">REST · gRPC · Finance</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        <span className="sidebar__section-label">Navigation</span>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' active' : ''}`
            }
            aria-current={undefined}
          >
            <span className="sidebar__link-icon" aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User panel */}
      {user && (
        <div className="sidebar__user-panel">
          <NavLink to="/profile" className={({ isActive }) => `sidebar__user${isActive ? ' active' : ''}`}>
            <div className="sidebar__user-avatar">
              {ROLE_ICON[user.role] ?? '👤'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.fullName}</span>
              <span className="sidebar__user-role">{user.role}</span>
            </div>
          </NavLink>
          <button
            id="sidebar-logout"
            type="button"
            className="sidebar__logout-btn"
            title="Sign Out"
            onClick={handleLogout}
          >
            🚪
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="sidebar__footer">
        <div className="sidebar__version">v1.0.0 · Spring Boot 3.3</div>
      </footer>
    </aside>
  );
}
