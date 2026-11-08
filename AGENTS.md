# tech-graph — Project Status

## Goal
Web app visualizing a graph of technologies, styled like a mapping app (shadcn/ui design system, white background).
- **Nodes** = languages / language-like abstractions (all same color); **edges** = technologies (`interpret` / `translate`)
- Mapping-app feel: full-screen pan/zoom canvas, overlay controls, zoom buttons
- **Search** a node → pan + zoom to it (floating Google Maps-style lozenge top-left)
- **Navigation**: from/to → `eles.dijkstra()` shortest path, highlighted subgraph, dimmed rest (two-lozenge view via Directions button)

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
- [x] All nodes same color (no color differentiation); no legend
- [x] Graph seeded with all example nodes/edges
- [x] Map UI: pan (drag), zoom (scroll/+−/buttons), fit all
- [x] Node search → pan + zoom (floating lozenge top-left)
- [x] From/to navigation → dijkstra shortest path, highlighted subgraph, dimmed rest, Clear reset
- [x] `npm run build` → `dist/`
- [x] `npm test` (headless Chromium e2e) → PASSED

## UI layout (final)
- **Top-left**: floating search lozenge (Google Maps style) with `🔍` Go and `🗺️` Directions icon buttons
- **Directions toggle**: expands to two stacked lozenges (From / To selects) + Navigate / Clear buttons
- **Bottom-right**: clean zoom controls (+, −, ⤢) icon buttons with no labels
- **No fixed top panel; no bottom hint text**

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
