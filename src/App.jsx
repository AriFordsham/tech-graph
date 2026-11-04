/* Tech Graph — React app using shadcn/ui primitives + Cytoscape.js */

import cytoscape from 'cytoscape';
import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [searchHint, setSearchHint] = useState('Type a node name → map pans to it');
  const [navMessage, setNavMessage] = useState('');
  const [navKind, setNavKind] = useState('info');
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

    const nodesArray = cy.nodes().toArray();
    const labels = nodesArray.map((n) => n.data('label'));
    setNodeLabels(labels);
    setNodeOptions(
      nodesArray
        .sort((a, b) => a.data('label').localeCompare(b.data('label')))
        .map((n) => ({ id: n.id(), label: n.data('label') })),
    );

    // Zoom controls
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

  const clearHighlights = useCallback((cy) => {
    cy.elements().removeClass(
      'node-dimmed edge-dimmed highlighted-node highlighted-edge',
    );
  }, []);

  const fitAll = useCallback((cy, padding = 40, duration = 700) => {
    cy.animate({ fit: { eles: cy.elements(), padding } }, { duration });
  }, []);

  const fitNode = useCallback((cy, node, padding = 80, duration = 600) => {
    cy.animate({ fit: { eles: node, padding } }, { duration });
  }, []);

  const findNodeByLabel = useCallback((cy, label) => {
    if (!label) return null;
    const exact = cy.nodes().filter(
      (n) => n.data('label').toLowerCase() === label.toLowerCase(),
    );
    if (!exact.empty()) return exact.first();
    const idMatch = cy.nodes('#' + label);
    if (!idMatch.empty()) return idMatch.first();
    const starts = cy.nodes().filter((n) =>
      n.data('label').toLowerCase().startsWith(label.toLowerCase()),
    );
    if (!starts.empty()) return starts.first();
    return null;
  }, []);

  const handleSearch = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const q = searchQuery.trim();
    if (!q) return;
    const node = findNodeByLabel(cy, q);
    if (!node) {
      setSearchHint(`No node matching “${q}”`);
      return;
    }
    clearHighlights(cy);
    node.addClass('highlighted-node');
    setSearchHint(`Panned to “${node.data('label')}”`);
    fitNode(cy, node, 80, 700);
  }, [searchQuery, findNodeByLabel, clearHighlights, fitNode]);

  const handleNavigate = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    clearHighlights(cy);
    setNavMessage('');

    const fromEl = document.getElementById('fromSelect');
    const toEl = document.getElementById('toSelect');
    const fromId = (fromEl && fromEl.value) || '';
    const toId = (toEl && toEl.value) || '';

    if (!fromId || !toId) {
      setNavMessage('Pick both a From and a To node.');
      setNavKind('warn');
      return;
    }

    if (!fromId || !toId) {
      setNavMessage('Pick both a From and a To node.');
      setNavKind('warn');
      return;
    }

    const from = cy.nodes('#' + fromId);
    const to = cy.nodes('#' + toId);
    if (fromId === toId) {
      from.addClass('highlighted-node');
      fitNode(cy, from, 100, 700);
      setNavMessage(
        `From and To are the same node: “${from.data('label')}”`,
      );
      setNavKind('info');
      return;
    }

    const dijkstra = cy.elements().dijkstra(from);
    const path = dijkstra.pathTo(to);

    if (path.empty()) {
      setNavMessage(
        `No route connects “${from.data('label')}” to “${to.data('label')}”`,
      );
      setNavKind('warn');
      return;
    }

    cy.elements().addClass('node-dimmed edge-dimmed');
    path.nodes().removeClass('node-dimmed').addClass('highlighted-node');
    path.edges().removeClass('edge-dimmed').addClass('highlighted-edge');

    fitNode(cy, path, 60, 900);

    const hops = path.edges().length;
    setNavMessage(
      `Route: “${from.data('label')}” → “${to.data('label')}” • ${
        path.nodes().length
      } nodes, ${hops} hop${hops !== 1 ? 's' : ''}`,
    );
    setNavKind('ok');
  }, [fromValue, toValue, clearHighlights, fitNode]);

  const handleClear = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    setFromValue('');
    setToValue('');
    setNavigateMode(false);
    clearHighlights(cy);
    fitAll(cy, 50, 600);
    setNavMessage('');
  }, [clearHighlights, fitAll]);

  return (
    <div className="app">
      <div id="cy" ref={containerRef} />
      <div className="overlay search-lozenge">
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
          className="btn btn-primary btn-sm"
          onClick={handleSearch}
        >
          Go
        </button>
        <button
          id="btnDirections"
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setNavigateMode(true)}
          title="Directions"
        >
          Directions
        </button>
        {navigateMode ? (
          <>
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
              Clear
            </button>
          </>
        ) : null}
        <div id="searchHint" className="lozenge-hint">{searchHint}</div>
        <div id="navResult" className={`hint nav-${navKind} ${!navigateMode || !navMessage ? 'hidden' : ''}`}>{navMessage}</div>
      </div>
      <div className="overlay zoom-controls">
        <button
          id="btnZoomIn"
          type="button"
          className="btn btn-outline btn-sm"
          title="Zoom in"
        >
          +
        </button>
        <button
          id="btnZoomOut"
          type="button"
          className="btn btn-outline btn-sm"
          title="Zoom out"
        >
          −
        </button>
        <button
          id="btnFit"
          type="button"
          className="btn btn-outline btn-sm"
          title="Fit all"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
