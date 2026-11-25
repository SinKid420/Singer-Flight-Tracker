// SMOKE TEST: does AwareBC open and do its main screens work? Quick (about 1 minute). Run before every publish.
const K = require('./helpers/kit.cjs');
(async () => { await K.start();
  for (const mode of ['on', 'off']) {
    const p = await K.app({ mode });
    await K.test(`[${mode}] app opens with the new layout, no errors`, async ok => {
      ok(await K.shown(p, '#awtop'), 'search bar missing'); ok(await K.shown(p, '#awtabs'), 'tab bar missing'); ok(await K.shown(p, '#menubtn'), 'Layers button missing');
      ok(!p.errs.length, 'page error: ' + p.errs[0]); });
    await K.test(`[${mode}] map screen fits 360x640`, async ok => { const o = await K.offscreen(p); ok(!o.length, 'off screen: ' + o.join(', ')); });
    const pages = [['Layers', () => p.evaluate(() => document.getElementById('menubtn').click()), '#awlyr .in'],
      ['Alerts', () => K.openTab(p, 'Alerts'), '#hubsheet .sheet'], ['Tools', () => mode === 'off' ? p.evaluate(() => document.querySelector('#awtabs [data-t=tl2]').click()) : K.openTab(p, 'Tools'), '#awtools .in'],
      ['Profile', () => K.openTab(p, 'Profile'), '#awme .in'], ['Search', () => p.evaluate(() => document.querySelector('#awtop .sr').click()), '#srbox']];
    if (mode === 'off') pages.push(['Rig Link', () => K.openTab(p, 'Rig Link'), '#rlx']);
    for (const [name, open, sel] of pages) await K.test(`[${mode}] ${name} opens, fits, closes`, async ok => {
      await open(); await p.waitForTimeout(900); ok(await K.shown(p, sel), name + ' did not open');
      const o = await K.offscreen(p, sel); ok(!o.length, 'off screen: ' + o.join(', '));
      for (let i = 0; i < 3; i++) { await p.keyboard.press('Escape'); await p.waitForTimeout(200); }
      ok(!(await K.shown(p, sel)), name + ' did not close'); ok(!p.errs.length, 'page error: ' + p.errs[0]); });
    await p.ctx.close(); }
  const n = K.summary('SMOKE'); await K.stop(); process.exit(n ? 1 : 0); })();
