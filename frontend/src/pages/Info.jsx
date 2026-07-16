import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Database, Server, Cpu, Zap, GitBranch, Box, Loader2 } from 'lucide-react';

export default function Info() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://mcp-documentation-assistant.onrender.com/health');
        const data = await res.json();
        setHealth({
          backend: { status: 'online', label: 'FastAPI Backend', url: 'lhttps://mcp-documentation-assistant.onrender.com' },
          qdrant: { status: data.qdrant || 'connected', label: 'Qdrant Vector DB', url: 'qdrant:6333' },
          mcp: { status: 'active', label: 'MCP Client Manager', servers: data.mcp_servers || [] },
        });
      } catch {
        setHealth({
          backend: { status: 'offline', label: 'FastAPI Backend', url: 'https://mcp-documentation-assistant.onrender.com' },
          qdrant: { status: 'offline', label: 'Qdrant Vector DB', url: 'qdrant:6333' },
          mcp: { status: 'offline', label: 'MCP Client Manager', servers: [] },
        });
      } finally {
        setLoading(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ status }) => {
    const isOnline = status !== 'offline';
    return (
      <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
        isOnline 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-red-500/10 text-red-500'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        {isOnline ? 'Online' : 'Offline'}
      </div>
    );
  };

  const services = health ? [
    { ...health.backend, icon: Server, color: 'text-primary', bg: 'bg-primary/10' },
    { ...health.qdrant, icon: Database, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { ...health.mcp, icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ] : [];

  const techStack = [
    { name: 'React 19', desc: 'Frontend framework', icon: Box },
    { name: 'FastAPI', desc: 'Backend API server', icon: Cpu },
    { name: 'LangChain + LangGraph', desc: 'AI orchestration', icon: GitBranch },
    { name: 'Qdrant', desc: 'Vector database', icon: Database },
    { name: 'Groq (Llama 3.3 70B)', desc: 'LLM for answering', icon: Zap },
    { name: 'Gemini Embeddings', desc: 'Document vectorization', icon: Server },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto h-full pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Info</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor services and explore the tech stack.</p>
      </div>
      
      {/* Service Health */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Service Health</h3>
          {loading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
        </div>
        
        <div className="flex flex-col gap-2">
          {loading && !health ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Checking services...</div>
          ) : (
            services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/40 hover:border-border transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`${svc.bg} p-2 rounded-lg`}>
                      <Icon className={svc.color} size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{svc.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {svc.url || `${svc.servers?.length || 0} servers`}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={svc.status} />
                </div>
              );
            })
          )}
        </div>

        {/* MCP Server Tags */}
        {health?.mcp?.servers?.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/40">
            <div className="text-[11px] font-medium text-muted-foreground mb-2">Connected MCP Servers</div>
            <div className="flex flex-wrap gap-1.5">
              {health.mcp.servers.map((name, i) => (
                <span key={i} className="bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-md text-[11px] font-medium border border-violet-500/15 capitalize">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Tech Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {techStack.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/40 hover:border-border transition-colors">
                <Icon size={16} className="text-muted-foreground shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground">{tech.name}</div>
                  <div className="text-[11px] text-muted-foreground">{tech.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">How It Works</h3>
        <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Upload documents (PDF, TXT, MD) — they get chunked and embedded via <strong className="text-foreground">Gemini Embeddings</strong>.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Vectors are stored in <strong className="text-foreground">Qdrant</strong> for fast similarity search.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>When you ask a question, <strong className="text-foreground">RAG retrieval</strong> pulls relevant chunks and feeds them to the LLM.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
            <span><strong className="text-foreground">Groq Llama 3.3 70B</strong> generates a streamed answer with source citations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
