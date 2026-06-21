import { useState } from 'react';
import { Play, CheckCircle } from 'lucide-react';

export default function MCPStatus({ toolCalls = [] }) {
  return (
    <div className="card" style={{ height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Play size={18} color="var(--success-color)" />
        MCP Activity Panel
      </h3>
      {toolCalls.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Agent is idle. Waiting for questions...
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {toolCalls.map((call, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px',
              color: 'var(--text-primary)',
              background: 'var(--bg-color)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}>
              <CheckCircle size={16} color="var(--success-color)" />
              <span style={{ fontFamily: 'monospace' }}>{call}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
