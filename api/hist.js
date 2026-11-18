// price history for a Polymarket outcome token (the YES side), from Polymarket's public CLOB
const L = require('./_lib');
module.exports = async (req, res) => { try {
  const u = new URL(req.url, 'http://x'); const t = u.searchParams.get('t') || '', i = ['1d', '1w', '1m', 'max'].includes(u.searchParams.get('i')) ? u.searchParams.get('i') : '1w';
  if (!/^\d{10,90}$/.test(t)) return L.send(res, 400, { error: 'bad token' });
  const fid = { '1d': 15, '1w': 120, '1m': 480, max: 1440 }[i];
  const out = await L.cached(`h:${t}:${i}`, 300000, async () => { const j = await L.getJSON(`https://clob.polymarket.com/prices-history?market=${t}&interval=${i}&fidelity=${fid}`, { timeout: 8000 });
    let h = (j.history || []).map(x => [x.t, +x.p]); const n = h.length; if (n > 90) { const k = n / 90; h = Array.from({ length: 90 }, (_, j2) => h[Math.min(n - 1, Math.round(j2 * k))]); h.push(j.history.slice(-1).map(x => [x.t, +x.p])[0]); }
    return { h }; });
  L.send(res, 200, out, 120);
} catch (e) { L.send(res, 502, { error: String(e.message || e), h: [] }); } };
