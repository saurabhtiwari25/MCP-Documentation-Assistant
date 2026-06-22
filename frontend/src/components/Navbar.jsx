export default function Navbar() {
  return (
    <div className="navbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{
          fontSize: '22px',
          fontWeight: '700',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          letterSpacing: '0.5px',
        }}>
          MCP Documentation Assistant 
        </span>
      </div>
    </div>
  );
}
