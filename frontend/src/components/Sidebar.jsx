import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Files, Info, Sun, Moon } from 'lucide-react';

export default function Sidebar({ isDarkMode, setIsDarkMode }) {
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/documents', icon: Files, label: 'Documents' },
    { to: '/Info', icon: Info, label: 'Info' },
  ];

  return (
    <div className="w-[208px] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col z-20 sticky top-0 h-screen transition-all duration-300">
      {/* Logo */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/25">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            MCP <span className="font-normal text-muted-foreground">Docs</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border mb-2" />

      {/* Navigation */}
      <div className="flex flex-col px-3 gap-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center gap-3 py-2 px-3 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/12 text-primary shadow-sm shadow-primary/10' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon size={16} className={`transition-colors ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div className="mt-auto px-3 pb-4">
        <div className="h-px bg-sidebar-border mb-4" />
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent/80 text-accent-foreground hover:bg-accent border border-sidebar-border transition-all duration-200 text-[13px] font-medium"
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </div>
  );
}
