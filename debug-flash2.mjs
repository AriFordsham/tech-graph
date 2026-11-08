import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const PORT = 5311;
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
  
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 20; i++) {
    const info = await page.evaluate(() => {
      const search = document.querySelector('.search-lozenge');
      const nav = document.querySelector('.nav-controls');
      return {
        searchExists: !!search,
        searchDisplay: search ? window.getComputedStyle(search).display : null,
        navExists: !!nav,
        navHTML: nav ? nav.innerHTML.substring(0, 50) : null
      };
    });
    console.log(i + ':', info);
    await new Promise(r => setTimeout(r, 50));
  }
  
  await browser.close();
  server.close();
  process.exit(0);
});
