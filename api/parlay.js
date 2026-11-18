// a free parlay: 2 to 5 picks on different props, one signature. It pays only if every leg hits, and the crowd's odds multiply.
const L = require('./_lib');
module.exports = async (req, res) => { try {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'POST only' });
  if (!L.hasStore()) return L.send(res, 503, { error: 'parlays open as soon as storage is connected' });
  const { wallet, legs, ts, sig } = await L.body(req);
  if (!L.B58.test(wallet || '')) return L.send(res, 400, { error: 'bad wallet' });
  if (!Array.isArray(legs) || legs.length < 2 || legs.length > 5) return L.send(res, 400, { error: 'a parlay has 2 to 5 legs' });
  const ids = new Set(); for (const l of legs) { const p = L.BY[l && l.id]; if (!p) return L.send(res, 404, { error: 'unknown prop ' + (l && l.id) }); if (!Number.isInteger(l.oi) || l.oi < 0 || l.oi >= p.o.length) return L.send(res, 400, { error: 'unknown pick on ' + l.id }); if (ids.has(l.id)) return L.send(res, 400, { error: 'one leg per prop' }); ids.add(l.id);
    if (Date.now() >= Date.parse(p.closes)) return L.send(res, 409, { error: l.id + ' is closed' }); }
  if (!Number.isFinite(+ts) || Math.abs(Date.now() - +ts) > 5 * 60e3) return L.send(res, 400, { error: 'signature expired, sign again' });
  const clean = legs.map(l => ({ id: l.id, oi: l.oi }));
  if (!L.verify(L.parlayMsg(clean, +ts), sig || '', wallet)) return L.send(res, 401, { error: 'signature does not match this wallet' });
  const st = await L.state(); for (const l of clean) { const s = st.sets[l.id]; if (s && (s.lock || s.r !== undefined)) return L.send(res, 409, { error: l.id + ' is no longer open' }); }
  const open = st.parlays.filter(x => x.wallet === wallet && x.legs.every(l => { const s = st.sets[l.id]; return !s || s.r === undefined; }));
  if (open.length >= 10) return L.send(res, 429, { error: '10 open parlays max' });
  await L.put(`x/${wallet}/${+ts}-${clean.map(l => l.id + '.' + l.oi).join('_')}.json`, { wallet, legs: clean, ts: +ts, sig, msg: L.parlayMsg(clean, +ts) });
  L.bust('state'); L.send(res, 200, { ok: true });
} catch (e) { L.send(res, 500, { error: String(e.message || e) }); } };
