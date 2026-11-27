// AwareBC daily data-source check (by Josh Singer). Runs on GitHub once a day: asks every live feed the app uses
// for a small answer and checks the answer still looks right (a feed can "work" but change its format).
// Prints a report; exits 1 if anything is down, so the workflow can open an issue (GitHub emails the owner).
const RS = 'https://awarebc.aware-bc.workers.dev/', la = 50.67, lo = -120.33;
const b = [lo - .5, la - .5, lo + .5, la + .5].map(v => v.toFixed(2)).join(',');
const arr = x => Array.isArray(x);
const F = [
  ['Live planes', RS + '?u=' + encodeURIComponent('https://api.adsb.lol/v2/point/' + la.toFixed(1) + '/' + lo.toFixed(1) + '/50'), j => arr(j.ac) || arr(j.aircraft) || arr(j.states)],
  ['DriveBC roads', 'https://api.open511.gov.bc.ca/events?format=json&status=ACTIVE&limit=1&bbox=' + b, j => arr(j.events)],
  ['BC wildfires', 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=1%3D1&returnCountOnly=true&f=json', j => typeof j.count === 'number'],
  ['Evacuations', 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0/query?where=1%3D1&returnCountOnly=true&f=json', j => typeof j.count === 'number'],
  ['Weather', 'https://api.open-meteo.com/v1/forecast?latitude=' + la + '&longitude=' + lo + '&current=temperature_2m', j => j.current && 'temperature_2m' in j.current],
  ['Weather alerts', 'https://api.weather.gc.ca/collections/weather-alerts/items?f=json&lang=en&limit=1&bbox=' + b, j => arr(j.features)],
  ['Air quality', 'https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?f=json&latest=true&limit=1&bbox=' + b, j => arr(j.features)],
  ['Air quality (forecast)', 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + la + '&longitude=' + lo + '&current=us_aqi', j => j.current && 'us_aqi' in j.current],
  ['Rain radar', 'https://api.rainviewer.com/public/weather-maps.json', j => j.radar && arr(j.radar.past)],
  ['Avalanche', 'https://api.avalanche.ca/forecasts/en/products/point?lat=' + la + '&long=' + lo, j => !!j && typeof j === 'object'],
  ['BC Ferries', 'https://www.bcferriesapi.ca/v2/capacity/', j => !!j && typeof j === 'object'],
  ['Space weather', 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json', j => arr(j) && j.length > 1],
  ['Trails & FSRs (BC map data)', 'https://openmaps.gov.bc.ca/geo/pub/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=WHSE_FOREST_TENURE.FTEN_REC_SITE_POINTS_SVW&outputFormat=json&count=1', j => arr(j.features)],
  ['OpenStreetMap data', 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent('[out:json][timeout:20];node(50.6,-120.4,50.7,-120.3)[amenity=fuel];out 1;'), j => arr(j.elements), 'https://overpass.kumi.systems/api/interpreter'],
  ['Place search', 'https://photon.komoot.io/api/?q=Kamloops&limit=1', j => arr(j.features) && j.features.length > 0],
  ['Directions', 'https://router.project-osrm.org/route/v1/driving/' + lo + ',' + la + ';' + (lo + .05) + ',' + (la + .05) + '?overview=false', j => j.code === 'Ok'],
  ['AwareBC server', RS + 'where', j => 'ok' in j],
];

async function one([name, url, good, backup]) {
  if (backup) { // the app switches to a backup copy of this service when the main one is busy: fine if either answers
    const m = await one([name, url, good]); if (m.ok) return m;
    const b2 = await one([name, url.replace(/^https:\/\/[^/]+\/api\/interpreter/, backup), good]);
    return b2.ok ? { name: name + ' (main server down, backup working)', ok: true, ms: b2.ms } : m; }
  const t0 = Date.now();
  for (let tryN = 0; tryN < 2; tryN++) { // one retry: a single hiccup isn't worth an email
    try {
      const r = await fetch(url, { headers: { Origin: 'https://sinkid420.github.io', 'User-Agent': 'AwareBC-feedcheck (awarebc.help@gmail.com)' }, signal: AbortSignal.timeout(20000) });
      const txt = await r.text();
      if (!r.ok) throw new Error('answered ' + r.status);
      let j; try { j = JSON.parse(txt); } catch (e) { throw new Error('answer is not data any more (format changed?)'); }
      if (!good(j)) throw new Error('answer looks different (format changed?)');
      return { name, ok: true, ms: Date.now() - t0 };
    } catch (e) {
      if (tryN) return { name, ok: false, ms: Date.now() - t0, why: e.name === 'TimeoutError' ? 'no answer in 20 s' : e.message === 'fetch failed' ? "can't reach it" : e.message };
      await new Promise(x => setTimeout(x, 15000));
    }
  }
}

const R = await Promise.all(F.map(one));
const bad = R.filter(r => !r.ok);
const lines = R.map(r => (r.ok ? '🟢 ' : '🔴 ') + r.name + (r.ok ? ' (' + (r.ms / 1000).toFixed(1) + ' s)' : ' — ' + r.why));
console.log(lines.join('\n'));
const fs = await import('fs');
fs.writeFileSync('feedcheck.md', (bad.length ? `**${bad.length} data source${bad.length > 1 ? 's are' : ' is'} down or changed.** The app keeps showing each source's last saved data, but riders won't see new updates from ${bad.length > 1 ? 'these' : 'it'} until fixed.\n\n` : 'All data sources are working.\n\n') + lines.join('\n') + '\n\n_Checked ' + new Date().toUTCString() + ' by the daily AwareBC source check._\n');
process.exit(bad.length ? 1 : 0);
