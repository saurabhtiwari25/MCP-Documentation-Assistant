import { useState, useEffect } from 'react';
import { Files, FileText, Database } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ documents: 0, mcpServers: 0, mcpServerNames: [] });

  useEffect(() => {
    fetch('http://localhost:8000/documents')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, documents: data.documents?.length || 0 }));
      })
      .catch(console.error);

    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        if (data.mcp_servers) {
          setStats(prev => ({ 
            ...prev, 
            mcpServers: data.mcp_servers.length, 
            mcpServerNames: data.mcp_servers 
          }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px' }}>
            <Files size={32} color="var(--accent-color)" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.documents}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Documents</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px' }}>
            <Server size={32} color="var(--success-color)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.mcpServers}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Active MCP Servers</div>
            {stats.mcpServerNames?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {stats.mcpServerNames.map(name => (
                  <span key={name} style={{ 
                    background: 'var(--bg-secondary)', 
                    color: 'var(--text-primary)',
                    padding: '4px 10px', 
                    borderRadius: '16px', 
                    fontSize: '12px',
                    border: '1px solid var(--border-color)',
                    textTransform: 'capitalize'
                  }}>
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>System Architecture Overview</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          This Documentation Assistant is powered by the Model Context Protocol (MCP), enabling the LangChain QA Agent to dynamically call tools across local filesystems, PDF extractors, and vector databases.
        </p>
      </div>
    </div>
  );
}

import { Server } from 'lucide-react';
