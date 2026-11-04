import { useEffect } from 'react';
import { Card, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
    <Card>
      <CardTitle>Find a technology</CardTitle>
      <div className="search-wrap">
        <Input
          id="nodeSearch"
          list="nodeList"
          value={value}
          onChange={onChange}
          placeholder="e.g. C, JavaScript, physical hardware"
        />
        <datalist id="nodeList" />
        <Button variant="primary" size="sm" id="btnGo" onClick={onSearch}>
          Go
        </Button>
      </div>
      <div id="searchHint" className="hint">{hint}</div>
    </Card>
  );
}
