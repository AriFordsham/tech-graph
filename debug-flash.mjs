import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const PORT = 5310;
const distDir = join(process.cwd(), 'dist');

const server = createServer((req, res) => {
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

server.listen(PORT, async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  
  // Take screenshots over time
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '/tmp/shot1.png' });
  await new Promise(r => setTimeout(r, 100));
  await page.screenshot({ path: '/tmp/shot2.png' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: '/tmp/shot3.png' });
  await page.waitForFunction(() => window.__cy, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/tmp/shot4.png' });
  
  // Check DOM
  const info = await page.evaluate(() => {
    const search = document.querySelector('.search-lozenge');
    const nav = document.querySelector('.nav-controls');
    return {
      searchExists: !!search,
      searchVisible: search ? window.getComputedStyle(search).display !== 'none' && window.getComputedStyle(search).visibility !== 'hidden' : false,
      navExists: !!nav,
      navChildren: nav ? nav.children.length : 0
    };
  });
  console.log(info);
  
  await browser.close();
  server.close();
  process.exit(0);
});
