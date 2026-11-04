export default function Legend() {
  const items = [
    { type: 'node', kind: 'language', label: 'Language' },
    { type: 'node', kind: 'assembly', label: 'Assembly' },
    { type: 'node', kind: 'machine-code', label: 'Machine code' },
    { type: 'node', kind: 'bytecode', label: 'Bytecode' },
    { type: 'node', kind: 'runtime', label: 'Runtime' },
    { type: 'node', kind: 'engine', label: 'Engine' },
    { type: 'node', kind: 'hardware', label: 'Hardware' },
    { type: 'edge', kind: 'interpret', label: 'Interpret edge' },
    { type: 'edge', kind: 'translate', label: 'Translate edge' },
  ];

  return (
    <div className="legend">
      <div className="legend-title">Legend</div>
      <div className="legend-grid">
        {items.map((item) => (
          <div key={`${item.type}-${item.kind}`} className="legend-item">
            <span className={`swatch ${item.type} ${item.kind}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
