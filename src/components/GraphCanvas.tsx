/* Tech Graph — Cytoscape canvas layer.

Owns the Cytoscape core instance, its ref, the tap handler and the window
resize listener. Notifies the parent via onInit (passes the core) and
onNodeTap (passes the tapped node's label). All graph behaviour (highlighting,
fitting, navigation) lives in the parent and is driven through the cy ref.
*/

import cytoscape from 'cytoscape';
import { useEffect, useRef } from 'react';
import { toCyElements } from '../data';

export const CY_STYLE: cytoscape.StylesheetStyle[] = [
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

export const CY_LAYOUT = {
  name: 'cose',
  animate: false,
  padding: 60,
  nodeRepulsion: 4500,
  edgeElasticity: 0.45,
  gravity: 0.12,
  randomize: false,
  // Prevent labels from overlapping nodes and each other (StackOverflow
  // cytospec approach): treat each node+label bounding box as the layout unit
  // and push nodes apart so their label areas never collide.
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: true,
};

interface GraphCanvasProps {
  onInit: (cy: cytoscape.Core) => void;
  onNodeTap: (label: string) => void;
}

export default function GraphCanvas({ onInit, onNodeTap }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current!,
      elements: toCyElements(),
      style: CY_STYLE,
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
      autoungrabify: true,
    });
    cyRef.current = cy;
    onInit(cy);

    // Ensure Cytoscape measures the container before fitting.
    cy.resize();

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
      onNodeTap(evt.target.data('label'));
    });

    // FIX: store the handler in a const so addEventListener/removeEventListener
    // reference the same function (the previous code removed a different
    // anonymous function, so the listener was never actually removed).
    const handleResize = () => cy.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cy.destroy();
    };
  }, [onInit, onNodeTap]);

  return <div id="cy" ref={containerRef} />;
}
