import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Files, Info } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/documents', icon: Files, label: 'Documents' },
    { to: '/Info', icon: Info, label: 'Info' },
  ];

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', padding: '24px 8px 16px', gap: '8px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-color)' : 'transparent',
                borderRadius: '8px',
                transition: 'background 0.2s, color 0.2s'
              }}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
