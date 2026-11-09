// AwareBC app builder (by Josh Singer). GitHub runs this to turn the website into the Android app.
//   node app/prep.mjs web      -> app/build: package.json, capacitor.config.json, www/ (the website, made to work offline)
//   node app/prep.mjs android  -> after "npx cap add android": icons, notification icon, version number
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const B = path.join(ROOT, 'app', 'build'), W = path.join(B, 'www');
const step = process.argv[2] || 'web';
const run = +(process.env.GITHUB_RUN_NUMBER || 1);

function R(s, a, b, file) { const c = s.split(a).length - 1; if (c !== 1) throw new Error(file + ': expected 1 match, found ' + c + ' for: ' + a.slice(0, 80)); return s.split(a).join(b); }
async function get(url, to) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url); if (!r.ok) throw new Error(r.status + ' ' + url); fs.writeFileSync(to, Buffer.from(await r.arrayBuffer())); return; }
    catch (e) { if (i === 3) throw e; await new Promise(z => setTimeout(z, 1500 * (i + 1))); }
  }
}

if (step === 'web') {
  fs.rmSync(B, { recursive: true, force: true }); fs.mkdirSync(path.join(W, 'lib', 'images'), { recursive: true });
  fs.writeFileSync(path.join(B, 'package.json'), JSON.stringify({
    name: 'awarebc', version: '1.0.' + run, private: true, author: 'Josh Singer',
    dependencies: {
      '@capacitor/core': '^8.6.0', '@capacitor/cli': '^8.6.0', '@capacitor/android': '^8.6.0', '@capacitor/app': '^8.1.2',
      '@capacitor/local-notifications': '^8.3.1', '@capacitor-community/background-geolocation': '^1.3.1'
    }
  }, null, 2));
  fs.writeFileSync(path.join(B, 'capacitor.config.json'), JSON.stringify({
    appId: 'com.awarebc.app', appName: 'AwareBC', webDir: 'www',
    // the app runs as sinkid420.github.io so the reports server and flight relay accept it
    server: { hostname: 'sinkid420.github.io', androidScheme: 'https' },
    android: { useLegacyBridge: true, backgroundColor: '#161618' },
    plugins: { LocalNotifications: { smallIcon: 'ic_tracking', iconColor: '#ff3b30' } }
  }, null, 2));

  // the website files
  for (const f of fs.readdirSync(ROOT)) {
    if (/\.(html|js|json|webmanifest|png|svg)$/.test(f) && !/^sky-overhead-personal/.test(f) && f !== 'sw.js') fs.copyFileSync(path.join(ROOT, f), path.join(W, f));
  }
  // map libraries saved inside the app so it opens with no signal
  const LF = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/', LR = 'https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate.js';
  await get(LF + 'leaflet.min.js', path.join(W, 'lib', 'leaflet.min.js'));
  await get(LF + 'leaflet.min.css', path.join(W, 'lib', 'leaflet.min.css'));
  for (const i of ['layers.png', 'layers-2x.png', 'marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png']) await get(LF + 'images/' + i, path.join(W, 'lib', 'images', i));
  await get(LR, path.join(W, 'lib', 'leaflet-rotate.js'));
  fs.copyFileSync(path.join(ROOT, 'app', 'native.js'), path.join(W, 'native.js'));

  let h = fs.readFileSync(path.join(W, 'index.html'), 'utf8');
  // the saved libraries must match the website's integrity hashes exactly
  const { createHash } = await import('node:crypto');
  for (const [u, f] of [[LF + 'leaflet.min.css', 'leaflet.min.css'], [LF + 'leaflet.min.js', 'leaflet.min.js'], [LR, 'leaflet-rotate.js']]) {
    const m = new RegExp('"' + u.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '"[^>]*integrity="(sha384-[^"]+)"').exec(h);
    const got = 'sha384-' + createHash('sha384').update(fs.readFileSync(path.join(W, 'lib', f))).digest('base64');
    if (m && m[1] !== got && !process.env.PREP_TEST) throw new Error(f + ': integrity mismatch');
  }
  h = R(h, '"' + LF + 'leaflet.min.css"', '"lib/leaflet.min.css"', 'index.html');
  h = R(h, '"' + LF + 'leaflet.min.js"', '"lib/leaflet.min.js"', 'index.html');
  h = R(h, '"' + LR + '"', '"lib/leaflet-rotate.js"', 'index.html');
  h = h.replace(/(<script src="lib\/leaflet-rotate\.js"[^>]*><\/script>)/, '$1\n<script src="lib/capacitor.js"></script>\n<script src="native.js"></script>');
  if (!h.includes('<script src="native.js">')) throw new Error('index.html: could not add native.js');
  // the app stores its own files, so no website service worker
  h = R(h, "'serviceWorker' in navigator && location.protocol==='https:'", "!window.Capacitor && 'serviceWorker' in navigator && location.protocol==='https:'", 'index.html');
  fs.writeFileSync(path.join(W, 'index.html'), h);

  // danger alerts keep running with the screen off
  let r = fs.readFileSync(path.join(W, 'reports.js'), 'utf8');
  r = R(r, "if(document.hidden&&wId!=null){", "if(document.hidden&&wId!=null&&!window.Capacitor){", 'reports.js');
  fs.writeFileSync(path.join(W, 'reports.js'), r);
  console.log('web ready:', fs.readdirSync(W).join(' '));
}

if (step === 'android') {
  const A = path.join(B, 'android', 'app');
  // Capacitor's own script, loaded by the page (no bundler)
  const core = path.join(B, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
  fs.copyFileSync(core, path.join(W, 'lib', 'capacitor.js'));
  // version number goes up with every build so updates install over the old one
  const g = path.join(A, 'build.gradle'); let s = fs.readFileSync(g, 'utf8');
  s = s.replace(/versionCode \d+/, 'versionCode ' + run).replace(/versionName "[^"]*"/, 'versionName "1.0.' + run + '"');
  if (!s.includes('versionCode ' + run)) throw new Error('build.gradle: version not set');
  fs.writeFileSync(g, s);
  // small white icon for the GPS and alert notifications
  const d = path.join(A, 'src', 'main', 'res', 'drawable'); fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'ic_tracking.xml'), '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFFFF" android:pathData="M12,2L4.5,20.3L5.2,21L12,18L18.8,21L19.5,20.3Z"/></vector>\n');
  const sx = path.join(A, 'src', 'main', 'res', 'values', 'strings.xml'); let t = fs.readFileSync(sx, 'utf8');
  t = R(t, '</resources>', '    <string name="capacitor_background_geolocation_notification_channel_name">Trail alerts GPS</string>\n    <string name="capacitor_background_geolocation_notification_icon">drawable/ic_tracking</string>\n    <string name="capacitor_background_geolocation_notification_color">#ff3b30</string>\n</resources>', 'strings.xml');
  fs.writeFileSync(sx, t);
  // app icon source for @capacitor/assets
  fs.mkdirSync(path.join(B, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'awarebc-maskable.png'), path.join(B, 'assets', 'icon-only.png'));
  console.log('android ready, build', run);
}
