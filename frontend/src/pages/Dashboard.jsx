import { useState, useEffect } from 'react';
import { Files, Server } from 'lucide-react';

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
    <div className="flex flex-col gap-8 overflow-y-auto h-full pb-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 flex items-center gap-5">
          <div className="bg-blue-500/10 p-4 rounded-xl">
            <Files size={32} className="text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">{stats.documents}</div>
            <div className="text-muted-foreground text-sm font-medium mt-1">Total Documents</div>
          </div>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 flex items-center gap-5">
          <div className="bg-green-500/10 p-4 rounded-xl">
            <Server size={32} className="text-green-500" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-foreground">{stats.mcpServers}</div>
            <div className="text-muted-foreground text-sm font-medium mt-1">Active MCP Servers</div>
            {stats.mcpServerNames?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {stats.mcpServerNames.map(name => (
                  <span key={name} className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full text-xs border border-border/50 capitalize font-medium">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-3 text-foreground">System Architecture Overview</h3>
        <p className="text-muted-foreground leading-relaxed">
          This Documentation Assistant is powered by the Model Context Protocol (MCP), enabling the LangChain QA Agent to dynamically call tools across local filesystems, PDF extractors, and vector databases.
        </p>
      </div>
    </div>
  );
}
