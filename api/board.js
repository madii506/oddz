// the board: crowd picks on every prop, settlements, parlays, leaderboard, hot props, recent calls, a prop's callers, a caller's profile
const L = require('./_lib');
const TIERS = [[0, 'rookie'], [300, 'runner'], [1000, 'hustler'], [2500, 'made'], [6000, 'kingpin']];
const tier = p => TIERS.filter(t => p >= t[0]).pop()[1];
module.exports = async (req, res) => { try {
  const u = new URL(req.url, 'http://x'); const me = u.searchParams.get('wallet') || '', prof = u.searchParams.get('profile') || '', pid = u.searchParams.get('prop') || '';
  const st = await L.state(); const now = Date.now();
  const counts = {}, hot = {}; for (const c of st.calls) { const p = L.BY[c.id]; if (!p) continue; (counts[c.id] ||= p.o.map(() => 0))[c.oi]++; if (now - c.ts < 2 * 3600e3) hot[c.id] = (hot[c.id] || 0) + 1; }
  // points: a right call pays the crowd's odds against it. 100 x (all picks / picks on the winning answer), capped at 2,000
  const mult = {}; for (const [id, s] of Object.entries(st.sets)) if (typeof s.r === 'number' && counts[id]) { const n = counts[id].reduce((a, b) => a + b, 0), w = counts[id][s.r] || 0; if (w) mult[id] = Math.min(20, n / w); }
  const pay = Object.fromEntries(Object.entries(mult).map(([k, v]) => [k, Math.round(100 * v)]));
  // a parlay: won when every leg hits, lost on the first miss, a void leg drops out (fewer than 2 left = void). Pays 100 x the product of the legs' odds, capped at 10,000
  const legMult = l => { const n = counts[l.id] ? counts[l.id].reduce((a, b) => a + b, 0) : 0, w = counts[l.id] ? counts[l.id][l.oi] : 0; return n && w ? Math.min(20, n / w) : 2; };
  const gradeP = x => { let lost = false, open = false, live = []; for (const l of x.legs) { const s = st.sets[l.id]; if (!s || s.r === undefined) { open = true; live.push(l); } else if (s.r === 'void') continue; else if (s.r !== l.oi) lost = true; else live.push(l); }
    const used = x.legs.filter(l => { const s = st.sets[l.id]; return !s || s.r !== 'void'; }); const m = used.reduce((a, l) => a * legMult(l), 1);
    const status = lost ? 'lost' : used.length < 2 ? 'void' : open ? 'open' : 'won'; return { wallet: x.wallet, ts: x.ts, legs: x.legs, status, mult: +m.toFixed(2), pts: status === 'won' ? Math.min(10000, Math.round(100 * m)) : 0 }; };
  const parlays = st.parlays.map(gradeP);
  const by = new Map(); const W = w => { let r = by.get(w); if (!r) { r = { wallet: w, calls: 0, won: 0, lost: 0, open: 0, pts: 0, streak: 0, best: 0, parlays: 0, parlaysWon: 0 }; by.set(w, r); } return r; };
  for (const c of [...st.calls].sort((a, b) => a.ts - b.ts)) { const w = W(c.wallet); w.calls++;
    const s = st.sets[c.id]; if (s && typeof s.r === 'number') { if (s.r === c.oi) { w.won++; w.pts += pay[c.id] || 0; w.streak++; w.best = Math.max(w.best, w.streak); } else { w.lost++; w.streak = 0; } } else if (!s || s.r !== 'void') w.open++; }
  for (const x of parlays) { const w = W(x.wallet); w.parlays++; if (x.status === 'won') { w.parlaysWon++; w.pts += x.pts; } }
  const leaders = [...by.values()].map(w => ({ ...w, acc: w.won + w.lost ? w.won / (w.won + w.lost) : null, tier: tier(w.pts) })).sort((a, b) => b.pts - a.pts || b.won - a.won || (b.acc || 0) - (a.acc || 0) || b.calls - a.calls);
  const rank = new Map(leaders.map((w, i) => [w.wallet, i + 1]));
  const view = c => { const s = st.sets[c.id]; return { id: c.id, oi: c.oi, ts: c.ts, wallet: c.wallet, status: !s || s.r === undefined ? 'open' : s.r === 'void' ? 'void' : s.r === c.oi ? 'won' : 'lost', pts: s && s.r === c.oi ? pay[c.id] || 0 : 0 }; };
  const recent = [...st.calls].sort((a, b) => b.ts - a.ts).slice(0, 50).map(view);
  const row = w => { const r = leaders.find(x => x.wallet === w); return r ? { ...r, rank: rank.get(w) } : null; };
  const out = { store: st.store, admin: L.ADMIN() || null, now, counts, hot, sets: st.sets, pay, leaders: leaders.slice(0, 100), recent,
    totals: { calls: st.calls.length, callers: by.size, parlays: parlays.length, settled: Object.values(st.sets).filter(s => s.r !== undefined).length } };
  if (me) { out.mine = st.calls.filter(c => c.wallet === me).sort((a, b) => b.ts - a.ts).map(view); out.myParlays = parlays.filter(x => x.wallet === me).sort((a, b) => b.ts - a.ts); out.me = row(me); } else { out.mine = []; out.myParlays = []; out.me = null; }
  if (prof && L.B58.test(prof)) out.profile = { ...(row(prof) || { wallet: prof }), calls: st.calls.filter(c => c.wallet === prof).sort((a, b) => b.ts - a.ts).slice(0, 200).map(view), parlays: parlays.filter(x => x.wallet === prof).sort((a, b) => b.ts - a.ts).slice(0, 50) };
  if (pid && L.BY[pid]) out.prop = { id: pid, callers: st.calls.filter(c => c.id === pid).sort((a, b) => b.ts - a.ts).slice(0, 40).map(view), parlays: parlays.filter(x => x.legs.some(l => l.id === pid)).length };
  L.send(res, 200, out);
} catch (e) { L.send(res, 500, { error: String(e.message || e) }); } };
