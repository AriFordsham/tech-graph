/* Tech Graph — search lozenge (Google Maps style).

Raw <input> + <datalist> because shadcn Input does not expose a datalist.
The parent supplies the <option> children.
*/

import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchLozengeProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onDirections: () => void;
  children?: React.ReactNode;
}

export default function SearchLozenge({
  value,
  onChange,
  onSearch,
  onDirections,
  children,
}: SearchLozengeProps) {
  return (
    <div className="search-lozenge">
      <Input
        id="nodeSearch"
        list="nodeList"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search technologies"
      />
      <datalist id="nodeList">{children}</datalist>
      <Button
        id="btnGo"
        type="button"
        variant="primary"
        size="sm"
        className="icon-btn"
        onClick={onSearch}
        aria-label="Go"
      >
        🔍
      </Button>
      <Button
        id="btnDirections"
        type="button"
        variant="outline"
        size="sm"
        className="icon-btn"
        onClick={onDirections}
        aria-label="Directions"
      >
        🗺️
      </Button>
    </div>
  );
}
