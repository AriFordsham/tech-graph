export default function MapControls({
  zoomInRef,
  zoomOutRef,
  fitRef,
}) {
  return (
    <div className="card card-zoom">
      <button
        id="btnZoomIn"
        ref={zoomInRef}
        className="btn-outline btn-sm"
        type="button"
        title="Zoom in"
      >
        +
      </button>
      <button
        id="btnZoomOut"
        ref={zoomOutRef}
        className="btn-outline btn-sm"
        type="button"
        title="Zoom out"
      >
        &minus;
      </button>
      <button id="btnFit" ref={fitRef} className="btn-outline btn-sm" type="button" title="Fit all nodes">
        Fit all
      </button>
    </div>
  );
}
