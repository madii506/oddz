// a free call: the wallet signs a message naming the prop and the pick, nothing goes on-chain
const L = require('./_lib');
module.exports = async (req, res) => { try {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'POST only' });
  if (!L.hasStore()) return L.send(res, 503, { error: 'calls open as soon as storage is connected' });
  const { wallet, id, oi, ts, sig } = await L.body(req);
  if (!L.B58.test(wallet || '')) return L.send(res, 400, { error: 'bad wallet' });
  const p = L.BY[id]; if (!p) return L.send(res, 404, { error: 'unknown prop' });
  if (!Number.isInteger(oi) || oi < 0 || oi >= p.o.length) return L.send(res, 400, { error: 'unknown pick' });
  if (!Number.isFinite(+ts) || Math.abs(Date.now() - +ts) > 5 * 60e3) return L.send(res, 400, { error: 'signature expired, sign again' });
  if (Date.now() >= Date.parse(p.closes)) return L.send(res, 409, { error: 'this prop is closed' });
  if (!L.verify(L.callMsg(id, p.o[oi], +ts), sig || '', wallet)) return L.send(res, 401, { error: 'signature does not match this wallet' });
  const st = await L.state(); const s = st.sets[id];
  if (s && (s.lock || s.r !== undefined)) return L.send(res, 409, { error: s.r !== undefined ? 'this prop is settled' : 'this prop is locked' });
  if (st.calls.some(c => c.id === id && c.wallet === wallet)) return L.send(res, 409, { error: 'you already called this one' });
  await L.put(`c/${id}/${oi}-${wallet}-${+ts}.json`, { wallet, id, oi, pick: p.o[oi], ts: +ts, sig, msg: L.callMsg(id, p.o[oi], +ts) });
  L.bust('state'); L.send(res, 200, { ok: true, call: { id, oi, ts: +ts } });
} catch (e) { L.send(res, 500, { error: String(e.message || e) }); } };
