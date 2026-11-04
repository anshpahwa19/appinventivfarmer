/*
 * Captures phone screenshots of both design directions for the design-direction deck.
 * Usage: start `npx vite --port 5173`, then `node scripts/deck/capture.cjs <outDir>`.
 * Viewport 393×852 at deviceScaleFactor 2. Each shot seeds `kisani-urjaa:state` first.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = process.argv[2] || 'deck-shots';
fs.mkdirSync(OUT, { recursive: true });

const SIGNED_IN = { onboarded: true, signedIn: true, verified: true, phone: '9876543210', location: 'skipped' };
const NEW_USER = { onboarded: false, signedIn: false, verified: false, phone: '', location: 'unknown' };

function state({ theme = 'light', session = SIGNED_IN, demo } = {}) {
  const s = { version: 3, session, prefs: { theme, text: 'default', motion: 'system', language: 'en' } };
  if (demo) s.demo = demo;
  return s;
}

// [name, route (Direction 01 form), options]
const SHOTS = [
  ['home', '/home'],
  ['learn', '/learn'],
  ['events', '/events'],
  ['event', '/events/e-baling-demo'],
  ['story', '/news/n-straw-collection'],
  ['orders', '/orders'],
  ['neworder', '/orders/fom/new'],
  ['account', '/account'],
  ['notifications', '/notifications'],
  ['lands', '/lands'],
  ['ds', '/design-system', { full: true }],
  ['welcome', '/welcome', { session: NEW_USER }],
  ['auth', '/auth', { session: NEW_USER }],
  ['splash', '/home', { splash: true }],
  ['home-dark', '/home', { theme: 'dark' }],
  ['learn-dark', '/learn', { theme: 'dark' }],
  ['orders-dark', '/orders', { theme: 'dark' }],
  ['account-dark', '/account', { theme: 'dark' }],
  ['event-dark', '/events/e-baling-demo', { theme: 'dark' }],
  ['loading', '/orders', { demo: { network: 'slow', emptyData: false }, early: true }],
  ['empty', '/orders', { demo: { network: 'normal', emptyData: true } }],
  ['empty-events', '/events', { demo: { network: 'normal', emptyData: true } }],
  ['offline', '/home', { demo: { network: 'offline', emptyData: false } }],
  ['offline-learn', '/learn', { demo: { network: 'offline', emptyData: false } }],
  ['prototype', '/account/prototype'],
];

(async () => {
  const browser = await chromium.launch();
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  for (const dir of ['d1', 'd2']) {
    for (const [name, route, o = {}] of SHOTS) {
      if (only && !only.includes(name)) continue;
      const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: o.theme === 'dark' ? 'dark' : 'light' });
      const st = JSON.stringify(state(o));
      await ctx.addInitScript((v) => { try { localStorage.setItem('kisani-urjaa:state', v); } catch (e) {} }, st);
      const page = await ctx.newPage();
      const url = `${BASE}/#${dir === 'd2' ? '/d2' + route : route}`;
      await page.goto(url, { waitUntil: o.splash ? 'domcontentloaded' : 'networkidle' });
      if (o.splash) {
        await page.waitForSelector(dir === 'd2' ? '[data-testid="fj-splash"]' : '[data-testid="splash"]', { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1300);
      } else {
        const sel = dir === 'd2' ? '[data-testid="fj-splash"]' : '[data-testid="splash"]';
        const sp = await page.$(sel);
        if (sp) { await sp.click().catch(() => {}); }
        await page.waitForSelector(sel, { state: 'detached', timeout: 6000 }).catch(() => {});
        await page.waitForTimeout(o.early ? 250 : 2200);
      }
      const file = path.join(OUT, `${dir}-${name}.png`);
      if (o.full) {
        // The app scrolls inside its own page container; expand it to capture the whole screen.
        const h = await page.evaluate(() => {
          let max = document.documentElement.scrollHeight;
          document.querySelectorAll('*').forEach((el) => { const cs = getComputedStyle(el); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 4) max = Math.max(max, el.scrollHeight); });
          return Math.min(max, 12000);
        });
        await page.setViewportSize({ width: 393, height: h });
        await page.waitForTimeout(1500);
      }
      await page.screenshot({ path: file });
      console.log('saved', file);
      await ctx.close();
    }
  }
  await browser.close();
})();
