// shared helpers: http, the props, blob storage for calls and settlements, signatures
const nacl = require('tweetnacl'); const bs58 = require('bs58');
const PROPS = require('../props.json');
const BY = Object.fromEntries(PROPS.props.map(p => [p.id, p]));
const memo = new Map();
async function cached(key, ms, fn, stale = true) { const m = memo.get(key); if (m && Date.now() - m.t < ms) return m.v;
  try { const v = await fn(); memo.set(key, { t: Date.now(), v }); return v; } catch (e) { if (stale && m) return m.v; throw e; } }
function bust(key) { if (key) memo.delete(key); else memo.clear(); }
async function getJSON(url, opt = {}, tries = 2) { const c = new AbortController(); const t = setTimeout(() => c.abort(), opt.timeout || 9000);
  try { const r = await fetch(url, { ...opt, signal: c.signal, headers: { accept: 'application/json', 'user-agent': 'oddz/1.0', ...(opt.headers || {}) } });
    if (r.status === 429 && tries > 1) { clearTimeout(t); await new Promise(z => setTimeout(z, 1300)); return getJSON(url, opt, tries - 1); }
    if (!r.ok) throw new Error(url.split('?')[0].replace(/^https?:\/\//, '') + ' ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
function send(res, code, body, maxAge = 0) { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', maxAge ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 4}` : 'no-store'); res.end(JSON.stringify(body)); }
async function body(req) { if (req.body && typeof req.body === 'object') return req.body; let s = ''; for await (const c of req) s += c; return JSON.parse(s || '{}'); }
const B58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function verify(msg, sig, wallet) { try { return nacl.sign.detached.verify(new TextEncoder().encode(msg), bs58.decode(sig), bs58.decode(wallet)); } catch (_) { return false; } }
const ADMIN = () => (process.env.ODDZ_ADMIN || '').trim();
// ---- blob
let blob = null; function B() { if (!blob) blob = require('@vercel/blob'); return blob; }
const hasStore = () => !!process.env.BLOB_READ_WRITE_TOKEN;
async function listAll(prefix) { const out = []; let cursor; do { const r = await B().list({ prefix, cursor, limit: 1000 }); out.push(...r.blobs.map(b => b.pathname)); cursor = r.hasMore ? r.cursor : null; } while (cursor && out.length < 50000); return out; }
const put = (path, data) => B().put(path, JSON.stringify(data), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
// c/<prop>/<pick>-<wallet>-<ts>.json          a call
// s/<prop>/<ts>-<result>-<b64url source>.json  a settlement: result is an option index, V (void), L (lock) or U (unlock); the latest one wins
const b64 = s => Buffer.from(s, 'utf8').toString('base64url'), unb64 = s => { try { return Buffer.from(s, 'base64url').toString('utf8'); } catch (_) { return ''; } };
function parseCall(p) { const m = p.match(/^c\/([A-Z]{2}\d{2})\/(\d+)-([1-9A-HJ-NP-Za-km-z]{32,44})-(\d+)\.json$/); return m && BY[m[1]] && { id: m[1], oi: +m[2], wallet: m[3], ts: +m[4] }; }
function parseSet(p) { const m = p.match(/^s\/([A-Z]{2}\d{2})\/(\d+)-(\d+|V|L|U)-([A-Za-z0-9_-]*)\.json$/); return m && BY[m[1]] && { id: m[1], ts: +m[2], r: m[3], src: unb64(m[4]) }; }
// x/<wallet>/<ts>-<ST01.0_SE02.1>.json       a parlay: 2 to 5 legs, all must hit
function parseParlay(p) { const m = p.match(/^x\/([1-9A-HJ-NP-Za-km-z]{32,44})\/(\d+)-((?:[A-Z]{2}\d{2}\.\d+_?){2,5})\.json$/); if (!m) return null; const legs = m[3].split('_').filter(Boolean).map(x => { const [id, oi] = x.split('.'); return { id, oi: +oi }; }); return legs.every(l => BY[l.id] && l.oi < BY[l.id].o.length) && { wallet: m[1], ts: +m[2], legs }; }
const parlayMsg = (legs, ts) => `oddz parlay\nlegs: ${legs.map(l => l.id + '=' + BY[l.id].o[l.oi]).join(' | ')}\ntime: ${ts}`;
const callMsg = (id, pick, ts) => `oddz call\nprop: ${id}\npick: ${pick}\ntime: ${ts}`;
const setMsg = (id, label, src, ts) => `oddz settle\nprop: ${id}\nresult: ${label}\nsource: ${src || '-'}\ntime: ${ts}`;
// everything the board needs, in one cached read
async function state() { return cached('state', 6000, async () => {
  if (!hasStore()) return { store: false, calls: [], sets: {}, parlays: [] };
  const [cp, sp, xp] = await Promise.all([listAll('c/'), listAll('s/'), listAll('x/')]);
  const calls = cp.map(parseCall).filter(Boolean), parlays = xp.map(parseParlay).filter(Boolean);
  const sets = {}; for (const s of sp.map(parseSet).filter(Boolean).sort((a, b) => a.ts - b.ts)) {
    const cur = sets[s.id] || {}; if (s.r === 'L') cur.lock = s.ts; else if (s.r === 'U') delete cur.lock; else if (s.r === 'V') { cur.r = 'void'; cur.src = s.src; cur.at = s.ts; } else { cur.r = +s.r; cur.src = s.src; cur.at = s.ts; } sets[s.id] = cur; }
  return { store: true, calls, sets, parlays }; }, false); }
module.exports = { PROPS, BY, cached, bust, getJSON, send, body, B58, verify, ADMIN, B, hasStore, put, b64, state, callMsg, setMsg, parlayMsg };
