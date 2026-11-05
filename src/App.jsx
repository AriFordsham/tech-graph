import cytoscape from 'cytoscape';
import { useEffect, useRef, useState } from 'react';
import { toCyElements } from './data';
import { Input } from './components/ui/input';
import { Select } from './components/ui/select';
import './App.css';

const CY_STYLE = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'color': '#ffffff',
      'font-size': 9,
      'font-weight': 700,
      'text-wrap': 'wrap',
      'text-max-width': 130,
      'text-outline-width': 2,
      'text-outline-color': '#0b1021',
      'background-color': 'data(color)',
      'border-width': 2,
      'border-color': '#cbd5e1',
      'border-opacity': 0.7,
      'width': 'data(size)',
      'height': 'data(size)',
      'z-index': 10,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 'data(width)',
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': 7,
      'text-rotation': 'autorotate',
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.85,
      'text-background-padding': 2,
      'color': '#475569',
      'opacity': 0.85,
      'z-index': 5,
    },
  },
  { selector: '.node-dimmed', style: { opacity: 0.15 } },
  { selector: '.edge-dimmed', style: { opacity: 0.12 } },
  {
    selector: '.highlighted-node',
    style: {
      'border-width': 4,
      'border-color': '#f59e0b',
      'z-index': 9999,
      opacity: 1,
    },
  },
  {
    selector: '.highlighted-edge',
    style: {
      'width': 5,
      'opacity': 1,
      'z-index': 9998,
    },
  },
];

const CY_LAYOUT = {
  name: 'cose',
  animate: false,
  padding: 60,
  nodeRepulsion: 4500,
  edgeElasticity: 0.45,
  gravity: 0.12,
};

export default function App() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const [navigateMode, setNavigateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [navMessage, setNavMessage] = useState('');
  const [navKind, setNavKind] = useState<'info' | 'ok' | 'warn'>('info');
  const [nodeLabels, setNodeLabels] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements: toCyElements(),
      style: CY_STYLE,
      layout: CY_LAYOUT,
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
      autoungrabify: false,
    });
    cyRef.current = cy;
    window.__cy = cy;

    const labels = cy.nodes().map((n) => n.data('label'));
    setNodeLabels(labels);
    setNodeOptions(
      cy.nodes()
        .sort((a, b) => a.data('label').localeCompare(b.data('label')))
        .map((n) => ({ id: n.id(), label: n.data('label') })),
    );

    cy.on('layoutend', () => fitAll(cy));
    fitAll(cy);

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      clearHighlights(cy);
      node.addClass('highlighted-node');
      fitNode(cy, node);
    });

    document.getElementById('btnZoomIn')?.addEventListener('click', () =>
      cy.animate({ zoom: cy.zoom() * 1.4 }, { duration: 400 }),
    );
    document.getElementById('btnZoomOut')?.addEventListener('click', () =>
      cy.animate({ zoom: cy.zoom() / 1.4 }, { duration: 400 }),
    );
    document.getElementById('btnFit')?.addEventListener('click', () => {
      clearHighlights(cy);
      fitAll(cy, 50, 700);
    });

    window.addEventListener('resize', () => cy.resize());

    return () => {
      window.removeEventListener('resize', () => cy.resize());
      document.getElementById('btnZoomIn')?.removeEventListener('click', () =>
        cy.animate({ zoom: cy.zoom() * 1.4 }, { duration: 400 }),
      );
      document.getElementById('btnZoomOut')?.removeEventListener('click', () =>
        cy.animate({ zoom: cy.zoom() / 1.4 }, { duration: 400 }),
      );
      document.getElementById('btnFit')?.removeEventListener('click', () => {
        clearHighlights(cy);
        fitAll(cy, 50, 700);
      });
      cy.destroy();
    };
  }, []);

  function clearHighlights(cy) {
    cy.elements().removeClass(
      'node-dimmed edge-dimmed highlighted-node highlighted-edge',
    );
  }

  function fitAll(cy, padding = 40, duration = 700) {
    cy.animate({ fit: { eles: cy.elements(), padding } }, { duration });
  }

  function fitNode(cy, node, padding = 80, duration = 600) {
    cy.animate({ fit: { eles: node, padding } }, { duration });
  }

  return (
    <div className="app">
      <div id="cy" ref={containerRef} />

      <div className="overlay nav-controls">
        {!navigateMode ? (
          <div className="search-lozenge">
            <Input
              id="nodeSearch"
              list="nodeList"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technologies"
            />
            <datalist id="nodeList">
              {nodeLabels.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
            <button
              id="btnGo"
              type="button"
              className="btn btn-primary btn-sm icon-btn"
              onClick={() => {}}
              aria-label="Go"
            >
              🔍
            </button>
            <button
              id="btnDirections"
              type="button"
              className="btn btn-outline btn-sm icon-btn"
              onClick={() => setNavigateMode(true)}
              aria-label="Directions"
            >
              🗺️
            </button>
          </div>
        ) : (
          <>
            <div className="lozenge-stack">
              <div className="lozenge">
                <Select
                  id="fromSelect"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
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
                  onChange={(e) => setToValue(e.target.value)}
                >
                  <option value="">To</option>
                  {nodeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="row actions">
              <button
                id="btnNavigate"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {}}
              >
                Navigate
              </button>
              <button
                id="btnClear"
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setNavigateMode(false)}
              >
                ❌
              </button>
            </div>
          </>
        )}
      </div>

      <div className="overlay zoom-controls">
        <button
          id="btnZoomIn"
          type="button"
          className="btn btn-outline btn-sm icon-btn"
          title="Zoom in"
        >
          +
        </button>
        <button
          id="btnZoomOut"
          type="button"
          className="btn btn-outline btn-sm icon-btn"
          title="Zoom out"
        >
          −
        </button>
        <button
          id="btnFit"
          type="button"
          className="btn btn-outline btn-sm icon-btn"
          title="Fit all"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
