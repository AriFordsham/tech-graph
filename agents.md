# tech-graph — Project Status

This document should be kept up to date with the current status. Codebase should be kept clean and DRY. 
Documents and comments should be maintained to only keep information relevant to the present and the future, 
not document irrelevant past choices and historical details. 

## Goal
A web app that visualizes a graph of technologies, styled like a mapping app using **shadcn/ui** design system on a **white background**.
- **Nodes** = languages / language-like abstractions; **edges** = technologies (`interpret` / `translate`)
- Mapping-app feel: full-screen pan/zoom canvas, overlay controls, legend, zoom buttons
- **Search** a node → pan + zoom to it
- **Navigation**: from/to → `eles.dijkstra()` shortest path, highlighted subgraph, dimmed rest
- Graph tech: Cytoscape.js (pan/zoom, cose layout, dijkstra)

## Stack
- React 18 + Vite, Cytoscape.js (npm)
- shadcn/ui design system implemented with plain CSS + CSS variables (OKLCH color space)
- No Tailwind dependency (keeps build simple, works behind NetFree)

## Current state — COMPLETE
- [x] React port complete & verified
- [x] Shadcn CSS variable system (OKLCH colors, radius scale, semantic tokens)
- [x] shadcn UI primitives: Button, Input, Select, Card, CardTitle, Label, Separator (+ cn utility)
- [x] App rewritten to use shadcn components
- [x] White background theme
- [x] Production build: `npm run build` → `dist/`
- [x] End-to-end verification: `node e2e.test.js` → REACT E2E TEST PASSED

## Colors (light / shadcn-inspired)
- Background: white (`oklch(1 0 0)`)
- Primary: blue (`oklch(0.45 0.18 240)`)
- Semantic tokens: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring
- Radius: 0.625rem base with derived scale (sm/md/lg/xl/2xl/3xl/4xl)

*Note: shadcn preset `b1PziS` is an opaque server-side ID; exact theme values couldn't be resolved without client-side JS execution. Default shadcn neutral light values applied with blue primary.*

## Project structure
```
index.html
package.json, vite.config.js, package-lock.json
src/main.jsx
src/App.jsx            # Cytoscape init (ref), form state, nav state, zoom buttons
src/App.css            # shadcn CSS variables + component styles
src/lib/utils.js       # cn() className utility
src/data.js            # graph data: NODES (19) + EDGES (19)
src/components/ui/     # shadcn primitives: button, input, select, card, label, separator
src/components/
  SearchCard.jsx       # node search → pan (datalist autocomplete)
  NavCard.jsx          # from/to → dijkstra shortest path
  MapControls.jsx      # zoom in/out/fit all
  Legend.jsx           # node/edge type legend
dist/                  # production build
e2e.test.js            # puppeteer test against built app (passes)
node_modules/          # installed dependencies (gitignored)
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

## How to run
```bash
npm install          # one-time (installs puppeteer-core for e2e)
npm run dev          # dev server with hot reload (localhost:5173)
npm run build        # production build to dist/
npm run preview      # preview production build locally
npm test             # e2e test (builds, serves dist, drives headless Chromium)
```

## Remaining known limitations (optional future work)
- No persistent storage / node editor — graph data is hardcoded in `src/data.js`.
- `window.__cy` debug hook exposed for console inspection/testing.
- Edge labels drawn small along bezier curves; readable at higher zoom levels.
- Select values read from DOM in navigate handler (robust to React controlled-component state sync timing in test automation).
- Node label readability fixed: Cytoscape `text-outline-color` changed from white (`#ffffff`) to dark (`#0b1021`) so labels are visible against the white canvas.
