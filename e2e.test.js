// End-to-end test: real headless Chromium loads the built React app and drives the UI.
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const PORT = 5174;
const distDir = join(process.cwd(), 'dist');

let server;

function startServer() {
  return new Promise((resolve, reject) => {
    server = createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      let filePath = join(distDir, url.pathname === '/' ? '/index.html' : url.pathname);
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
  if (counts.nodes !== 19 || counts.edges !== 19) {
    throw new Error('unexpected graph size');
  }

  // 2. Graph algorithm: shortest path C -> x86-processor
  const pathInfo = await page.evaluate(() => {
    const c = window.__cy;
    const d = c.elements().dijkstra(c.nodes('#c'));
    const path = d.pathTo(c.nodes('#x86-processor'));
    return {
      labels: path.nodes().map((n) => n.data('label')),
      hops: path.edges().length,
    };
  });
  console.log(
    'shortest path C -> x86-processor:',
    pathInfo.labels.join(' -> '),
    '| hops:',
    pathInfo.hops,
  );
  if (pathInfo.hops !== 3) throw new Error('expected 3 hops');

  // 3. Search -> pan to node
  await page.type('#nodeSearch', 'JavaScript');
  await page.click('#btnGo');
  await new Promise((r) => setTimeout(r, 900));
  const hint = await page.evaluate(
    () => document.getElementById('searchHint').textContent,
  );
  console.log('search hint:', hint);
  if (!hint.includes('Panned to')) throw new Error('search did not pan');

  // 4. From/To navigation
  await page.waitForFunction(() => {
    const s = document.getElementById('fromSelect');
    return s && s.options.length > 1;
  }, { timeout: 15000 });
  await page.evaluate(() => {
    const setSelect = (id, val) => {
      const el = document.getElementById(id);
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setSelect('fromSelect', 'c');
    setSelect('toSelect', 'x86-processor');
  });
  await page.evaluate(() => {
    const btn = document.getElementById('btnNavigate');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const nav = await page.evaluate(() => {
    const el = document.getElementById('navResult').textContent;
    const c = window.__cy;
    return {
      msg: el,
      highlightedNodes: c.nodes('.highlighted-node').length,
      highlightedEdges: c.edges('.highlighted-edge').length,
      dimmed: c.elements('.node-dimmed').length,
    };
  });
  console.log('navigation:', nav);
  if (!nav.msg.includes('Route')) throw new Error('navigation did not compute route');
  if (nav.highlightedNodes !== 4 || nav.highlightedEdges !== 3) {
    throw new Error('expected path nodes/edges highlighted');
  }

  // 5. Clear
  await page.evaluate(() => {
    const btn = document.getElementById('btnClear');
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
