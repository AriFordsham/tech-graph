export default function NavCard({
  options,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  onNavigate,
  onClear,
  message,
  kind,
}) {
  return (
    <div className="card card-nav">
      <label className="card-label">Navigate</label>
      <div className="row">
        <select
          id="fromSelect"
          value={fromValue}
          onChange={onFromChange}
          aria-label="From node"
        >
          <option value="">From</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          id="toSelect"
          value={toValue}
          onChange={onToChange}
          aria-label="To node"
        >
          <option value="">To</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="row actions">
        <button id="btnNavigate" type="button" onClick={onNavigate}>
          Navigate
        </button>
        <button id="btnClear" type="button" onClick={onClear}>
          Clear
        </button>
      </div>
      <div id="navResult" className={`hint nav-${kind}`}>
        {message}
      </div>
    </div>
  );
}
