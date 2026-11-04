# tech-graph — Project Status

## Goal
A web app that visualizes a graph of technologies, styled like a mapping app.
- **Nodes** = languages / language-like abstractions; **edges** = technologies (`interpret` / `translate`)
- Mapping-app feel: full-screen pan/zoom canvas, overlay controls, legend, zoom buttons
- **Search** a node → pan + zoom to it
- **Navigation**: from/to → `eles.dijkstra()` shortest path, highlighted subgraph, dimmed rest
- Graph tech: Cytoscape.js (pan/zoom, cose layout, dijkstra)

## Stack
- React 18 + Vite, Cytoscape.js (npm), vanilla CSS

## Current state — IN PROGRESS (aesthetic rework)
- [x] React port complete & verified (dark theme)
- [ ] Rework to shadcn-inspired aesthetic on white background
- [ ] Update Cytoscape styles for light-mode readability
- [ ] Rebuild + re-run e2e test
- [ ] Commit

## Colors (light / shadcn-inspired)
- Background: white (`#ffffff`)
- Cards: white with subtle slate border + shadow
- Text: slate-900 primary, slate-500 secondary
- Primary: blue-500
- Graph canvas: white

## Project structure
Same as React port; only `src/App.css` and component class names change.
