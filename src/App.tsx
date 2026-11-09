/* Tech Graph — React app using shadcn/ui primitives + Cytoscape.js.
 *
 * Shell component: owns the Cytoscape ref, all navigation/search state and the
 * top-level layout. Graph initialisation, tap handling and resize listening live
 * in GraphCanvas; the overlays are SearchLozenge / DirectionsPanel /
 * ZoomControls.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { NODES } from './data';
import GraphCanvas from './components/GraphCanvas';
import Key from './components/Key';
import SearchLozenge from './components/SearchLozenge';
import DirectionsPanel from './components/DirectionsPanel';
import ZoomControls from './components/ZoomControls';
import { cn } from './lib/utils';
import './App.css';

export default function App() {
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [navigateMode, setNavigateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const nodeLabels = useMemo(() => NODES.map((n) => n.label), []);

  const handleInit = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;
    window.__cy = cy;
  }, []);

  const handleNodeTap = useCallback((label: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.nodes().toArray().find((n) => n.data('label') === label);
    if (!node) return;
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    node.addClass('highlighted-node');
    cy.animate({ fit: { eles: node, padding: 80 } }, { duration: 600 });
  }, []);

  const handleSearch = useCallback((label?: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const q = (label ?? searchQuery).trim();
    if (!q) return;
    const node = cy.nodes().toArray().find((n) => n.data('label').toLowerCase() === q.toLowerCase());
    if (!node) {
      return;
    }
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    node.addClass('highlighted-node');
    cy.animate({ fit: { eles: node, padding: 80 } }, { duration: 700 });
  }, [searchQuery]);

  const handleNavigate = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');

    const fromId = fromValue;
    const toId = toValue;

    if (!fromId || !toId) {
      return;
    }

    const from = cy.nodes().toArray().find((n) => n.data('label') === fromId);
    const to = cy.nodes().toArray().find((n) => n.data('label') === toId);
    if (!from || !to) {
      return;
    }

    if (fromId === toId) {
      from.addClass('highlighted-node');
      cy.animate({ fit: { eles: from, padding: 100 } }, { duration: 700 });
      return;
    }

    const dijkstra = cy.elements().dijkstra({ root: from });
    const path = dijkstra.pathTo(to);

    if (path.empty()) {
      return;
    }

    cy.elements().addClass('node-dimmed edge-dimmed');
    path.nodes().removeClass('node-dimmed').addClass('highlighted-node');
    path.edges().removeClass('edge-dimmed').addClass('highlighted-edge');

    cy.animate({ fit: { eles: path, padding: 60 } }, { duration: 900 });
  }, [fromValue, toValue]);

  const handleClear = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    setFromValue('');
    setToValue('');
    setNavigateMode(false);
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 600 });
  }, []);

  const handleZoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.animate({ zoom: cy.zoom() * 1.4 }, { duration: 400 });
  }, []);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.animate({ zoom: cy.zoom() / 1.4 }, { duration: 400 });
  }, []);

  const handleFitAll = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass('node-dimmed edge-dimmed highlighted-node highlighted-edge');
    cy.animate({ fit: { eles: cy.elements(), padding: 40 } }, { duration: 700 });
  }, []);

  return (
    <div className="app">
      <GraphCanvas onInit={handleInit} onNodeTap={handleNodeTap} />
      <div className={cn('overlay', 'nav-controls')}>
        {!navigateMode ? (
          <SearchLozenge
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(label) => {
              setSearchQuery(label);
              handleSearch(label);
            }}
            onSearch={handleSearch}
            onDirections={() => {
              setFromValue(searchQuery);
              setNavigateMode(true);
            }}
            options={nodeLabels}
          />
        ) : (
          <DirectionsPanel
            fromValue={fromValue}
            onFromChange={setFromValue}
            toValue={toValue}
            onToChange={setToValue}
            onNavigate={handleNavigate}
            onClose={handleClear}
            nodeLabels={nodeLabels}
          />
        )}
      </div>
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitAll={handleFitAll} />
      <Key />
    </div>
  );
}
