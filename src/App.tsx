/* Tech Graph — React app using shadcn/ui primitives + Cytoscape.js */

import cytoscape from 'cytoscape';
import { useEffect, useRef, useState } from 'react';
import { toCyElements, NODES } from './data';
import { Select } from './components/ui/select';
import './App.css';

const CY_STYLE: cytoscape.StylesheetStyle[] = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      color: '#ffffff',
      'font-size': '9',
      'font-weight': 700,
      'text-wrap': 'wrap',
      'text-max-width': '130',
      'text-outline-width': 2,
      'text-outline-color': '#0b1021',
      'background-color': 'data(color)',
      'border-width': 2,
      'border-color': '#cbd5e1',
      'border-opacity': 0.7,
      width: 'data(size)',
      height: 'data(size)',
      'z-index': 10,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 'data(width)',
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      label: 'data(label)',
      'font-size': '7',
      'text-rotation': 'autorotate',
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.85,
      'text-background-padding': '2',
      color: '#475569',
      opacity: 0.85,
      'z-index': 5,
    },
  },
  { selector: '.node-dimmed', style: { opacity: 0.15 } },
  { selector: '.edge-dimmed', style: { opacity: 0.12 } },
  {
    selector: '.highlighted-node',
    style: { 'border-width': 4, 'border-color': '#f59e0b', 'z-index': 9999, opacity: 1 },
  },
  {
    selector: '.highlighted-edge',
    style: { width: 5, opacity: 1, 'z-index': 9998 },
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

type NavKind = 'info' | 'ok' | 'warn';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [navigateMode, setNavigateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [navMessage, setNavMessage] = useState('');
  const [navKind, setNavKind] = useState<NavKind>('info');
  const [nodeLabels, setNodeLabels] = useState<string[]>([]);
  const [nodeOptions, setNodeOptions] = useState<{ id: string; label: string }[]>([]);

  const nodeLabelsVal = NODES.map((n) => n.label);
  const nodeOptionsVal = NODES.slice().sort((a, b) => a.label.localeCompare(b.label)).map((n) => ({ id: n.id, label: n.label }));

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current!,
      elements: toCyElements(),
      style: CY_STYLE,
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
      autoungrabify: false,
    });
    cyRef.current = cy;
    window.__cy = cy;

    // Ensure Cytoscape measures the container before fitting.
    cy.resize();

    setNodeLabels(nodeLabelsVal);
    setNodeOptions(nodeOptionsVal);

    cy.on('layoutend', () => {
      cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 700 });
    });
    // Run the layout after the elements exist — otherwise every node lands at
    // (0,0) and renders stacked on top of each other.
    cy.layout(CY_LAYOUT).run();
    // Fallback fit in case layoutend doesn't fire or runs before container is measured.
    requestAnimationFrame(() => {
      cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 700 });
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
      node.addClass('highlighted-node');
      cy.animate({ fit: { eles: node, padding: 80 } }, { duration: 600 });
    });

    const btnZoomIn = document.getElementById('btnZoomIn');
    btnZoomIn?.addEventListener('click', () =>
      cy.animate({ zoom: cy.zoom() * 1.4 }, { duration: 400 }),
    );
    const btnZoomOut = document.getElementById('btnZoomOut');
    btnZoomOut?.addEventListener('click', () =>
      cy.animate({ zoom: cy.zoom() / 1.4 }, { duration: 400 }),
    );
    const btnFit = document.getElementById('btnFit');
    btnFit?.addEventListener('click', () => {
      cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
      cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 700 });
    });

    window.addEventListener('resize', () => cy.resize());

    return () => {
      window.removeEventListener('resize', () => cy.resize());
      cy.destroy();
    };
  }, []);

  function handleSearch() {
    const cy = cyRef.current;
    if (!cy) return;
    const q = searchQuery.trim();
    if (!q) return;
    const node = cy.nodes().toArray().find((n) => n.data('label').toLowerCase() === q.toLowerCase());
    if (!node) {
      setNavMessage(`No node matching “${q}”`);
      setNavKind('warn');
      return;
    }
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    node.addClass('highlighted-node');
    cy.animate({ fit: { eles: node, padding: 80 } }, { duration: 700 });
  }

  function handleNavigate() {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    setNavMessage('');

    const fromEl = document.getElementById('fromSelect') as HTMLSelectElement | null;
    const toEl = document.getElementById('toSelect') as HTMLSelectElement | null;
    const fromId = fromEl?.value || '';
    const toId = toEl?.value || '';

    if (!fromId || !toId) {
      setNavMessage('Pick both a From and a To node.');
      setNavKind('warn');
      return;
    }

    const from = cy.getElementById(fromId);
    const to = cy.getElementById(toId);
    if (!from || !to) {
      setNavMessage('Selected node not found.');
      setNavKind('warn');
      return;
    }

    if (fromId === toId) {
      from.addClass('highlighted-node');
      cy.animate({ fit: { eles: from, padding: 100 } }, { duration: 700 });
      setNavMessage(`From and To are the same node: “${from.data('label')}”`);
      setNavKind('info');
      return;
    }

    const dijkstra = cy.elements().dijkstra({ root: from });
    const path = dijkstra.pathTo(to);

    if (path.empty()) {
      setNavMessage(`No route connects “${from.data('label')}” to “${to.data('label')}”`);
      setNavKind('warn');
      return;
    }

    cy.elements().addClass('node-dimmed edge-dimmed');
    path.nodes().removeClass('node-dimmed').addClass('highlighted-node');
    path.edges().removeClass('edge-dimmed').addClass('highlighted-edge');

    cy.animate({ fit: { eles: path, padding: 60 } }, { duration: 900 });

    const hops = path.edges().length;
    setNavMessage(
      `Route: “${from.data('label')}” → “${to.data('label')}” • ${path.nodes().length} nodes, ${hops} hop${hops !== 1 ? 's' : ''}`,
    );
    setNavKind('ok');
  }

  function handleClear() {
    const cy = cyRef.current;
    if (!cy) return;
    setFromValue('');
    setToValue('');
    setNavigateMode(false);
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 600 });
    setNavMessage('');
  }

  return (
    <div className="app">
      <div id="cy" ref={containerRef} />
      <div className="overlay nav-controls">
        {!navigateMode ? (
          <div className="search-lozenge">
            <input
              id="nodeSearch"
              list="nodeList"
              className="input"
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
              onClick={handleSearch}
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
                onClick={handleNavigate}
              >
                Navigate
              </button>
              <button
                id="btnClear"
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClear}
              >
                ❌
              </button>
            </div>
            <div
              id="navResult"
              className={`hint nav-${navKind} ${!navMessage ? 'hidden' : ''}`}
            >
              {navMessage}
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
