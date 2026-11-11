/* Tech Graph — search lozenge with autocomplete dropdown (Google Maps style).

A custom filtered dropdown shows node matches as you type. There is no native
<datalist> and no down arrow; picking an entry (click, Enter, or arrow keys)
sets the value and, when a search action is wired, navigates to that node.

The lozenge can be rendered fixed-position (standalone search, top-left) or
inline (embedded inside the directions panel). The embedded Go and Directions
buttons are optional so callers can compose their own button layout.
*/

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SearchLozengeProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (label: string) => void;
  onSearch: () => void;
  onDirections: () => void;
  options: string[];
  /** Custom id for the underlying input. */
  inputId?: string;
  /** Render fixed-position at top-left (standalone search). Defaults to true. */
  fixed?: boolean;
  /** Show the embedded Go/search button. Defaults to true. */
  showGoButton?: boolean;
  /** Show the embedded Directions button. Defaults to true. */
  showDirectionsButton?: boolean;
  /** Custom id for the Go button. */
  goButtonId?: string;
  /** Custom id for the Directions button. */
  directionsButtonId?: string;
  /** Custom click handler for the Go button (defaults to onSearch). */
  goButtonOnClick?: () => void;
  /** Aria label for the Go button. */
  goAriaLabel?: string;
}

export default function SearchLozenge({
  value,
  onChange,
  onSelect,
  onSearch,
  onDirections,
  options,
  inputId = 'nodeSearch',
  fixed = true,
  showGoButton = true,
  showDirectionsButton = true,
  goButtonId = 'btnGo',
  directionsButtonId = 'btnDirections',
  goButtonOnClick,
  goAriaLabel = 'Go',
}: SearchLozengeProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const match = useCallback(
    (q: string) => {
      const query = q.trim().toLowerCase();
      if (!query) return [];
      return options
        .filter((o) => o.toLowerCase().includes(query))
        .sort((a, b) => {
          const score = (label: string) => {
            const l = label.toLowerCase();
            if (l === query) return 0; // exact match first
            if (l.startsWith(query)) return 1; // prefix next
            return 2; // substring last
          };
          const sa = score(a);
          const sb = score(b);
          if (sa !== sb) return sa - sb;
          return a.localeCompare(b); // tie-break alphabetically
        });
    },
    [options],
  );

  const filtered = useMemo(() => match(value), [value, match]);

  // Clicking outside the input + menu closes the dropdown.
  useEffect(() => {
    const handleMousedown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inInput = inputRef.current?.contains(target) ?? false;
      const inMenu = menuRef.current?.contains(target) ?? false;
      if (!inInput && !inMenu) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    return () => document.removeEventListener('mousedown', handleMousedown);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);
      setOpen(match(val).length > 0);
      setHighlighted(-1);
    },
    [onChange, match],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlighted((h) => (h >= filtered.length - 1 ? h : h + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((h) => (h <= 0 ? -1 : h - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlighted >= 0) {
          const sel = filtered[highlighted];
          onChange(sel);
          onSelect(sel);
          setOpen(false);
          setHighlighted(-1);
        } else {
          onSearch();
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
        setHighlighted(-1);
      }
    },
    [filtered, highlighted, onChange, onSelect, onSearch],
  );

  const handleSelect = useCallback(
    (label: string) => {
      onChange(label);
      onSelect(label);
      setOpen(false);
      setHighlighted(-1);
    },
    [onChange, onSelect],
  );

  return (
    <div className={cn('search-lozenge', fixed && 'search-lozenge--fixed')}>
      <Input
        id={inputId}
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true);
        }}
        placeholder="Search technologies"
      />
      {open && filtered.length > 0 && (
        <div ref={menuRef} className="search-menu">
          {filtered.map((label, i) => (
            <div
              key={label}
              className={cn('search-menu-item', highlighted === i ? 'search-menu-item--active' : '')}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(label);
              }}
              onMouseMove={() => setHighlighted(i)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
      {showGoButton && (
        <Button
          id={goButtonId}
          type="button"
          variant="primary"
          size="sm"
          className="icon-btn"
          onClick={() => {
            (goButtonOnClick ?? onSearch)?.();
          }}
          aria-label={goAriaLabel}
        >
          🔍
        </Button>
      )}
      {showDirectionsButton && (
        <Button
          id={directionsButtonId}
          type="button"
          variant="outline"
          size="sm"
          className="icon-btn"
          onClick={onDirections}
          aria-label="Directions"
        >
          🗺️
        </Button>
      )}
    </div>
  );
}
