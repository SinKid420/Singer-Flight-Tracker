// AwareBC app builder (by Josh Singer). GitHub runs this to turn the website into the Android app.
//   node app/prep.mjs web      -> app/build: package.json, capacitor.config.json, www/ (the website, made to work offline)
//   node app/prep.mjs android  -> after "npx cap add android": icons, notification icon, version number
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const B = path.join(ROOT, 'app', 'build'), W = path.join(B, 'www');
const step = process.argv[2] || 'web';
const run = +(process.env.GITHUB_RUN_NUMBER || 1);
// raise NATIVE when the app's phone parts change (plugins, Capacitor version). Live updates only go to apps with the same or newer NATIVE.
const NATIVE = 1;

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
      '@capacitor/core': '8.6.0', '@capacitor/cli': '8.6.0', '@capacitor/android': '8.6.0', '@capacitor/app': '8.1.2', '@capacitor/filesystem': '8.1.5',
      '@capacitor/local-notifications': '8.3.1', '@capacitor-community/background-geolocation': '1.3.1', '@capacitor/geolocation': '8.0.0', 'sharp': '^0.34.0'
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
    if (/\.(html|js|json|webmanifest|png|svg)$/.test(f) && !/^(sky-overhead-personal|logo-)/.test(f) && f !== 'sw.js' && f !== 'icon.svg') fs.copyFileSync(path.join(ROOT, f), path.join(W, f));
  }
  // map libraries saved inside the app so it opens with no signal
  const LF = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/', LR = 'https://cdn.jsdelivr.net/npm/leaflet-rotate@0.2.8/dist/leaflet-rotate.js';
  await get(LF + 'leaflet.min.js', path.join(W, 'lib', 'leaflet.min.js'));
  await get(LF + 'leaflet.min.css', path.join(W, 'lib', 'leaflet.min.css'));
  for (const i of ['layers.png', 'layers-2x.png', 'marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png']) await get(LF + 'images/' + i, path.join(W, 'lib', 'images', i));
  await get(LR, path.join(W, 'lib', 'leaflet-rotate.js'));
  const MLJ = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js', PMJ = 'https://cdn.jsdelivr.net/npm/pmtiles@3.2.1/dist/pmtiles.js';
  await get(MLJ, path.join(W, 'lib', 'maplibre-gl.js'));
  await get(PMJ, path.join(W, 'lib', 'pmtiles.js'));
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
  h = R(h, '"' + MLJ + '"', '"lib/maplibre-gl.js"', 'index.html');
  h = R(h, '"' + PMJ + '"', '"lib/pmtiles.js"', 'index.html');
  h = h.replace(/(<script src="lib\/leaflet-rotate\.js"[^>]*><\/script>)/, '$1\n<script src="lib/capacitor.js"></script>\n<script src="native.js"></script>');
  if (!h.includes('<script src="native.js">')) throw new Error('index.html: could not add native.js');
  // the app stores its own files, so no website service worker
  // the Capacitor bridge adds a small script of its own to the page, so the app's copy allows that
  h = R(h, "script-src 'self' https://cdnjs.cloudflare.com", "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com", 'index.html');
  fs.writeFileSync(path.join(W, 'index.html'), h);
  let aj = fs.readFileSync(path.join(W, 'app.js'), 'utf8');
  aj = R(aj, "'serviceWorker' in navigator && location.protocol==='https:'", "!window.Capacitor && 'serviceWorker' in navigator && location.protocol==='https:'", 'app.js');
  fs.writeFileSync(path.join(W, 'app.js'), aj);

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
  // live update list: every app file and its fingerprint (the app checks this to update itself)
  const { createHash } = await import('node:crypto'), files = {};
  (function walk(d, pre) { for (const n of fs.readdirSync(d).sort()) { const fp = path.join(d, n); if (fs.statSync(fp).isDirectory()) walk(fp, pre + n + '/'); else if (pre + n !== 'app-version.json') files[pre + n] = createHash('sha256').update(fs.readFileSync(fp)).digest('hex'); } })(W, '');
  const id = createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 12);
  fs.writeFileSync(path.join(W, 'app-version.json'), JSON.stringify({ id, n: run, native: NATIVE, files }));
  // version number goes up with every build so updates install over the old one
  const g = path.join(A, 'build.gradle'); let s = fs.readFileSync(g, 'utf8');
  s = s.replace(/versionCode \d+/, 'versionCode ' + run).replace(/versionName "[^"]*"/, 'versionName "1.' + NATIVE + '.' + run + '"');
  if (!s.includes('versionCode ' + run)) throw new Error('build.gradle: version not set');
  fs.writeFileSync(g, s);
  // the app reopens its screen instead of closing if the map's drawing process runs out of memory
  const ma = path.join(A, 'src', 'main', 'java', 'com', 'awarebc', 'app', 'MainActivity.java');
  if (!fs.existsSync(ma)) throw new Error('MainActivity.java not found');
  fs.writeFileSync(ma, "package com.awarebc.app;\n\nimport android.app.ActivityManager;\nimport android.content.Context;\nimport android.os.Bundle;\nimport android.webkit.RenderProcessGoneDetail;\nimport android.webkit.WebView;\nimport com.getcapacitor.BridgeActivity;\nimport com.getcapacitor.WebViewListener;\nimport java.io.PrintWriter;\nimport java.io.StringWriter;\n\n// AwareBC (by Josh Singer). If the map's drawing process runs out of memory, Android would close the whole app.\n// Instead the app reopens its screen straight away, and writes a crash note (Settings > Crash reports).\npublic class MainActivity extends BridgeActivity {\n    private String mem() {\n        try { ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE); ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo(); am.getMemoryInfo(mi);\n            return \"free RAM \" + (mi.availMem / 1048576) + \" of \" + (mi.totalMem / 1048576) + \" MB\" + (mi.lowMemory ? \" (low)\" : \"\"); } catch (Exception e) { return \"\"; }\n    }\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        registerPlugin(CrashPlugin.class);\n        registerPlugin(SpeakPlugin.class);\n        final Thread.UncaughtExceptionHandler def = Thread.getDefaultUncaughtExceptionHandler();\n        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {\n            try { StringWriter w = new StringWriter(); e.printStackTrace(new PrintWriter(w)); String s = w.toString(); CrashPlugin.add(getApplicationContext(), \"app\", (s.length() > 1400 ? s.substring(0, 1400) : s) + \" | \" + mem()); } catch (Exception x) { }\n            if (def != null) def.uncaughtException(t, e);\n        });\n        super.onCreate(savedInstanceState);\n        if (bridge != null) bridge.addWebViewListener(new WebViewListener() {\n            @Override\n            public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {\n                try { CrashPlugin.add(getApplicationContext(), detail.didCrash() ? \"map-crash\" : \"map-memory\", \"WebView render process gone \u00b7 priority \" + detail.rendererPriorityAtExit() + \" \u00b7 \" + mem()); } catch (Exception e) { }\n                try { runOnUiThread(() -> recreate()); } catch (Exception e) { }\n                return true;\n            }\n        });\n    }\n}\n");
  fs.writeFileSync(path.join(path.dirname(ma), 'SpeakPlugin.java'), "package com.awarebc.app;\n\nimport android.speech.tts.TextToSpeech;\nimport com.getcapacitor.Plugin;\nimport com.getcapacitor.PluginCall;\nimport com.getcapacitor.PluginMethod;\nimport com.getcapacitor.annotation.CapacitorPlugin;\nimport java.util.Locale;\n\n// AwareBC spoken directions: the phone's own voice (works with no signal).\n@CapacitorPlugin(name = \"AWSpeak\")\npublic class SpeakPlugin extends Plugin {\n    private TextToSpeech tts; private boolean ready = false; private String pending = null;\n    @Override\n    public void load() {\n        tts = new TextToSpeech(getContext(), status -> {\n            ready = status == TextToSpeech.SUCCESS;\n            if (ready) { try { tts.setLanguage(Locale.CANADA); } catch (Exception e) { } if (pending != null) { tts.speak(pending, TextToSpeech.QUEUE_FLUSH, null, \"aw\"); pending = null; } }\n        });\n    }\n    @PluginMethod\n    public void speak(PluginCall call) { String t = call.getString(\"text\", \"\"); if (ready) tts.speak(t, TextToSpeech.QUEUE_FLUSH, null, \"aw\"); else pending = t; call.resolve(); }\n    @PluginMethod\n    public void stop(PluginCall call) { if (tts != null) tts.stop(); call.resolve(); }\n    @Override\n    protected void handleOnDestroy() { if (tts != null) tts.shutdown(); }\n}\n");
  // spoken directions need to find the phone's voice engine (Android 11+)
  { const mf = path.join(A, 'src', 'main', 'AndroidManifest.xml'); let m = fs.readFileSync(mf, 'utf8'); if (!/TTS_SERVICE/.test(m)) m = R(m, '</manifest>', '    <queries><intent><action android:name="android.intent.action.TTS_SERVICE" /></intent></queries>\n</manifest>', 'AndroidManifest.xml'); fs.writeFileSync(mf, m); }
  fs.writeFileSync(path.join(path.dirname(ma), 'CrashPlugin.java'), "package com.awarebc.app;\n\nimport android.content.Context;\nimport android.content.SharedPreferences;\nimport android.os.Build;\nimport com.getcapacitor.JSObject;\nimport com.getcapacitor.Plugin;\nimport com.getcapacitor.PluginCall;\nimport com.getcapacitor.PluginMethod;\nimport com.getcapacitor.annotation.CapacitorPlugin;\n\n// AwareBC crash notes kept on the phone; the app shows them in Settings > Crash reports.\n@CapacitorPlugin(name = \"AWCrash\")\npublic class CrashPlugin extends Plugin {\n    static SharedPreferences sp(Context c) { return c.getSharedPreferences(\"awcrash\", Context.MODE_PRIVATE); }\n    static void add(Context c, String kind, String info) {\n        try { SharedPreferences p = sp(c); String e = System.currentTimeMillis() + \"\\t\" + kind + \"\\t\" + info.replace(\"\\n\", \"\\\\n\").replace(\"\\t\", \" \");\n            String all = e + \"\\n\" + p.getString(\"log\", \"\"); if (all.length() > 20000) all = all.substring(0, 20000); p.edit().putString(\"log\", all).commit(); } catch (Exception x) { }\n    }\n    @PluginMethod\n    public void getLog(PluginCall call) { JSObject r = new JSObject(); r.put(\"log\", sp(getContext()).getString(\"log\", \"\")); r.put(\"device\", Build.MANUFACTURER + \" \" + Build.MODEL + \" / Android \" + Build.VERSION.RELEASE); call.resolve(r); }\n    @PluginMethod\n    public void clear(PluginCall call) { sp(getContext()).edit().remove(\"log\").apply(); call.resolve(); }\n}\n");
  // small white icon for the GPS and alert notifications
  const d = path.join(A, 'src', 'main', 'res', 'drawable'); fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'ic_tracking.xml'), '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFFFF" android:pathData="M12,2L4.5,20.3L5.2,21L12,18L18.8,21L19.5,20.3Z"/></vector>\n');
  const sx = path.join(A, 'src', 'main', 'res', 'values', 'strings.xml'); let t = fs.readFileSync(sx, 'utf8');
  t = R(t, '</resources>', '    <string name="capacitor_background_geolocation_notification_channel_name">Trail alerts GPS</string>\n    <string name="capacitor_background_geolocation_notification_icon">drawable/ic_tracking</string>\n    <string name="capacitor_background_geolocation_notification_color">#ff3b30</string>\n</resources>', 'strings.xml');
  fs.writeFileSync(sx, t);
  // AwareBC app icon and start screen (replaces Capacitor's own)
  const { createRequire } = await import('node:module');
  const sharp = createRequire(path.join(B, 'package.json'))('sharp');
  const ICON = path.join(ROOT, 'awarebc-maskable.png'), BGC = '#161618', res = path.join(A, 'src', 'main', 'res');
  const D = { mdpi: [48, 108], hdpi: [72, 162], xhdpi: [96, 216], xxhdpi: [144, 324], xxxhdpi: [192, 432] };
  for (const [k, [s, f]] of Object.entries(D)) {
    const dir = path.join(res, 'mipmap-' + k); fs.mkdirSync(dir, { recursive: true });
    await sharp(ICON).resize(s, s).png().toFile(path.join(dir, 'ic_launcher.png'));
    const circle = Buffer.from(`<svg width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/></svg>`);
    await sharp(ICON).resize(s, s).composite([{ input: circle, blend: 'dest-in' }]).png().toFile(path.join(dir, 'ic_launcher_round.png'));
    const inner = Math.round(f * 80 / 108);
    await sharp({ create: { width: f, height: f, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: await sharp(ICON).resize(inner, inner).png().toBuffer(), gravity: 'center' }]).png().toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }
  const ad = path.join(res, 'mipmap-anydpi-v26'); fs.mkdirSync(ad, { recursive: true });
  const xml = '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n';
  fs.writeFileSync(path.join(ad, 'ic_launcher.xml'), xml); fs.writeFileSync(path.join(ad, 'ic_launcher_round.xml'), xml);
  fs.writeFileSync(path.join(res, 'values', 'ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">' + BGC + '</color>\n</resources>\n');
  let sp = 0;
  for (const dn of fs.readdirSync(res).filter(n => n.startsWith('drawable'))) {
    const fp = path.join(res, dn, 'splash.png'); if (!fs.existsSync(fp)) continue;
    const m = await sharp(fp).metadata(), w = m.width, h = m.height, ic = Math.round(Math.min(w, h) * 0.38);
    const buf = await sharp({ create: { width: w, height: h, channels: 4, background: BGC } })
      .composite([{ input: await sharp(ICON).resize(ic, ic).png().toBuffer(), gravity: 'center' }]).png().toBuffer();
    fs.writeFileSync(fp, buf); sp++;
  }
  console.log('android ready, build', run, '· live id', id, '· files', Object.keys(files).length, '· splash screens:', sp);
}
