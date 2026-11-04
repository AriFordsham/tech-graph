import { useEffect } from 'react';

export default function SearchCard({
  value,
  onChange,
  onSearch,
  hint,
  labels,
}) {
  useEffect(() => {
    const dl = document.getElementById('nodeList');
    if (!dl) return;
    dl.innerHTML = '';
    labels.forEach((label) => {
      const o = document.createElement('option');
      o.value = label;
      dl.appendChild(o);
    });
  }, [labels]);

  return (
    <div className="card card-search">
      <label className="card-label">Find a technology</label>
      <div className="search-wrap">
        <input
          type="search"
          id="nodeSearch"
          list="nodeList"
          value={value}
          onChange={onChange}
          placeholder="e.g. C, JavaScript, physical hardware"
          aria-label="Find a node"
        />
        <datalist id="nodeList" />
        <button id="btnGo" type="button" onClick={onSearch}>
          Go
        </button>
      </div>
      <div id="searchHint" className="hint">
        {hint}
      </div>
    </div>
  );
}
