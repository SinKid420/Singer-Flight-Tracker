// Shared test kit: opens AwareBC at 360x640 (Samsung A32 size) with all outside data mocked, and records PASS / FAIL.
const { chromium } = require('playwright');
const mock = require('./mock.cjs');
const SITE = process.env.SITE || 'http://localhost:8766/index.html';
const API = process.env.API || 'http://localhost:8788';
const CORS = { 'access-control-allow-origin': '*' };
const results = [];
let browser = null;

async function start() { browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }); return browser; }
async function stop() { if (browser) await browser.close(); }

// a fresh phone. o.newUser = true shows the first-run screens; o.mode = 'off' switches to Off-road;
// o.ls = extra localStorage; o.desktop = a Windows computer; o.geo = false for no location permission; o.init = extra page script
async function app(o = {}) {
  const c = await browser.newContext({ viewport: o.desktop ? { width: 1280, height: 800 } : { width: 360, height: 640 }, deviceScaleFactor: 1,
    userAgent: o.desktop ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36' : undefined,
    geolocation: { latitude: o.lat || 50.67, longitude: o.lon || -120.33, accuracy: 8 }, permissions: o.geo === false ? [] : ['geolocation', 'microphone'] });
  await mock(c);
  // AwareBC server calls go to the local copy of the server (same code as Cloudflare), unless the test mocks them itself
  await c.route(/awarebc\.aware-bc\.workers\.dev/, async r => { const u = new URL(r.request().url());
    try { const res = await fetch(API + u.pathname + u.search, { method: r.request().method(), headers: { 'Content-Type': 'application/json', 'Origin': 'https://sinkid420.github.io', 'x-ip': o.ip || ('10.0.0.' + (1 + Math.floor(Math.random() * 250))) }, body: r.request().method() === 'POST' ? r.request().postData() : undefined });
      r.fulfill({ status: res.status, headers: Object.assign({}, CORS, { 'content-type': res.headers.get('content-type') || 'application/json' }), body: Buffer.from(await res.arrayBuffer()) }); } catch (e) { r.abort(); } });
  if (o.routes) for (const [re, fn] of o.routes) await c.route(re, fn);
  const ls = Object.assign({ 'aw-oldui': '0' }, o.newUser ? {} : { 'aw-ob': '1', 'aw-tut': '1', 'sky-setup': '1', 'aw-nearnote2': '1', 'sky-trname': o.name || 'Tyler M.' }, o.ls || {});
  await c.addInitScript(([ls, once]) => { if (once && sessionStorage.getItem('_t')) return; sessionStorage.setItem('_t', '1'); for (const k in ls) localStorage.setItem(k, ls[k]); }, [ls, !!o.newUser]);
  if (o.init) await c.addInitScript(o.init, o.initArg);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(SITE); await p.waitForTimeout(o.wait || 3200);
  if (o.mode === 'off') { await p.evaluate(() => document.querySelector('#awtop [data-m=fsr]').click()); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('.lyrp').forEach(e => e.hidden = true)); }
  p.ctx = c; return p;
}

// anything visible that sits off the 360x640 screen or has its text cut off (scrolling lists are allowed)
function offscreen(p, root) { return p.evaluate(root => { const out = []; const R = root ? document.querySelector(root) : document.body; if (!R) return ['missing ' + root];
  R.querySelectorAll('button,a,b,small,h1,h2,h3,input,label').forEach(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); if (s.visibility === 'hidden' || s.display === 'none' || r.width < 3 || r.height < 3) return; if (e.offsetParent === null && s.position !== 'fixed') return;
    for (let n = e.parentElement; n; n = n.parentElement) { const q = getComputedStyle(n); if (/auto|scroll/.test(q.overflowX) || (/auto|scroll/.test(q.overflowY) && n.scrollHeight > n.clientHeight)) return; }
    if (r.right > innerWidth + 2 || r.left < -2 || r.bottom > innerHeight + 2) out.push((e.innerText || e.className || e.tagName).toString().trim().slice(0, 24)); });
  return out.slice(0, 5); }, root || null); }
const openTab = (p, name) => p.evaluate(n => { const b = [...document.querySelectorAll('#awtabs button')].find(x => x.innerText.trim() === n && getComputedStyle(x).display !== 'none'); if (!b) throw new Error('no tab ' + n); b.click(); }, name);
const shown = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e || e.hidden) return false; const st = getComputedStyle(e); const r = e.getBoundingClientRect(); return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 5 && r.height > 5; }, sel);

// run one named check; ok(cond, why) inside
async function test(name, fn) { const t0 = Date.now(); let fail = null;
  try { await fn((cond, why) => { if (!cond) throw new Error(why || 'check failed'); }); } catch (e) { fail = String(e && e.message || e).split('\n')[0].slice(0, 160); }
  results.push({ name, ok: !fail, why: fail, ms: Date.now() - t0 }); console.log((fail ? 'FAIL ' : 'PASS ') + name + (fail ? '  — ' + fail : '')); }
function summary(label) { const bad = results.filter(r => !r.ok); console.log('\n' + label + ': ' + (results.length - bad.length) + ' passed, ' + bad.length + ' failed');
  bad.forEach(r => console.log('  ✗ ' + r.name + ' — ' + r.why)); return bad.length; }

module.exports = { start, stop, app, offscreen, openTab, shown, test, summary, CORS };
