# tech-graph — Project Status

## Goal
A web app that visualizes a graph of technologies, styled like a mapping app.
- **Nodes** = languages / language-like abstractions (e.g. "C", "JavaScript", "x86 machine code", "physical hardware").
- **Edges** = technologies (typically programs) connecting nodes, of two types: `interpret` and `translate`.
- Mapping-app feel: full-screen pan/zoom canvas, overlay controls, legend, zoom buttons.
- **Search** a node → map pans to it and zooms in.
- **Navigation**: pick "from" and "to" nodes → graph algorithm (shortest path via `eles.dijkstra()`) computes the spanning subgraph, which is highlighted; everything else is dimmed; viewport fits the subgraph.
- Graph technology: **Cytoscape.js** — built-in pan/zoom, force-directed `cose` layout, `eles.dijkstra()` for shortest-path, CSS-like classes for highlighting/dimming.

## Stack
- **React 18 + Vite** (ported from vanilla JS).
- Cytoscape.js (npm package) — initialized imperatively on a React ref; React drives form state and status messages.
- Vanilla CSS (ported from original `css/style.css`).

## Project structure
```
index.html              # Vite entry, mounts #root
package.json, vite.config.js, package-lock.json
src/main.jsx            # React entry
src/App.jsx             # root component: Cytoscape init (ref), form state, nav state, zoom buttons
src/App.css             # mapping-app styles
src/data.js             # graph data: NODES (19) + EDGES (19), toCyElements() helper
src/components/
  SearchCard.jsx        # node search → pan (datalist autocomplete)
  NavCard.jsx           # from/to → dijkstra shortest path
  MapControls.jsx       # zoom in/out/fit all
  Legend.jsx            # node/edge type legend
dist/                   # production build (vite build)
e2e.test.js             # puppeteer test against built app (passes)
node_modules/           # installed dependencies
```

## Graph content (seed data)
Same as the original spec:
- `physical hardware` (root); `x86 processor`, `ARM processor` lead into it as hardware devices
- `x86 machine code` --interpret--> `x86 processor`
- `Intel Assembly` --translate("Intel Assembler")--> `x86 machine code`; `C` --translate--> `Intel Assembly`
- `JavaScript` --interpret--> `web browser`, `Node.js`, `x86 processor`
- Extra paths: Java→javac→bytecode→JVM→JIT→hardware; Python→CPython→hardware; C++/ARM variants

Example shortest paths (navigation feature):
- `C` → `x86 processor`: C → Intel Assembly → x86 machine code → x86 processor (3 hops)
- `Java` → `x86 processor`: Java → Java bytecode → JVM → x86 processor (3 hops)

## Current state — COMPLETE
- [x] Vanilla version built & verified
- [x] Ported to React + Vite
- [x] Graph seeded with all example nodes/edges
- [x] Map-like UI: pan (drag), zoom (scroll/+−), fit all, dark map theme, legend
- [x] Node search → pan + zoom to node
- [x] From/to navigation → `eles.dijkstra()` shortest path, highlighted subgraph, dimmed rest, fit viewport, status message, Clear reset
- [x] Production build: `npm run build` → `dist/`
- [x] End-to-end verification: `node e2e.test.js` → REACT E2E TEST PASSED

## How to run
```bash
# install dependencies (one-time)
npm install

# dev server with hot reload
npm run dev

# production build
npm run build

# preview production build locally
npm run preview

# run e2e test (builds, serves dist, drives headless Chromium)
npm test   # → node e2e.test.js
```

## Remaining known limitations (optional future work)
- No persistent storage / node editor — graph data is hardcoded in `src/data.js`.
- `window.__cy` debug hook exposed for console inspection/testing.
- Edge labels drawn small along bezier curves; readable at higher zoom levels.
