# tech-graph — Project Status

## Goal
A web app that visualizes a graph of technologies, styled like a mapping app.
- **Nodes** = languages / language-like abstractions; **edges** = technologies (`interpret` / `translate`)
- Mapping-app feel: full-screen pan/zoom canvas, overlay controls, legend, zoom buttons
- **Search** a node → pan + zoom to it
- **Navigation**: from/to → `eles.dijkstra()` shortest path, highlighted subgraph, dimmed rest
- Graph tech: Cytoscape.js (pan/zoom, cose layout, dijkstra)

## Stack
- React 18 + Vite, Cytoscape.js (npm), vanilla CSS (shadcn-inspired light theme)

## Current state — COMPLETE
- [x] React port complete & verified
- [x] Reworked to shadcn-inspired aesthetic on white background
- [x] Cytoscape styles updated for light-mode readability
- [x] Rebuilt + e2e test passes

## Colors (light / shadcn-inspired)
- Background: white (`#ffffff`)
- Cards: white with subtle slate border + shadow
- Text: slate-900 primary, slate-500 secondary
- Primary: blue-500
- Graph canvas: white

## Project structure
```
index.html              # Vite entry, mounts #root
package.json, vite.config.js, package-lock.json
src/main.jsx            # React entry
src/App.jsx             # root component: Cytoscape init (ref), form state, nav state, zoom buttons
src/App.css             # shadcn-inspired light theme CSS
src/data.js             # graph data: NODES (19) + EDGES (19), toCyElements() helper
src/components/
  SearchCard.jsx        # node search → pan (datalist autocomplete)
  NavCard.jsx           # from/to → dijkstra shortest path
  MapControls.jsx       # zoom in/out/fit all
  Legend.jsx            # node/edge type legend
dist/                   # production build (vite build)
e2e.test.js             # puppeteer test against built app (passes)
node_modules/           # installed dependencies (gitignored)
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
