// the desk: only the owner wallet (ODDZ_ADMIN) can settle, void, lock or unlock a prop, and every action is a signed message with its source
const L = require('./_lib');
module.exports = async (req, res) => { try {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'POST only' });
  if (!L.hasStore()) return L.send(res, 503, { error: 'storage is not connected' });
  const admin = L.ADMIN(); if (!admin) return L.send(res, 503, { error: 'no desk wallet set (ODDZ_ADMIN)' });
  const { wallet, id, r, src = '', ts, sig } = await L.body(req);
  if (wallet !== admin) return L.send(res, 403, { error: 'only the desk wallet can settle' });
  const p = L.BY[id]; if (!p) return L.send(res, 404, { error: 'unknown prop' });
  const rr = String(r); if (!(/^(V|L|U)$/.test(rr) || (/^\d+$/.test(rr) && +rr < p.o.length))) return L.send(res, 400, { error: 'bad result' });
  const source = String(src).slice(0, 300); if (/^\d+$/.test(rr) && !/^https?:\/\//.test(source)) return L.send(res, 400, { error: 'a settlement needs a source link' });
  if (!Number.isFinite(+ts) || Math.abs(Date.now() - +ts) > 5 * 60e3) return L.send(res, 400, { error: 'signature expired, sign again' });
  const label = rr === 'V' ? 'VOID' : rr === 'L' ? 'LOCK' : rr === 'U' ? 'UNLOCK' : p.o[+rr];
  if (!L.verify(L.setMsg(id, label, source, +ts), sig || '', wallet)) return L.send(res, 401, { error: 'signature does not match the desk wallet' });
  await L.put(`s/${id}/${+ts}-${rr}-${L.b64(source)}.json`, { id, r: rr, label, src: source, ts: +ts, sig, msg: L.setMsg(id, label, source, +ts) });
  L.bust('state'); L.send(res, 200, { ok: true });
} catch (e) { L.send(res, 500, { error: String(e.message || e) }); } };
