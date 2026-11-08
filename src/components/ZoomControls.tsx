/* Tech Graph — zoom controls (+ − fit), bottom right. */

import { Button } from './ui/button';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onFitAll }: ZoomControlsProps) {
  return (
    <div className="overlay zoom-controls">
      <Button
        id="btnZoomIn"
        type="button"
        variant="outline"
        size="sm"
        className="icon-btn"
        onClick={onZoomIn}
        title="Zoom in"
      >
        +
      </Button>
      <Button
        id="btnZoomOut"
        type="button"
        variant="outline"
        size="sm"
        className="icon-btn"
        onClick={onZoomOut}
        title="Zoom out"
      >
        −
      </Button>
      <Button
        id="btnFit"
        type="button"
        variant="outline"
        size="sm"
        className="icon-btn"
        onClick={onFitAll}
        title="Fit all"
      >
        ⤢
      </Button>
    </div>
  );
}
