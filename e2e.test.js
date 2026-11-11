// End-to-end test: real headless Chromium loads the built React app and drives the UI.
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const PORT = 5300;
const distDir = join(process.cwd(), 'dist');

let server;

function startServer() {
  return new Promise((resolve, reject) => {
    server = createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      // Vite builds with base '/tech-graph/' (GitHub Pages subpath). Strip it so
      // assets resolve against the dist/ root served by this test server.
      const pathname = url.pathname.startsWith('/tech-graph/')
        ? url.pathname.slice('/tech-graph'.length)
        : url.pathname;
      let filePath = join(distDir, pathname === '/' ? '/index.html' : pathname);
      const ext = filePath.split('.').pop();
      const contentType = {
        html: 'text/html',
        js: 'text/javascript',
        css: 'text/css',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpg',
        svg: 'image/svg+xml',
      }[ext] || 'application/octet-stream';
      try {
        const data = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(PORT, () => resolve());
  });
}

function stopServer() {
  return new Promise((resolve) => server.close(resolve));
}

(async () => {
  await startServer();
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    const txt = m.text();
    if (m.type() === 'error' && !txt.includes('Failed to load resource')) {
      errors.push(txt);
    }
  });

  await page.goto(`http://localhost:${PORT}`, {
    waitUntil: 'networkidle0',
  });

  // Wait for Cytoscape to be initialized.
  await page.waitForFunction(() => window.__cy, { timeout: 30000 });

  // 1. Graph loads
  const counts = await page.evaluate(() => {
    const cy = window.__cy;
    return { nodes: cy.nodes().length, edges: cy.edges().length };
  });
  console.log('nodes/edges:', counts);
  if (counts.nodes !== 11 || counts.edges !== 11) {
    throw new Error('unexpected graph size');
  }

  // 2. Graph algorithm: shortest path C -> x86 machine code
  const pathInfo = await page.evaluate(() => {
    const c = window.__cy;
    const d = c.elements().dijkstra(c.nodes('#c'));
    const path = d.pathTo(c.nodes('#x86-machine-code'));
    return {
      labels: path.nodes().map((n) => n.data('label')),
      hops: path.edges().length,
    };
  });
  console.log(
    'shortest path C -> x86 machine code:',
    pathInfo.labels.join(' -> '),
    '| hops:',
    pathInfo.hops,
  );
  if (pathInfo.hops !== 2) throw new Error('expected 2 hops');

  // 3. Search -> pan to node
  console.log('STEP 3: typing search...');
  await page.type('#nodeSearch', 'C');
  console.log('STEP 3: typed, clicking Go...');
  await page.click('#btnGo');
  console.log('STEP 3: clicked Go, waiting...');
  await new Promise((r) => setTimeout(r, 900));
  console.log('STEP 3: verifying node was centred...');
  const highlighted = await page.evaluate(() => {
    const cy = window.__cy;
    return cy.nodes('.highlighted-node').map(n => n.data('label'));
  });
  console.log('highlighted nodes:', highlighted);
  if (!highlighted.includes('C')) throw new Error('search did not pan');

  // 4. From/To navigation
  await page.evaluate(() => {
    const btn = document.getElementById('btnDirections');
    if (btn) btn.click();
  });
  await page.waitForFunction(() => {
    return !!document.getElementById('fromSearch');
  }, { timeout: 15000 });

  // Set From / To values directly via React state setters
  await page.evaluate(() => {
    window.__setFromValue('C');
    window.__setToValue('x86 machine code');
  });
  await new Promise((r) => setTimeout(r, 300));

  // Click Navigate (embedded in the bottom lozenge) — use JS click because the
  // autocomplete dropdown can visually overlay the button.
  const navResult = await page.evaluate(() => {
    const btn = document.getElementById('btnNavigate');
    if (!btn) return { error: 'btnNavigate not found' };
    btn.click();
    return { clicked: true };
  });
  console.log('btn.click() result:', JSON.stringify(navResult));
  await new Promise((r) => setTimeout(r, 1500));
  const nav = await page.evaluate(() => {
    const c = window.__cy;
    return {
      highlightedNodes: c ? c.nodes('.highlighted-node').length : 0,
      highlightedEdges: c ? c.edges('.highlighted-edge').length : 0,
      dimmed: c ? c.elements('.node-dimmed').length : 0,
    };
  });
  console.log('navigation:', nav);
  if (nav.highlightedNodes !== 3 || nav.highlightedEdges !== 2) {
    throw new Error('expected path nodes/edges highlighted');
  }

  // 5. Clear
  await page.evaluate(() => {
    const btn = document.getElementById('btnClose');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  const afterClear = await page.evaluate(() => {
    const c = window.__cy;
    return { highlighted: c.nodes('.highlighted-node').length, dimmed: c.elements('.node-dimmed').length };
  });
  console.log('after clear:', afterClear);
  if (afterClear.highlighted !== 0 || afterClear.dimmed !== 0) {
    throw new Error('clear did not reset');
  }

  if (errors.length) throw new Error('page errors: ' + errors.join(' | '));
  console.log('\nREACT E2E TEST PASSED');
  await browser.close();
  await stopServer();
  process.exit(0);
})().catch((err) => {
  console.error('REACT E2E TEST FAILED:', err.message);
  if (server) server.close();
  process.exit(1);
});
