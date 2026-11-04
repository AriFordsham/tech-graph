# tech-graph — Project Status

## Goal
Web app visualizing a graph of technologies, styled like a mapping app (shadcn/ui design system, white background).
- **Nodes** = languages / language-like abstractions; **edges** = technologies (`interpret` / `translate`)
- Mapping-app feel: full-screen pan/zoom canvas, overlay controls, legend, zoom buttons
- **Search** a node → pan + zoom to it
- **Navigation**: from/to → `eles.dijkstra()` shortest path, highlighted subgraph, dimmed rest

## Stack
- React 18 + Vite, Cytoscape.js (npm)
- shadcn/ui primitives (Button, Input, Select, Card, Label, Separator) + `cn()` utility, plain CSS with OKLCH variables
- No Tailwind

## Project structure
```
index.html, package.json, vite.config.js, package-lock.json
src/main.jsx
src/App.jsx          # Cytoscape init (ref), form/nav state, zoom buttons
src/App.css          # shadcn CSS variables + component styles
src/lib/utils.js     # cn() utility
src/data.js          # graph data: NODES (19) + EDGES (19)
src/components/ui/   # button, input, select, card, label, separator
src/components/
  SearchCard.jsx     # node search → pan
  NavCard.jsx        # from/to → dijkstra shortest path
  MapControls.jsx    # zoom in/out/fit all
  Legend.jsx         # node/edge type legend
dist/                # production build
e2e.test.js          # puppeteer test (passes)
```

## Graph content (seed data)
- `physical hardware` (root); `x86`/`ARM` processors → hardware
- `x86 machine code` →interpret→ `x86 processor`; `Intel Assembly` →translate→ `x86 machine code`; `C` →translate→ `Intel Assembly`
- `JavaScript` →interpret→ `web browser` / `Node.js` / `x86 processor`
- Extra paths: Java→javac→bytecode→JVM→hardware; Python→CPython→hardware; C++/ARM variants
- Example shortest path: `C` → Intel Assembly → x86 machine code → x86 processor (3 hops)

## Current state — COMPLETE
- [x] React port with shadcn/ui components on white background
- [x] Graph seeded with all example nodes/edges
- [x] Map UI: pan (drag), zoom (scroll/+−), fit all, legend
- [x] Node search → pan + zoom
- [x] From/to navigation → dijkstra shortest path, highlighted subgraph, dimmed rest, Clear reset
- [x] `npm run build` → `dist/`
- [x] `npm test` (headless Chromium e2e) → PASSED

## How to run
```bash
npm install          # one-time
npm run dev          # dev server (localhost:5173)
npm run build        # production build to dist/
npm test             # e2e test in headless Chromium
```
Serve `dist/` over HTTP (don't open `dist/index.html` directly — asset paths are absolute).

## Known limitations
- Graph data is hardcoded in `src/data.js` (no persistent storage / node editor)
- `window.__cy` debug hook exposed
- Edge labels small along bezier curves; readable at higher zoom
