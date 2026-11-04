import { Card, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function MapControls({
  zoomInRef,
  zoomOutRef,
  fitRef,
}) {
  return (
    <Card>
      <CardTitle>Zoom</CardTitle>
      <div className="row actions">
        <Button variant="outline" size="sm" ref={zoomInRef} id="btnZoomIn" title="Zoom in">
          +
        </Button>
        <Button variant="outline" size="sm" ref={zoomOutRef} id="btnZoomOut" title="Zoom out">
          −
        </Button>
        <Button variant="outline" size="sm" ref={fitRef} id="btnFit" title="Fit all nodes">
          Fit all
        </Button>
      </div>
    </Card>
  );
}
