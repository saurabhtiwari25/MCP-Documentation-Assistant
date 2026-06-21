import { BrainCircuit } from 'lucide-react';

export default function Navbar() {
  return (
    <div className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
        <BrainCircuit size={20} />
        <span>System Ready</span>
      </div>
    </div>
  );
}
