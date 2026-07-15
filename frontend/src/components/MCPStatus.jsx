import { useState } from 'react';
import { Play, CheckCircle } from 'lucide-react';

export default function MCPStatus({ toolCalls = [] }) {
  return (
    <div className="h-full overflow-y-auto bg-card/80 backdrop-blur-md border border-border rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/50 transition-all duration-300">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-lg text-foreground">
        <Play size={18} className="text-green-500" />
        MCP Activity Panel
      </h3>
      {toolCalls.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Agent is idle. Waiting for questions...
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {toolCalls.map((call, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-foreground bg-background/50 px-3 py-2 rounded-md border border-border/50">
              <CheckCircle size={16} className="text-green-500 shrink-0" />
              <span className="font-mono truncate">{call}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
