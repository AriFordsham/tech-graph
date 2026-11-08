import puppeteer from 'puppeteer-core';
const URL = 'http://localhost:5199';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let up = false;
for (let i = 0; i < 30; i++) {
  try { const res = await fetch(URL); if (res.ok) { up = true; break; } } catch {}
  await sleep(400);
}
if (!up) { console.log('SERVER NOT UP'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
await page.waitForFunction(() => window.__cy, { timeout: 20000 }).catch(() => {});
const info = await page.evaluate(() => {
  const gs = (el) => {
    const s = getComputedStyle(el);
    return {
      position: s.position, top: s.top, left: s.left, width: s.width, height: s.height,
      display: s.display, zIndex: s.zIndex, overflow: s.overflow,
      offsetParent: el.offsetParent ? (el.offsetParent.id || el.offsetParent.className) : null,
    };
  };
  return {
    app: gs(document.querySelector('.app')),
    cy: gs(document.getElementById('cy')),
    overlay: gs(document.querySelector('.overlay.nav-controls')),
    lozenge: gs(document.querySelector('.search-lozenge')),
    // Check if the #cy absolute rule is present in any stylesheet
    cyRuleFound: [...document.styleSheets].some((ss) => { try { return [...ss.cssRules].some((r) => r.cssText && r.cssText.includes('#cy')); } catch { return false; } }),
    sheets: [...document.styleSheets].map((ss) => { try { return { href: ss.href, rules: ss.cssRules.length }; } catch { return { href: ss.href, rules: 'blocked' }; } }),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
