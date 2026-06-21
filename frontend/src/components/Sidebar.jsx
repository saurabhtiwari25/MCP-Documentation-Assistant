import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Files, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/documents', icon: Files, label: 'Documents' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: '24px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)' }}>
        MCP Assistant
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 8px', gap: '8px' }}>
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
