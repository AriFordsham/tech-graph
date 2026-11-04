/* Tech Graph — React app using shadcn/ui primitives + Cytoscape.js */

import cytoscape from 'cytoscape';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toCyElements } from './data';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select } from './components/ui/select';
import { Card, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Separator } from './components/ui/separator';
import SearchCard from './components/SearchCard';
import NavCard from './components/NavCard';
import MapControls from './components/MapControls';
import Legend from './components/Legend';
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
      'text-outline-color': '#ffffff',
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
    selector: 'node.root',
    style: {
      'border-width': 3,
      'border-color': '#f59e0b',
      'font-size': 11,
      'z-index': 999,
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
  const zoomInRef = useRef(null);
  const zoomOutRef = useRef(null);
  const fitRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchHint, setSearchHint] = useState(
    'Type a node name → map pans to it',
  );
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [navMessage, setNavMessage] = useState('');
  const [navKind, setNavKind] = useState('info');
  const [nodeLabels, setNodeLabels] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);

  // ---------- Initialise Cytoscape ----------
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

    // Debug hook for testing / console inspection.
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

    // Click a node → centre on it
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      clearHighlights(cy);
      node.addClass('highlighted-node');
      setSearchHint(`Centred on “${node.data('label')}”`);
      fitNode(cy, node);
    });

    // Map control buttons
    zoomInRef.current?.addEventListener('click', () =>
      cy.animate({ zoom: cy.zoom() * 1.4 }, { duration: 400 }),
    );
    zoomOutRef.current?.addEventListener('click', () =>
      cy.animate({ zoom: cy.zoom() / 1.4 }, { duration: 400 }),
    );
    fitRef.current?.addEventListener('click', () => {
      clearHighlights(cy);
      fitAll(cy, 50, 700);
    });

    window.addEventListener('resize', () => cy.resize());

    return () => {
      zoomInRef.current?.removeEventListener('click', () =>
        cy.animate({ zoom: cy.zoom() * 1.4 }, { duration: 400 }),
      );
      zoomOutRef.current?.removeEventListener('click', () =>
        cy.animate({ zoom: cy.zoom() / 1.4 }, { duration: 400 }),
      );
      fitRef.current?.removeEventListener('click', () => {
        clearHighlights(cy);
        fitAll(cy, 50, 700);
      });
      window.removeEventListener('resize', () => cy.resize());
      cy.destroy();
    };
  }, []);

  // ---------- Helpers ----------
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

  // ---------- Search → pan to node ----------
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

  // ---------- From/To navigation → shortest path ----------
  const handleNavigate = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    clearHighlights(cy);
    setNavMessage('');

    // Read select values from DOM (robust to controlled-component state sync timing).
    const fromEl = document.getElementById('fromSelect');
    const toEl = document.getElementById('toSelect');
    const fromId = (fromEl && fromEl.value) || '';
    const toId = (toEl && toEl.value) || '';

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

    // Graph algorithm: shortest path spanning the two nodes (unweighted).
    const dijkstra = cy.elements().dijkstra(from);
    const path = dijkstra.pathTo(to);

    if (path.empty()) {
      setNavMessage(
        `No route connects “${from.data('label')}” to “${to.data('label')}”`,
      );
      setNavKind('warn');
      return;
    }

    // Dim everything outside the subgraph, highlight the path.
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
    clearHighlights(cy);
    fitAll(cy, 50, 600);
    setNavMessage('');
  }, [clearHighlights, fitAll]);

  return (
    <div className="app">
      <div id="cy" ref={containerRef} />
      <header className="map-header">
        <div className="brand">Tech Graph</div>
        <div className="toolbar">
          <SearchCard
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            hint={searchHint}
            labels={nodeLabels}
          />
          <NavCard
            options={nodeOptions}
            fromValue={fromValue}
            toValue={toValue}
            onFromChange={(e) => setFromValue(e.target.value)}
            onToChange={(e) => setToValue(e.target.value)}
            onNavigate={handleNavigate}
            onClear={handleClear}
            message={navMessage}
            kind={navKind}
          />
          <MapControls
            zoomInRef={zoomInRef}
            zoomOutRef={zoomOutRef}
            fitRef={fitRef}
          />
        </div>
      </header>
      <footer className="map-footer">
        <Legend />
        <div className="hint">
          Drag to pan &bull; Scroll to zoom &bull; Click a node to centre on it
        </div>
      </footer>
    </div>
  );
}
