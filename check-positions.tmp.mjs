import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

const PORT = 5310;
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
});

const waitForServer = async (port, tries = 40) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('vite preview did not come up');
};

try {
  await waitForServer(PORT);
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__cy, { timeout: 30000 });
  // Give the cose layout + fit animation a moment to finish.
  await new Promise((r) => setTimeout(r, 1500));

  const result = await page.evaluate(() => {
    const cy = window.__cy;
    const positions = cy.nodes().map((n) => {
      const p = n.position();
      return { label: n.data('label'), x: Math.round(p.x), y: Math.round(p.y) };
    });
    const distinct = new Set(positions.map((p) => `${p.x},${p.y}`));
    return { count: positions.length, distinct: distinct.size, positions };
  });

  console.log(JSON.stringify(result, null, 2));
  const allAtOrigin = result.distinct === 1 && result.positions[0].x === 0 && result.positions[0].y === 0;
  console.log(allAtOrigin ? 'FAIL: all nodes still at (0,0)' : `OK: ${result.distinct} distinct positions across ${result.count} nodes`);
  await browser.close();
  process.exit(allAtOrigin ? 1 : 0);
} finally {
  preview.kill();
}
