/* Tech Graph — From/To navigation panel.

Rendered when the user opens directions. A rounded-corner rectangle holds two
search-style lozenges (From / To) that reuse the search autocomplete control.
The top lozenge inherits its state from the search lozenge. The Navigate button
is embedded in the bottom lozenge; a Close button sits in the top right. The
parent performs the graph algorithm against its cy ref.
*/

import SearchLozenge from './SearchLozenge';
import { Button } from './ui/button';

interface DirectionsPanelProps {
  fromValue: string;
  onFromChange: (value: string) => void;
  toValue: string;
  onToChange: (value: string) => void;
  onNavigate: () => void;
  onClose: () => void;
  nodeLabels: string[];
}

export default function DirectionsPanel({
  fromValue,
  onFromChange,
  toValue,
  onToChange,
  onNavigate,
  onClose,
  nodeLabels,
}: DirectionsPanelProps) {
  return (
    <div className="directions-panel">
      <Button
        id="btnClose"
        type="button"
        variant="outline"
        size="sm"
        className="icon-btn close-btn"
        onClick={onClose}
        aria-label="Close directions"
      >
        ❌
      </Button>
      <div className="directions-lozenges">
        {/* Top lozenge — From, inherits state from the search lozenge. */}
        <div className="lozenge-row">
          <SearchLozenge
            inputId="fromSearch"
            value={fromValue}
            onChange={onFromChange}
            onSelect={(label) => onFromChange(label)}
            onSearch={() => {}}
            onDirections={() => {}}
            options={nodeLabels}
            showGoButton={false}
            showDirectionsButton={false}
            fixed={false}
          />
        </div>
        {/* Bottom lozenge — To, with Navigate embedded like the search button. */}
        <div className="lozenge-row">
          <SearchLozenge
            inputId="toSearch"
            value={toValue}
            onChange={onToChange}
            onSelect={(label) => onToChange(label)}
            onSearch={onNavigate}
            onDirections={() => {}}
            options={nodeLabels}
            showGoButton={true}
            showDirectionsButton={false}
            goButtonId="btnNavigate"
            goAriaLabel="Navigate"
            goButtonOnClick={onNavigate}
            fixed={false}
          />
        </div>
      </div>
    </div>
  );
}
