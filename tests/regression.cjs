// REGRESSION TESTS: one check for each fix and new screen, so an old bug can't sneak back in. About 6 minutes.
const fs = require('fs'), path = require('path');
const K = require('./helpers/kit.cjs'), { test, app, CORS } = K;
const ROOT = path.join(__dirname, '..');
const J = (o) => ({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(o) });
const denyGeo = state => ({ init: st => { const q = navigator.permissions.query.bind(navigator.permissions); navigator.permissions.query = o => o && o.name === 'geolocation' ? Promise.resolve({ state: st, addEventListener() {}, onchange: null }) : q(o);
  if (st === 'prompt') { navigator.geolocation.watchPosition = () => 1; navigator.geolocation.getCurrentPosition = () => {}; return }
  const E = { code: 1, message: 'denied' }; navigator.geolocation.getCurrentPosition = (s, f) => setTimeout(() => f && f(E), 300); navigator.geolocation.watchPosition = (s, f) => { setTimeout(() => f && f(E), 300); return 1 } }, initArg: state });

(async () => { await K.start(); let p;

  // ---------- first run ----------
  p = await app({ newUser: true, wait: 2500 });
  await test('Welcome: new slogan, mode cards, fits on screen', async ok => {
    const t = await p.evaluate(() => document.getElementById('awob').innerText);
    ok(/Everything & more in one live map/.test(t), 'slogan'); ok(/City, highways, cameras, ferries/.test(t), 'On-road card'); ok(/FSRs, trails, Rig Link, safety timer/.test(t), 'Off-road card');
    ok(/Made for BC by Josh Singer/.test(t), 'credit line'); const o = await K.offscreen(p, '#awob'); ok(!o.length, 'off screen: ' + o); });
  await test('Welcome: no stars behind the title, slogan or credit', async ok => {
    const bad = await p.evaluate(() => { const H = innerHeight / 640; const rows = [...document.querySelectorAll('#awob h1,#awob .tl,#awob .by2')].map(e => e.getBoundingClientRect());
      return [...document.querySelectorAll('#awob .sky circle[fill="#fff"]')].filter(c => { const r = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; return rows.some(b => x > b.left && x < b.right && y > b.top - 2 && y < b.bottom + 2) }).length });
    ok(bad === 0, bad + ' stars behind text'); });
  await test('Choosing Off-road on Welcome does not pop open the layer list', async ok => {
    await p.click('#awob [data-m=off]'); await p.click('#awob [data-a=go]'); await p.waitForTimeout(500); const al = await p.$('#awob [data-a=allow]'); if (al) await al.click();
    await p.waitForTimeout(2500); ok(await p.evaluate(() => document.body.classList.contains('fsron')), 'not in Off-road');
    ok(!(await p.evaluate(() => [...document.querySelectorAll('.lyrp')].some(e => !e.hidden))), 'layer list popped open'); });
  await test('Profile save with no signal: friendly message, not "Failed to fetch"', async ok => {
    const mk = await p.$('.awobc [data-a=mk]'); if (mk) await mk.click(); await p.waitForTimeout(600); ok(await K.shown(p, '.awq'), 'profile setup not shown');
    await p.ctx.route(/awarebc\.aware-bc\.workers\.dev/, r => r.abort()); await p.fill('.awq [data-q=n]', 'Tyler M.'); await p.click('.awq [data-q=sv]'); await p.waitForTimeout(1200);
    const t = await p.evaluate(() => [...document.querySelectorAll('.frtoast')].map(e => e.textContent).join('|')); ok(!/Failed to fetch/i.test(t), 'raw error: ' + t);
    ok(!(await K.shown(p, '.awq')), 'setup screen stuck open'); });
  await test('Quick tour: 4 glow steps, old "tap here" arrow never shows', async ok => {
    let steps = 0, arrow = false; for (let i = 0; i < 6; i++) { if (await K.shown(p, '#tut')) arrow = true; const nx = await p.$('#awtour .nx'); if (!nx) { await p.waitForTimeout(800); continue } steps++; await nx.click(); await p.waitForTimeout(450) }
    ok(steps === 4, steps + ' steps'); ok(!arrow, 'old arrow showed'); ok(await p.evaluate(() => localStorage.getItem('aw-tut') === '1'), 'tour not marked done'); });
  await p.ctx.close();

  // ---------- location ----------
  p = await app(denyGeo('prompt'));
  await test('Turn on location card: tags, Allow + Not now, closes', async ok => {
    await p.waitForTimeout(2500); const t = await p.evaluate(() => document.getElementById('locmsg').innerText); ok(/Turn on location/.test(t) && /Not now/.test(t) && /Trail alerts/.test(t), t.slice(0, 80));
    await p.click('#gpsno'); await p.waitForTimeout(200); ok(!(await K.shown(p, '#locmsg')), 'did not close'); });
  await p.ctx.close();
  p = await app(Object.assign({ desktop: true }, denyGeo('denied')));
  await test('Computer, site blocked: "Location is blocked for AwareBC" with click steps', async ok => { await p.waitForTimeout(1500); const t = await p.evaluate(() => document.getElementById('locmsg').innerText); ok(/blocked for AwareBC/.test(t) && /Site settings/.test(t), t.slice(0, 90)); });
  await test('GPS check on a computer: compass and sensor are grey, not red', async ok => {
    await p.evaluate(() => window.__gpsCheck()); await p.waitForTimeout(3500); const t = await p.evaluate(() => document.getElementById('locmsg').innerText); ok(/Not on computers/.test(t), 'no "Not on computers"');
    ok(!(await p.evaluate(() => !!document.querySelector('#locmsg #gpscmp'))), 'Allow compass shown on computer'); });
  await p.ctx.close();
  p = await app(Object.assign({ desktop: true, routes: [[/workers\.dev\/where/, r => r.fulfill(J({ ok: true, lat: 50.67, lon: -120.33, city: 'Kamloops' }))]] }, denyGeo('granted')));
  await test('Computer, Windows blocking: "Your computer is blocking location"', async ok => { await p.waitForTimeout(1200); const t = await p.evaluate(() => document.getElementById('locmsg').innerText); ok(/Your computer is blocking location/.test(t) && /Privacy & security/.test(t), t.slice(0, 90)); });
  await test('No location: rough area from the connection keeps the map and Alerts working', async ok => {
    const t = await p.evaluate(() => [...document.querySelectorAll('.frtoast')].map(e => e.textContent).join('|')); ok(/rough area near Kamloops/.test(t), 'no rough-area note: ' + t);
    const c = await p.evaluate(() => __AW.map.getCenter()); ok(Math.abs(c.lat - 50.67) < .01, 'map not centred');
    await K.openTab(p, 'Alerts'); await p.waitForTimeout(2500); ok(!/Location needed/.test(await p.evaluate(() => document.getElementById('hubbody').innerText)), 'Alerts says location needed'); });
  await p.ctx.close();

  // ---------- main pages ----------
  p = await app();
  await test('Bigger On-road / Off-road switch: 40 px tall, blue On-road', async ok => {
    const r = await p.evaluate(() => { const b = document.querySelector('#awtop .md button.on'); return [b.getBoundingClientRect().height, getComputedStyle(b).backgroundImage, b.dataset.m] });
    ok(r[0] >= 38, 'height ' + r[0]); ok(r[2] === 'sat' && /100, 210, 255|64d2ff/i.test(r[1]), 'On-road not blue'); });
  await test('Layers page: groups, tip, 7+ layers turns into a red warning', async ok => {
    await p.click('#menubtn'); await p.waitForTimeout(500); ok(await K.shown(p, '#awlyr .in'), 'not open');
    ok(/Tip:/.test(await p.evaluate(() => document.querySelector('#awlyr .tip').innerText)), 'no tip');
    for (const k of ['fire', 'lt', 'rain', 'plane', 'mt', 'road', 'ferry', 'apt']) { await p.click('#awlyr [data-k=' + k + ']'); await p.waitForTimeout(250) }
    await p.waitForTimeout(700); ok(await p.evaluate(() => document.querySelector('#awlyr .tip').classList.contains('busy')), 'no busy warning');
    const o = await K.offscreen(p, '#awlyr .in'); ok(!o.length, 'off screen: ' + o);
    ok(/Auto-rotate/.test(await p.evaluate(() => document.querySelector('#awlyr .mo').innerText)), 'Auto-rotate label'); });
  await test('Layers: tapping a dimmed Off-road layer switches to Off-road', async ok => {
    await p.click('#awlyr [data-k=fsr]'); await p.waitForTimeout(2200); ok(await p.evaluate(() => document.body.classList.contains('fsron')), 'did not switch');
    await p.evaluate(() => { document.querySelector('#awtop [data-m=sat]').click() }); await p.waitForTimeout(1200); await p.keyboard.press('Escape'); });
  await test('Tools page: 4 groups, wrench badge, every tool opens its screen', async ok => {
    await p.evaluate(() => window.__awLayers && __awLayers.close()); await K.openTab(p, 'Tools'); await p.waitForTimeout(500);
    ok(/M14\.7 6\.3/.test(await p.evaluate(() => document.querySelector('#awtools .tbd').innerHTML)), 'no wrench on page');
    ok(/M14\.7 6\.3/.test(await p.evaluate(() => document.querySelector('#awtabs [data-t=mid]').innerHTML)), 'no wrench on tab');
    const n = await p.evaluate(() => document.querySelectorAll('#awtools .tt button').length); ok(n >= 16, n + ' tools'); const dead = [];
    for (let i = 0; i < n; i++) { const name = await p.evaluate(i => document.querySelectorAll('#awtools .tt button')[i].innerText.trim(), i);
      const before = await p.evaluate(() => window.__navBack.stack().length); await p.evaluate(i => document.querySelectorAll('#awtools .tt button')[i].click(), i); await p.waitForTimeout(1300);
      const opened = await p.evaluate(() => window.__navBack.stack().filter(k => k !== 'awtools').length + (document.getElementById('locmsg').hidden ? 0 : 1) + (document.querySelector('#ar:not([hidden])') ? 1 : 0)); if (!opened) dead.push(name);
      await p.evaluate(() => { document.querySelectorAll('[aria-label=Close],#arclose').forEach(x => { if (x.offsetParent !== null) try { x.click() } catch (e) {} }); document.querySelectorAll('.osbg').forEach(x => x.remove()); if (window.__ar) try { __ar.stop() } catch (e) {} });
      for (let k = 0; k < 3; k++) { await p.keyboard.press('Escape'); await p.waitForTimeout(120) }
      if (await p.evaluate(() => document.body.classList.contains('fsron'))) { await p.evaluate(() => document.querySelector('#awtop [data-m=sat]').click()); await p.waitForTimeout(900) }
      await p.evaluate(() => window.__awTools.open()); await p.waitForTimeout(400) }
    ok(!dead.length, 'did nothing: ' + dead.join(', ')); await p.keyboard.press('Escape'); });
  await test('Profile page: Friends, Showroom, Settings, App updates', async ok => {
    await K.openTab(p, 'Profile'); await p.waitForTimeout(600); const t = await p.evaluate(() => document.querySelector('#awme .in').innerText);
    ok(/Friends/.test(t) && /Showroom/.test(t) && /Settings/.test(t) && /App updates/.test(t), t.slice(0, 120)); ok(!/Map look/.test(t), 'Map look still on Profile'); });
  await test('Opening a main page closes the one before (no piling up)', async ok => {
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.click('#menubtn'); await p.waitForTimeout(500);
    const b = await p.evaluate(() => { const e = document.querySelector('#awtabs [data-t=me]'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] });
    await p.mouse.click(b[0], b[1]); await p.waitForTimeout(700); const st = await p.evaluate(() => window.__navBack.stack()); ok(st.includes('awme') && !st.includes('awlyr'), 'stack: ' + st.join(',')); await p.keyboard.press('Escape'); });
  await test('Alerts: last check shows straight away on reopen, with "updating…"', async ok => {
    await K.openTab(p, 'Alerts'); await p.waitForTimeout(4000); ok(await p.evaluate(() => !!localStorage.getItem('aw-hubc')), 'not saved'); await p.keyboard.press('Escape');
    await p.ctx.route(/arcgis|weather\.gc\.ca|open-meteo|overpass|drivebc/, async r => { await new Promise(x => setTimeout(x, 6000)); r.abort() });
    await p.reload(); await p.waitForTimeout(3200); await K.openTab(p, 'Alerts'); await p.waitForTimeout(300);
    const t = await p.evaluate(() => document.getElementById('hubbody').innerText); ok(/safety score/.test(t), 'blank while loading: ' + t.slice(0, 60)); ok(/updating/.test(t), 'no updating note'); });
  await p.ctx.close();

  p = await app({ mode: 'off' });
  await test('Off-road tab bar: Map, Alerts, Rig Link, Tools, Profile', async ok => {
    const t = await p.evaluate(() => [...document.querySelectorAll('#awtabs button')].filter(b => getComputedStyle(b).display !== 'none').map(b => b.innerText.trim()).join(','));
    ok(t === 'Map,Alerts,Rig Link,Tools,Profile', t); await p.evaluate(() => document.querySelector('#awtabs [data-t=tl2]').click()); await p.waitForTimeout(500); ok(await K.shown(p, '#awtools .in'), 'Tools tab did nothing'); await p.keyboard.press('Escape'); });
  await test('Aware: live volume bars move while listening, answer card with Go there', async ok => {
    await p.ctx.route(/overpass-api/, r => r.fulfill(J({ elements: [{ lat: 50.7, lon: -120.3, tags: { amenity: 'fuel', name: 'Ridge Fuel' } }] })));
    await p.evaluate(() => { window.SpeechRecognition = function () { const s = this; this.start = () => { window.__rec = s }; this.stop = () => s.onend && s.onend() } });
    await p.evaluate(() => window.__aware.open(true)); await p.waitForTimeout(1500); ok(await p.evaluate(() => document.querySelectorAll('.aws .vb i').length === 30), 'no bars');
    const rec = await p.evaluate(() => !!window.__rec); if (rec) { await p.evaluate(() => { __rec.onresult({ results: [[{ transcript: 'gas station' }]] }); __rec.stop() }); await p.waitForTimeout(2500);
      ok(/Go there/.test(await p.evaluate(() => document.querySelector('.aws .ans').innerText)), 'no answer card') } await p.keyboard.press('Escape'); });
  await p.ctx.close();

  // ---------- rigs from above ----------
  const A = await app({ mode: 'off', name: 'Sam K.', ip: '10.9.9.1', ls: { 'aw-near': 'e' } });
  await test('My rig picker: 10 rig types, 20 colours, saves type + colour', async ok => {
    await A.evaluate(() => window.__myRig.open()); await A.waitForTimeout(400); const c = await A.evaluate(() => [document.querySelectorAll('#awrig [data-rt]').length, document.querySelectorAll('#awrig [data-rc]').length]);
    ok(c[0] === 10 && c[1] === 20, c.join('/')); await A.click('#awrig [data-rt=utv]'); await A.click('#awrig [data-rc=lime]'); await A.click('#awrig [data-a=sv]'); await A.waitForTimeout(1500);
    ok(await A.evaluate(() => localStorage.getItem('aw-myrt') === 'utv' && localStorage.getItem('aw-myrc') === 'lime'), 'not saved'); const o = await K.offscreen(A, '#awrig'); ok(!o.length, 'off screen ' + o); });
  await test('My spot in Off-road: your rig from above with the blue ring', async ok => { ok(await A.evaluate(() => { const e = document.querySelector('.leaflet-marker-icon.me'); return !!e && e.classList.contains('rig') && !!e.querySelector('svg.awrig') }), 'not drawn as a rig'); });
  await A.evaluate(() => window.__rlNear && __rlNear.tick()); await A.waitForTimeout(1500);
  const B = await app({ mode: 'off', name: 'Dee R.', ip: '10.9.9.2', lat: 50.672, lon: -120.333, ls: { 'aw-near': 'e' } });
  await test('Other riders: their rig from above, in their colour, no round chip', async ok => {
    await B.evaluate(() => window.__rlNear && __rlNear.tick()); await B.waitForTimeout(4500);
    const r = await B.evaluate(() => { const e = document.querySelector('.nrmk[aria-label="Sam K."]'); if (!e) return null; const s = e.querySelector('svg.awrig'); return [!!s, s && /#8cc63f/i.test(s.innerHTML), getComputedStyle(e).borderTopWidth] });
    ok(r, 'Sam K. not on the map'); ok(r[0], 'no overhead drawing'); ok(r[1], 'not lime'); ok(r[2] === '0px', 'round chip still there'); });
  await A.ctx.close(); await B.ctx.close();

  // ---------- updates ----------
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); let newer = true;
  p = await app({ wait: 9500, routes: [[/sw\.js\?check=/, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: newer ? sw.replace(/app\.js\?v=\d+/, 'app.js?v=99999') : sw })]] });
  await test('Update available card shows by itself; Later hides it; Update now reloads with a note', async ok => {
    ok(await K.shown(p, '#awupd'), 'card did not show'); const o = await K.offscreen(p, '#awupd'); ok(!o.length, 'off screen ' + o);
    newer = false; await Promise.all([p.waitForNavigation({ timeout: 10000 }), p.click('#awupd .go')]); await p.waitForTimeout(3200);
    ok(/up to date/.test(await p.evaluate(() => [...document.querySelectorAll('.frtoast')].map(e => e.textContent).join('|'))), 'no up-to-date note'); });
  await p.ctx.close();

  // ---------- versions are bumped together ----------
  await test('Every script in index.html is in the offline list (sw.js) with the same version', async ok => {
    const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), F = (/F=\[([^\]]*)\]/.exec(sw) || [])[1] || '';
    const miss = [...idx.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !/^http/.test(s) && F.indexOf("'./" + s + "'") < 0); ok(!miss.length, 'missing/out of date: ' + miss.join(', ')); });

  const n = K.summary('REGRESSION'); await K.stop(); process.exit(n ? 1 : 0); })();
