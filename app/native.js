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
  function alertNote() {
    var a = document.getElementById('tralert'); if (!a || !a.classList.contains('show') || !window.__native.bg()) return;
    var b = a.querySelector('b'), s = a.querySelector('span'), t = (b && b.textContent) || 'Trail report ahead', x = ((s && s.textContent) || '').replace(' · tap to see the report', '');
    if (t + x === lastN && Date.now() - lastT < 60000) return; lastN = t + x; lastT = Date.now();
    LN.schedule({ notifications: [{ id: nid++, title: t, body: x + ' · tap to open AwareBC', channelId: 'danger', smallIcon: 'ic_tracking' }] }).catch(function () {});
  }
  var ov = navigator.vibrate ? navigator.vibrate.bind(navigator) : null;
  try { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: function (p) { try { alertNote() } catch (e) {} return ov ? ov(p) : false } }) } catch (e) {}

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
