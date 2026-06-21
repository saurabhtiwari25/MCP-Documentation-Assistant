import { CheckCircle, Database, Server } from 'lucide-react';

export default function Settings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1>Settings</h1>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '24px' }}>System Health</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Server color="var(--accent-color)" />
              <div>
                <div style={{ fontWeight: 500 }}>FastAPI Backend</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>http://localhost:8000</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)' }}>
              <CheckCircle size={16} /> Online
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database color="#f59e0b" />
              <div>
                <div style={{ fontWeight: 500 }}>Qdrant Vector DB</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>qdrant:6333</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)' }}>
              <CheckCircle size={16} /> Connected
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Server color="#8b5cf6" />
              <div>
                <div style={{ fontWeight: 500 }}>MCP Client Manager</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>3 Servers Connected</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)' }}>
              <CheckCircle size={16} /> Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
