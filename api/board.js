// the board: crowd picks on every prop, settlements, leaderboard, recent calls, my calls
const L = require('./_lib');
const TIERS = [[0, 'rookie'], [300, 'runner'], [1000, 'hustler'], [2500, 'made'], [6000, 'kingpin']];
const tier = p => TIERS.filter(t => p >= t[0]).pop()[1];
module.exports = async (req, res) => { try {
  const u = new URL(req.url, 'http://x'); const me = u.searchParams.get('wallet') || '';
  const st = await L.state(); const now = Date.now();
  const counts = {}; for (const c of st.calls) { const p = L.BY[c.id]; if (!p) continue; (counts[c.id] ||= p.o.map(() => 0))[c.oi]++; }
  // points: a right call pays the crowd's odds against it. 100 points x (all picks / picks on the winning answer), capped at 2,000
  const pay = {}; for (const [id, s] of Object.entries(st.sets)) if (typeof s.r === 'number' && counts[id]) { const n = counts[id].reduce((a, b) => a + b, 0), w = counts[id][s.r] || 0; if (w) pay[id] = Math.min(2000, Math.round(100 * n / w)); }
  const by = new Map();
  for (const c of [...st.calls].sort((a, b) => a.ts - b.ts)) { const w = by.get(c.wallet) || { wallet: c.wallet, calls: 0, won: 0, lost: 0, open: 0, pts: 0, streak: 0, best: 0 }; w.calls++;
    const s = st.sets[c.id]; if (s && typeof s.r === 'number') { if (s.r === c.oi) { w.won++; w.pts += pay[c.id] || 0; w.streak++; w.best = Math.max(w.best, w.streak); } else { w.lost++; w.streak = 0; } } else if (!s || s.r !== 'void') w.open++;
    by.set(c.wallet, w); }
  const leaders = [...by.values()].map(w => ({ ...w, acc: w.won + w.lost ? w.won / (w.won + w.lost) : null, tier: tier(w.pts) })).sort((a, b) => b.pts - a.pts || b.won - a.won || (b.acc || 0) - (a.acc || 0) || b.calls - a.calls);
  const rank = new Map(leaders.map((w, i) => [w.wallet, i + 1]));
  const view = c => { const s = st.sets[c.id]; return { id: c.id, oi: c.oi, ts: c.ts, wallet: c.wallet, status: !s || s.r === undefined ? 'open' : s.r === 'void' ? 'void' : s.r === c.oi ? 'won' : 'lost', pts: s && s.r === c.oi ? pay[c.id] || 0 : 0 }; };
  const recent = [...st.calls].sort((a, b) => b.ts - a.ts).slice(0, 50).map(view);
  const mine = me ? st.calls.filter(c => c.wallet === me).sort((a, b) => b.ts - a.ts).map(view) : [];
  const meRow = me ? (leaders.find(w => w.wallet === me) || null) : null;
  L.send(res, 200, { store: st.store, admin: L.ADMIN() || null, now, counts, sets: st.sets, pay, leaders: leaders.slice(0, 100), recent, mine, me: meRow ? { ...meRow, rank: rank.get(me) } : null,
    totals: { calls: st.calls.length, callers: by.size, settled: Object.values(st.sets).filter(s => s.r !== undefined).length } });
} catch (e) { L.send(res, 500, { error: String(e.message || e) }); } };
