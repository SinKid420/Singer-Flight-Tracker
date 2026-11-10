// AwareBC native layer (by Josh Singer). Runs only inside the Android / Apple app, never on the website.
// - GPS keeps running with the screen off (background location), so danger alerts and "My path in" never stop.
// - Danger alerts become real phone notifications when the app is in the background.
// - The saved offline area (BC road map + FSR roads) is used straight from phone storage.
(function () {
  var X = window.capacitorExports, C = window.Capacitor;
  if (!X || !C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var reg = X.registerPlugin, BG = reg('BackgroundGeolocation'), LN = reg('LocalNotifications'), APP = reg('App');
  var OFF = 'awarebc-off-1', bg = false;
  window.__native = { bg: function () { return bg || document.hidden } };

  // ---------- app in background? ----------
  try { APP.addListener('appStateChange', function (s) { bg = !s.isActive }) } catch (e) {}

  // ---------- GPS: one background watcher shared by every part of the app ----------
  var G = navigator.geolocation, subs = {}, n = 0, wid = null, starting = false, last = null;
  function pos(l) { return { coords: { latitude: l.latitude, longitude: l.longitude, accuracy: l.accuracy, altitude: l.altitude, altitudeAccuracy: l.altitudeAccuracy, heading: l.bearing, speed: l.speed }, timestamp: l.time || Date.now() } }
  function each(i, v) { Object.keys(subs).forEach(function (k) { var f = subs[k] && subs[k][i]; if (f) try { f(v) } catch (e) {} }) }
  function start() {
    if (wid != null || starting) return; starting = true;
    BG.addWatcher({ backgroundTitle: 'AwareBC is watching the trail ahead', backgroundMessage: 'Danger alerts stay on while you ride. Turn GPS off in AwareBC to stop.', requestPermissions: true, stale: false, distanceFilter: 10 },
      function (l, e) {
        if (e) { each(1, { code: e.code === 'NOT_AUTHORIZED' ? 1 : 2, message: e.message || '' }); return }
        if (l) { last = pos(l); each(0, last) }
      }).then(function (id) { starting = false; wid = id; if (!Object.keys(subs).length) stop() }).catch(function () { starting = false });
  }
  function stop() { if (wid != null) { var id = wid; wid = null; BG.removeWatcher({ id: id }).catch(function () {}) } }
  var shim = {
    getCurrentPosition: G ? G.getCurrentPosition.bind(G) : function (a, b) { if (b) b({ code: 2 }) },
    watchPosition: function (ok, bad) { var id = ++n; subs[id] = [ok, bad];
      if (last && Date.now() - last.timestamp < 15000) setTimeout(function () { if (subs[id]) try { ok(last) } catch (e) {} }, 0);
      start(); return id },
    clearWatch: function (id) { delete subs[id]; if (!Object.keys(subs).length) stop() }
  };
  try { Object.defineProperty(navigator, 'geolocation', { value: shim, configurable: true }) } catch (e) {}

  // ---------- notifications for danger alerts ----------
  var lastN = '', lastT = 0, nid = Date.now() % 100000;
  LN.requestPermissions().catch(function () {});
  LN.createChannel({ id: 'danger', name: 'Danger trail alerts', description: 'Caution and Blocked reports ahead of you', importance: 5, visibility: 1, vibration: true }).catch(function () {});
  // friends & chat messages arrive as phone notifications when AwareBC is in the background
  LN.createChannel({ id: 'chat', name: 'Friends & chat', description: 'Messages and friend requests', importance: 4, visibility: 1, vibration: true }).catch(function () {});
  window.__native.notify = function (t, b) { LN.schedule({ notifications: [{ id: nid++, title: String(t || 'AwareBC'), body: String(b || ''), channelId: 'chat', smallIcon: 'ic_tracking' }] }).catch(function () {}) };
  function alertNote() {
    var a = document.getElementById('tralert'); if (!a || !a.classList.contains('show') || !window.__native.bg()) return;
    var b = a.querySelector('b'), s = a.querySelector('span'), t = (b && b.textContent) || 'Trail report ahead', x = ((s && s.textContent) || '').replace(' · tap to see the report', '');
    if (t + x === lastN && Date.now() - lastT < 60000) return; lastN = t + x; lastT = Date.now();
    LN.schedule({ notifications: [{ id: nid++, title: t, body: x + ' · tap to open AwareBC', channelId: 'danger', smallIcon: 'ic_tracking' }] }).catch(function () {});
  }
  var ov = navigator.vibrate ? navigator.vibrate.bind(navigator) : null;
  try { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: function (p) { try { alertNote() } catch (e) {} return ov ? ov(p) : false } }) } catch (e) {}

  // ---------- live updates: new AwareBC versions download by themselves when there's signal ----------
  // The new version is saved on the phone and switched to the next time the app opens. With no signal, nothing changes.
  // If a new version ever fails to start, the app goes back to the version built into it.
  var FS = reg('Filesystem'), WV = reg('WebView'), LIVE = 'https://raw.githubusercontent.com/SinKid420/Singer-Flight-Tracker/app-live/';
  function lsj(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d } catch (e) { return d } }
  function lss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
  function b64(buf) { var u = new Uint8Array(buf), s = '', i; for (i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s) }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2) }).join('') }
  function persist() { return WV.persistServerBasePath() }
  function clean(keep) {
    FS.readdir({ path: 'live', directory: 'DATA' }).then(function (r) {
      var p = lsj('aw-pending', null);
      (r.files || []).forEach(function (f) { var n = f.name || f; if (n !== keep && !(p && p.id === n)) FS.rmdir({ path: 'live/' + n, directory: 'DATA', recursive: true }).catch(function () {}) });
    }).catch(function () {});
  }
  var busy = false, lastCheck = 0;
  function check(cur) {
    if (!navigator.onLine || busy || Date.now() - lastCheck < 600000) return; busy = true; lastCheck = Date.now();
    Promise.all([APP.getInfo(), fetch(LIVE + 'version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('no version'); return r.json() })]).then(function (a) {
      var lvl = +String(a[0].version || '').split('.')[1] || 0, v = a[1], p = lsj('aw-pending', null);
      if (!v || !v.id || !v.files || v.id === cur.id || !(v.n > cur.n) || v.native > lvl || (p && p.id === v.id) || lsj('aw-bad', []).indexOf(v.id) >= 0) return;
      var dir = 'live/' + v.id, names = Object.keys(v.files), i = 0;
      function next() {
        if (i >= names.length) return FS.writeFile({ path: dir + '/app-version.json', data: JSON.stringify(v), directory: 'DATA', encoding: 'utf8', recursive: true });
        var f = names[i++], same = cur.files && cur.files[f] === v.files[f];
        return fetch(same ? f : LIVE + 'www/' + f, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(f); return r.arrayBuffer() })
          .then(function (buf) { return crypto.subtle.digest('SHA-256', buf).then(function (h) { if (hex(h) !== v.files[f]) throw new Error('bad ' + f); return FS.writeFile({ path: dir + '/' + f, data: b64(buf), directory: 'DATA', recursive: true }) }) })
          .then(next);
      }
      return next().then(function () { return FS.getUri({ path: dir, directory: 'DATA' }) })
        .then(function (u) { lss('aw-pending', { id: v.id, n: v.n, path: decodeURIComponent(String(u.uri).replace(/^file:\/\//, '')) }) });
    }).catch(function () {}).then(function () { busy = false });
  }
  fetch('app-version.json', { cache: 'no-store' }).then(function (r) { return r.json() }).then(function (cur) {
    window.__native.version = cur.n;
    var p = lsj('aw-pending', null);
    if (p && p.n > cur.n && lsj('aw-bad', []).indexOf(p.id) < 0) { // a newer version is saved: open it now (one quick reload)
      localStorage.removeItem('aw-pending'); WV.setServerBasePath({ path: p.path }).then(persist).catch(function () {}); return;
    }
    if (p && p.n <= cur.n) localStorage.removeItem('aw-pending');
    setTimeout(function () {
      if (window.__AW && window.__AW.map) { clean(cur.id); setTimeout(function () { check(cur) }, 5000); return }
      WV.getServerBasePath().then(function (r) { // this version didn't start: go back to the built-in one
        if (!r || !r.path || r.path.indexOf('/live/') < 0) return;
        var bad = lsj('aw-bad', []); bad.push(cur.id); lss('aw-bad', bad.slice(-20));
        WV.setServerAssetPath({ path: 'public' }).then(persist).catch(function () {});
      }).catch(function () {});
    }, 20000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) check(cur) });
  }).catch(function () {});

  // ---------- offline: FSR roads and other saved data come from phone storage when there's no signal ----------
  var of = window.fetch.bind(window);
  window.fetch = function (i, o) {
    var p = of(i, o), m = ((o && o.method) || (i && i.method) || 'GET').toUpperCase();
    if (m !== 'GET' || !window.caches) return p;
    var u = typeof i === 'string' ? i : (i && i.url);
    return p.catch(function (err) { return caches.match(u).then(function (r) { if (r) return r; throw err }) });
  };

  // ---------- offline: BC road map tiles from the saved area ----------
  var L = window.L; if (!L || !L.TileLayer) return;
  var oc = null; function off() { return oc || (oc = window.caches ? caches.open(OFF) : Promise.reject()) }
  var make = L.TileLayer.prototype.createTile;
  L.TileLayer.prototype.createTile = function (coords, done) {
    var url = this.getTileUrl(coords);
    if (!/^https:\/\/maps\.gov\.bc\.ca\/.*\/tile\//.test(url)) return make.call(this, coords, done);
    var t = document.createElement('img');
    L.DomEvent.on(t, 'load', L.Util.bind(this._tileOnLoad, this, done, t));
    L.DomEvent.on(t, 'error', L.Util.bind(this._tileOnError, this, done, t));
    if (this.options.crossOrigin || this.options.crossOrigin === '') t.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    if (typeof this.options.referrerPolicy === 'string') t.referrerPolicy = this.options.referrerPolicy;
    t.alt = ''; t.setAttribute('role', 'presentation');
    off().then(function (c) { return c.match(url) }).then(function (r) { return r && r.ok ? r.blob() : null }).then(function (b) {
      if (!b) { t.src = url; return }
      var bu = URL.createObjectURL(b); t.addEventListener('load', function () { URL.revokeObjectURL(bu) }, { once: true }); t.src = bu;
    }).catch(function () { t.src = url });
    return t;
  };
})();
