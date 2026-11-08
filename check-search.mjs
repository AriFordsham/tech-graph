import puppeteer from 'puppeteer-core';

const URL = process.argv[2] || 'http://localhost:5199';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wait for the server to be up.
let up = false;
for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(URL);
    if (res.ok) { up = true; break; }
  } catch {}
  await sleep(500);
}
if (!up) { console.log('SERVER NOT UP'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE: ' + m.text());
});
page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
await page.waitForFunction(() => window.__cy, { timeout: 20000 }).catch(() => {});

const info = await page.evaluate(() => {
  const search = document.getElementById('nodeSearch');
  const btnGo = document.getElementById('btnGo');
  const lozenge = document.querySelector('.search-lozenge');
  const overlay = document.querySelector('.overlay.nav-controls');
  const cy = document.getElementById('cy');
  const style = search ? getComputedStyle(search) : null;
  const lozStyle = lozenge ? getComputedStyle(lozenge) : null;
  const ovStyle = overlay ? getComputedStyle(overlay) : null;
  const cyStyle = cy ? getComputedStyle(cy) : null;
  return {
    hasSearch: !!search,
    hasBtnGo: !!btnGo,
    hasLozenge: !!lozenge,
    hasOverlay: !!overlay,
    hasCy: !!cy,
    cyRect: cy ? cy.getBoundingClientRect().toJSON() : null,
    overlayRect: overlay ? overlay.getBoundingClientRect().toJSON() : null,
    lozengeDisplay: lozStyle ? lozStyle.display : null,
    lozengeVisibility: lozStyle ? lozStyle.visibility : null,
    lozengeOpacity: lozStyle ? lozStyle.opacity : null,
    lozengeRect: lozenge ? lozenge.getBoundingClientRect().toJSON() : null,
    searchRect: search ? search.getBoundingClientRect().toJSON() : null,
    overlayPosition: ovStyle ? ovStyle.position : null,
    overlayZ: ovStyle ? ovStyle.zIndex : null,
    cyZ: cyStyle ? cyStyle.zIndex : null,
    bodyChildCount: document.body.children.length,
    appHtml: document.querySelector('.app')?.innerHTML.slice(0, 400) || null,
  };
});
console.log(JSON.stringify(info, null, 2));
console.log('ERRORS:', errors.length ? errors : 'none');

// Screenshot to see what actually renders.
await page.screenshot({ path: '/tmp/opencode/dev-check.png' });
console.log('screenshot saved to /tmp/opencode/dev-check.png');
await browser.close();
