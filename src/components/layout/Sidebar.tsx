import { NavLink } from 'react-router-dom';
import { env } from '@/env';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',                icon: '⬡',  label: 'Dashboard'       },
  { to: '/payroll',         icon: '💰', label: 'Process Payroll'  },
  { to: '/journal-entries', icon: '📒', label: 'Journal Entry'    },
  { to: '/history',         icon: '🕐', label: 'History'          },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden="true">₿</div>
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

      {/* Footer */}
      <footer className="sidebar__footer">
        <div className="sidebar__version">v1.0.0 · Spring Boot 3.3</div>
      </footer>
    </aside>
  );
}
