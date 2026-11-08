# tech-graph — Project Status

Keep the codebase clean and DRY

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
index.html, package.json, vite.config.ts, package-lock.json
src/main.tsx
src/App.tsx          # Cytoscape init (ref), form/nav state, zoom buttons
src/App.css          # shadcn CSS variables + component styles
src/lib/utils.ts     # cn() utility
src/data.ts          # graph data: NODES (11) + EDGES (11)
src/components/ui/   # button, input, select, card, label, separator
dist/                # production build
e2e.test.js          # puppeteer test (passes)
```

## Graph content (seed data)
- `physical hardware` (root, base language); `x86 machine code` →interpret→ `physical hardware` (x86 processor); `ARM machine code` →interpret→ `physical hardware` (ARM processor)
- `x86 machine code` ←translate← `Intel Assembly` ←translate← `C` / `C++`; `ARM machine code` ←translate← `ARM Assembly` ←translate← `C` / `C++`
- `Java bytecode` ←translate← `Java` (javac) →interpret→ `physical hardware` (JVM); `Python bytecode` ←translate← `Python` (CPython compiler) →interpret→ `physical hardware` (CPython)
- Graph is fully connected: every node reaches `physical hardware`. All remaining machine nodes (processors, JVM, CPython, browser, Node.js, V8) and `JavaScript` eliminated; only `physical hardware` remains as the base-language root
- Example shortest path: `C` → Intel Assembly → x86 machine code (2 hops)

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
- Graph data is hardcoded in `src/data.ts` (no persistent storage / node editor)
- `window.__cy` debug hook exposed
- Edge labels small along bezier curves; readable at higher zoom
