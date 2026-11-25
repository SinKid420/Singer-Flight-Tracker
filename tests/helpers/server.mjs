import http from 'node:http'; import { DatabaseSync } from 'node:sqlite';
const mod = await import(process.env.AWSRV || new URL('../../../awarebc-srv/src/index.js', import.meta.url).href); const W = mod.default, Hub = mod.Hub;
const db = new DatabaseSync(':memory:');
const sql = { exec(s, ...a) { let rows = [];
  if (!a.length && s.split(';').filter(x => x.trim()).length > 1) db.exec(s);
  else { const st = db.prepare(s); const args = a.map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v === undefined ? null : v); if (/^\s*(SELECT|WITH)|RETURNING/i.test(s)) rows = st.all(...args); else st.run(...args); }
  return { toArray: () => rows, one: () => rows[0] }; } };
const state = { storage: { sql, getAlarm: async () => 1, setAlarm: async () => {}, get: async () => null, put: async () => {} } };
const PUSHES=[]; const hub = new Hub(state, { ADMINS: process.env.ADMINS || '', PUSHFETCH: async (u, o) => { PUSHES.push({ u, len: o.body.length, h: o.headers }); return { status: 201 }; } });
const env = { ADMINS: process.env.ADMINS || '', GCLIENT: '', HUB: { idFromName: n => n, get: () => ({ fetch: (r, i) => hub.fetch(r instanceof Request ? r : new Request(r, i)) }) } };
http.createServer(async (q, s) => { const ch = []; for await (const c of q) ch.push(c); const body = Buffer.concat(ch);
  if (q.url === '/__push') { s.end(JSON.stringify(PUSHES.map(x=>({u:x.u.slice(-12),len:x.len,topic:x.h.Topic,urg:x.h.Urgency})))); return; }
  if (q.url === '/__alarm') { await hub.alarm(); s.end('ok'); return; }
  if (q.url === '/__sql') { try { const r = sql.exec(body.toString()).toArray(); s.end(JSON.stringify(r)); } catch (e) { s.end('ERR ' + e.message); } return; }
  const r = new Request('https://awarebc.aware-bc.workers.dev' + q.url, { method: q.method, headers: { ...q.headers, 'CF-Connecting-IP': q.headers['x-ip'] || '1.2.3.4' }, body: ['GET', 'HEAD'].includes(q.method) ? undefined : body });
  try { const o = await W.fetch(r, env, { waitUntil() {} }); const b = Buffer.from(await o.arrayBuffer()); const h = {}; o.headers.forEach((v, k) => h[k] = v); s.writeHead(o.status, h); s.end(b); }
  catch (e) { console.error('ERR', q.url, e); s.writeHead(500); s.end(String(e)); } }).listen(8788, () => console.log('local server on 8788'));
