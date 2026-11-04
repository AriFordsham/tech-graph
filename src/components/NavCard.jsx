import { Card, CardTitle } from './ui/card';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

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
    <Card>
      <CardTitle>Navigate</CardTitle>
      <div className="row">
        <Label htmlFor="fromSelect">From</Label>
        <Select
          id="fromSelect"
          value={fromValue}
          onChange={onFromChange}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Separator />
        <Label htmlFor="toSelect">To</Label>
        <Select
          id="toSelect"
          value={toValue}
          onChange={onToChange}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="row actions">
        <Button variant="primary" size="sm" id="btnNavigate" onClick={onNavigate}>
          Navigate
        </Button>
        <Button variant="outline" size="sm" id="btnClear" onClick={onClear}>
          Clear
        </Button>
      </div>
      <div id="navResult" className={`hint nav-${kind}`}>{message}</div>
    </Card>
  );
}
