/* Tech Graph — From/To navigation panel.

Rendered when the user opens directions. Emits navigate/clear events; the
parent performs the graph algorithm against its cy ref.
*/

import { cn } from '../lib/utils';
import { Select } from './ui/select';
import { Button } from './ui/button';

type NavKind = 'info' | 'ok' | 'warn';

interface DirectionsPanelProps {
  fromValue: string;
  onFromChange: (value: string) => void;
  toValue: string;
  onToChange: (value: string) => void;
  onNavigate: () => void;
  onClear: () => void;
  navMessage: string;
  navKind: NavKind;
  nodeOptions: { id: string; label: string }[];
}

export default function DirectionsPanel({
  fromValue,
  onFromChange,
  toValue,
  onToChange,
  onNavigate,
  onClear,
  navMessage,
  navKind,
  nodeOptions,
}: DirectionsPanelProps) {
  return (
    <>
      <div className="lozenge-stack">
        <div className="lozenge">
          <Select
            id="fromSelect"
            value={fromValue}
            onChange={(e) => onFromChange(e.target.value)}
          >
            <option value="">From</option>
            {nodeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </Select>
        </div>
        <div className="lozenge">
          <Select
            id="toSelect"
            value={toValue}
            onChange={(e) => onToChange(e.target.value)}
          >
            <option value="">To</option>
            {nodeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </div>
      <div className="row actions">
        <Button id="btnNavigate" type="button" variant="primary" size="sm" onClick={onNavigate}>
          Navigate
        </Button>
        <Button id="btnClear" type="button" variant="outline" size="sm" onClick={onClear}>
          ❌
        </Button>
      </div>
      <div id="navResult" className={cn('hint', `nav-${navKind}`, !navMessage ? 'hidden' : '')}>
        {navMessage}
      </div>
    </>
  );
}
