// oddz terminal: free props on GTA VI, real Polymarket GTA VI markets through Jupiter, the rolling launch, a leaderboard. Everything live.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const H = document.documentElement;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = v => { v = +v || 0; const a = Math.abs(v); return '$' + (a >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : a >= 1e6 ? (v / 1e6).toFixed(a >= 1e8 ? 0 : 2) + 'M' : a >= 1e3 ? (v / 1e3).toFixed(a >= 1e5 ? 0 : 1) + 'K' : v.toFixed(2)); };
const cents = v => v == null ? '—' : (v >= .995 ? '99.9' : v <= .005 ? '0.1' : (v * 100).toFixed(v * 100 < 10 || v * 100 > 90 ? 1 : 0)) + '¢';
const short = w => w ? w.slice(0, 4) + '…' + w.slice(-4) : '';
const ago = t => { const s = (Date.now() - t) / 1e3; return s < 60 ? Math.max(1, s | 0) + 's' : s < 3600 ? (s / 60 | 0) + 'm' : s < 86400 ? (s / 3600 | 0) + 'h' : (s / 86400 | 0) + 'd'; };
const dur = ms => { const s = Math.max(0, ms / 1e3); return s >= 86400 ? `${s / 86400 | 0}d ${(s % 86400) / 3600 | 0}h` : s >= 3600 ? `${s / 3600 | 0}h ${(s % 3600) / 60 | 0}m` : `${s / 60 | 0}m ${s % 60 | 0}s`; };
const store = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };
function toast(m, err) { const t = $('#toast'); t.textContent = m; t.className = 'on' + (err ? ' err' : ''); clearTimeout(toast.h); toast.h = setTimeout(() => t.className = '', 3600); }
async function api(p, o) { const r = await fetch(p, o); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || j.message || ('error ' + r.status)); return j; }
const post = (p, b, m = 'POST') => api(p, { method: m, headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
const rpc = (method, params) => post('/api/rpc', { method, params }).then(j => { if (j.error) throw new Error(j.error.message || 'rpc error'); return j.result; });
const A58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(bytes) { let n = 0n; for (const b of bytes) n = n * 256n + BigInt(b); let s = ''; while (n > 0n) { s = A58[Number(n % 58n)] + s; n /= 58n; } for (const b of bytes) { if (b) break; s = '1' + s; } return s; }
// ---------------------------------------------------------------- the mark, as favicon
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#fff6f2" d="M96 20 A80 80 0 0 0 96 180 Z"/><path fill="#fff6f2" d="M110 44 A56 56 0 0 1 110 156 Z"/></svg>`;

// ---------------------------------------------------------------- the rolling launch: PS5 unlocks at midnight local time
const LAUNCH = Date.UTC(2026, 10, 19, 0, 0);
const ZONES = [['New Zealand', 'Auckland', 13], ['Australia, east', 'Sydney · Melbourne', 11], ['Japan & Korea', 'Tokyo · Seoul', 9], ['Southeast Asia', 'Singapore · Manila', 8], ['India', 'Mumbai · Delhi', 5.5],
  ['Gulf', 'Dubai', 4], ['Central Europe', 'Paris · Berlin · Stockholm', 1], ['UK & Portugal', 'London · Lisbon', 0], ['Brazil', 'São Paulo · Rio', -3], ['US East', 'New York · Miami', -5], ['US Central', 'Chicago · Houston', -6], ['US West', 'Los Angeles', -8], ['Hawaii', 'Honolulu', -10]];
const unlockAt = off => LAUNCH - off * 3600e3;
function zonesLive() { return ZONES.filter(z => Date.now() >= unlockAt(z[2])).length; }
function clock() { const n = zonesLive(), us = unlockAt(-5), now = Date.now();
  if (S.tab === 'live') renderZones(); if (S.tab === 'board' && clock.k++ % 30 === 0) { renderGrid(); renderRail(); } }
clock.k = 1;
// ---------------------------------------------------------------- state
const S = { tab: 'board', cat: 'all', f: 'all', q: '', sort: 'close', rs: 'vol', props: [], cats: [], byId: {}, board: null, real: null, news: [], wallet: null, prov: null, pos: null, bet: null, call: null, legs: [], pmode: false, hist: {}, lastSeen: 0,
  star: (() => { try { return new Set(JSON.parse(store.get('oddz:star') || '[]')); } catch (_) { return new Set(); } })() };
const saveStar = () => store.set('oddz:star', JSON.stringify([...S.star]));
// ---------------------------------------------------------------- loading: one line, nothing else
let sceneOk = false, dataOk = false; const lb = $('#lbar');
function progress() { lb.style.width = ((sceneOk ? 60 : 18) + (dataOk ? 40 : 0)) * 2.4 + 'px'; if (sceneOk && dataOk) done(); }
function done() { if (done.d) return; done.d = 1; setTimeout(() => { $('#load').classList.add('out'); H.classList.add('go'); setTimeout(() => H.classList.add('lit'), 5000); if (location.hash === '#book') openTerm(); }, 400); }
addEventListener('oddz:lit', () => H.classList.add('lit'));
addEventListener('oddz:scene', () => { sceneOk = true; progress(); }); setTimeout(() => { sceneOk = true; dataOk = true; progress(); }, 9000); progress();
// ---------------------------------------------------------------- home <-> terminal
function openTerm() { H.classList.add('term'); window.oddzScene?.mode('term'); if (location.hash !== '#book') history.replaceState(null, '', '#book'); }
function openHome() { H.classList.remove('term'); window.oddzScene?.mode('home'); history.replaceState(null, '', location.pathname); }
$('#enter').onclick = openTerm; $('#toHome').onclick = openHome; $('#hconn').onclick = () => connect(); $('#wal').onclick = () => S.wallet ? disconnect() : connect();
// ---------------------------------------------------------------- tabs
const TABS = () => $$('.tab').filter(t => !t.hidden).map(t => t.dataset.t);
function tab(t) { if (!TABS().includes(t)) return; S.tab = t; $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === t)); $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'p-' + t)); render(); }
$$('.tab').forEach(b => b.onclick = () => tab(b.dataset.t));
function render() { ({ board: () => { renderCats(); renderRail(); renderGrid(); renderDock(); }, real: renderReal, live: renderLive, slip: renderSlip, leaders: renderLeaders, how: renderHow, desk: renderDesk })[S.tab]?.(); }
// ---------------------------------------------------------------- props + their state
const set = id => S.board?.sets?.[id];
function status(p) { const s = set(p.id), now = Date.now(), c = Date.parse(p.closes);
  if (s && s.r === 'void') return 'void'; if (s && typeof s.r === 'number') return 'set'; if ((s && s.lock) || now >= c) return 'closed'; if (c - now < 6 * 3600e3) return 'soon'; return 'open'; }
const counts = id => S.board?.counts?.[id] || null;
const myCall = id => S.board?.mine?.find(c => c.id === id) || null;
function pcts(p) { const c = counts(p.id); const n = c ? c.reduce((a, b) => a + b, 0) : 0; return { n, v: p.o.map((_, i) => n ? Math.round(100 * c[i] / n) : null) }; }
// ---------------------------------------------------------------- board
function renderCats() { const box = $('#cats'); const all = S.props; const n = c => all.filter(p => (c === 'all' || p.c === c) && ['open', 'soon'].includes(status(p))).length;
  box.innerHTML = `<button class="cat ${S.cat === 'all' ? 'on' : ''}" data-c="all"><i style="background:var(--paper)"></i><span>Every prop</span><em>${n('all')}</em></button><hr>` +
    S.cats.map(c => `<button class="cat ${S.cat === c.id ? 'on' : ''}" data-c="${c.id}"><i style="background:${c.color}"></i><span>${esc(c.name)}</span><em>${n(c.id)}</em></button>`).join('');
  $$('.cat', box).forEach(b => b.onclick = () => { S.cat = b.dataset.c; renderCats(); renderGrid(); }); }
function filtered() { const q = S.q.trim().toLowerCase(); return S.props.filter(p => { const st = status(p);
  if (S.cat !== 'all' && p.c !== S.cat) return false; if (q && !(p.q.toLowerCase().includes(q) || p.id.toLowerCase() === q || p.o.some(o => o.toLowerCase().includes(q)))) return false;
  if (S.f === 'open') return st === 'open' || st === 'soon'; if (S.f === 'soon') return st === 'soon'; if (S.f === 'hot') return (S.board?.hot?.[p.id] || 0) > 0 && (st === 'open' || st === 'soon'); if (S.f === 'star') return S.star.has(p.id); if (S.f === 'set') return st === 'set' || st === 'void'; if (S.f === 'mine') return !!myCall(p.id); return true; })
  .sort((a, b) => { const o = { soon: 0, open: 1, closed: 2, set: 3, void: 4 }, d = o[status(a)] - o[status(b)]; if (d) return d;
    if (S.sort === 'hot' || S.f === 'hot') return (S.board?.hot?.[b.id] || 0) - (S.board?.hot?.[a.id] || 0) || pcts(b).n - pcts(a).n; if (S.sort === 'split') return split(a) - split(b); if (S.sort === 'new') return S.props.indexOf(b) - S.props.indexOf(a); return Date.parse(a.closes) - Date.parse(b.closes); }); }
function split(p) { const v = pcts(p).v.filter(x => x != null); return v.length ? Math.max(...v) - Math.min(...v) : 999; }
function card(p) { const st = status(p), s = set(p.id), mc = myCall(p.id), pc = pcts(p), cat = S.cats.find(c => c.id === p.c) || {}; const live = st === 'open' || st === 'soon';
  const two = p.o.length === 2; const closes = Date.parse(p.closes);
  const opts = p.o.map((o, i) => { const v = pc.v[i]; const lead = pc.n && v === Math.max(...pc.v) && !(s && typeof s.r === 'number'); const cls = [mc && mc.oi === i ? 'me' : '', s && s.r === i ? 'win' : '', S.legs.some(l => l.id === p.id && l.oi === i) ? 'leg' : '', lead ? 'lead' : ''].join(' ');
    return `<button class="opt ${cls}" data-id="${p.id}" data-i="${i}" ${live && (!mc || S.pmode) ? '' : 'disabled'}><i class="bar" style="width:${v ?? 0}%"></i><span>${esc(o)}</span><em>${v == null ? '' : v + '%'}</em></button>`; }).join('');
  const badge = { open: `<span class="badge open">${dur(closes - Date.now())}</span>`, soon: `<span class="badge soon">closes ${dur(closes - Date.now())}</span>`, closed: `<span class="badge closed">${s && s.lock ? 'locked' : 'closed'} · settling</span>`, set: `<span class="badge set">settled</span>`, void: `<span class="badge void">void</span>` }[st];
  const bot = st === 'set' || st === 'void' ? `<span class="lft">${badge}${st === 'set' ? 'answer: <b style="color:var(--gold)">' + esc(p.o[s.r]) + '</b>' : 'voided'}</span>${s.src ? `<a href="${esc(s.src)}" target="_blank" rel="noopener">source</a>` : ''}`
    : `<span class="lft">${badge}${pc.n ? pc.n + ' call' + (pc.n === 1 ? '' : 's') : 'no calls yet'}</span>${mc ? '<span>you: <b style="color:var(--paper)">' + esc(p.o[mc.oi]) + '</b></span>' : ''}`;
  const hot = S.board?.hot?.[p.id];
  return `<article class="card" data-card="${p.id}" style="--cc:${cat.color}55"><div class="top"><b><i style="background:${cat.color}"></i>${esc(cat.name || p.c)}${hot && live ? `<span class="hotb">HOT · ${hot}</span>` : ''}</b><span class="r"><span class="cid">${p.id}</span><button class="star ${S.star.has(p.id) ? 'on' : ''}" data-star="${p.id}" title="star">${S.star.has(p.id) ? '★' : '☆'}</button></span></div><h3 data-open="${p.id}">${esc(p.q)}</h3><div class="opts ${two ? 'two' : ''}">${opts}</div><div class="bot">${bot}</div></article>`; }
function renderGrid() { if (S.tab !== 'board') return; const L = filtered(); $('#grid').innerHTML = L.length ? L.map(card).join('') : `<div class="empty">${S.f === 'mine' ? 'You have no calls yet. Pick a side on any open prop.' : S.f === 'star' ? 'Star a prop (☆) to keep it here.' : S.f === 'hot' ? 'Nothing hot in the last 2 hours yet.' : 'Nothing matches.'}</div>`;
  $$('#grid .opt:not([disabled])').forEach(b => b.onclick = () => S.pmode ? toggleLeg(b.dataset.id, +b.dataset.i) : slip(b.dataset.id, +b.dataset.i));
  $$('#grid [data-star]').forEach(b => b.onclick = e => { e.stopPropagation(); toggleStar(b.dataset.star); }); $$('#grid [data-open]').forEach(h => h.onclick = () => openProp(h.dataset.open)); renderCHead(); }
function toggleStar(id) { S.star.has(id) ? S.star.delete(id) : S.star.add(id); saveStar(); renderGrid(); if ($('#mProp.on')) openProp(id, true); }
function renderRail() { const now = Date.now(); const L = S.props.filter(p => status(p) === 'soon' || (status(p) === 'open' && Date.parse(p.closes) - now < 24 * 3600e3)).sort((a, b) => Date.parse(a.closes) - Date.parse(b.closes)).slice(0, 10);
  $('#rail').innerHTML = L.length ? `<span class="rl">closing next</span>` + L.map(p => `<button class="rc" data-open="${p.id}"><b>${dur(Date.parse(p.closes) - now)}</b><span>${esc(p.q)}</span></button>`).join('') : ''; $$('#rail [data-open]').forEach(b => b.onclick = () => openProp(b.dataset.open)); }
function renderCHead() { const c = S.cats.find(x => x.id === S.cat), el = $('#chead'); if (!c) { el.classList.remove('on'); return; } const n = S.props.filter(p => p.c === c.id); el.classList.add('on');
  el.innerHTML = `<i style="background:${c.color}"></i><div><h2>${esc(c.name)}</h2><p>${esc(c.s)}</p></div><em>${n.filter(p => ['open', 'soon'].includes(status(p))).length} open · ${n.length} total</em>`; }
$('#q').oninput = e => { S.q = e.target.value; renderGrid(); };
$$('#p-board .bbar .chip[data-f]').forEach(c => c.onclick = () => { S.f = c.dataset.f; $$('#p-board .bbar .chip[data-f]').forEach(x => x.classList.toggle('on', x === c)); renderGrid(); });
$('#sort').onchange = e => { S.sort = e.target.value; renderGrid(); };
$('#pmode').onclick = () => setPmode(!S.pmode);
function setPmode(on) { S.pmode = on; $('#pmode').classList.toggle('on', on); document.body.classList.toggle('pmode', on); $('#pmode').textContent = on ? '✓ parlay mode' : '＋ parlay mode'; if (on) toast('parlay mode: tap 2 to 5 answers on different props'); renderGrid(); renderDock(); }
// ---------------------------------------------------------------- real money: Polymarket's GTA VI markets through Jupiter
function renderReal() { const box = $('#real'); const R = S.real; if (!R) { box.innerHTML = '<div class="empty">loading the real markets…</div>'; return; }
  if (R.error && !R.events.length) { box.innerHTML = `<div class="empty">Couldn't reach Jupiter's prediction markets right now (${esc(R.error)}). Retrying…</div>`; return; }
  const order = R.events.map((e, ei) => [e, ei]).sort(([a], [b]) => S.rs === 'close' ? Date.parse(a.closes || 0) - Date.parse(b.closes || 0) : S.rs === 'today' ? (b.vol24 || 0) - (a.vol24 || 0) : S.rs === 'live' ? live(b) - live(a) : (b.vol || 0) - (a.vol || 0));
  box.innerHTML = order.map(([e, ei]) => { const show = e.open ? e.markets : e.markets.slice(0, 5);
    return `<article class="pnl ev"><div class="eh">${e.img ? `<img src="${esc(e.img)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<div><h3>${esc(e.title)}</h3><div class="meta">${money(e.vol)} volume${e.vol24 ? ' · ' + money(e.vol24) + ' today' : ''}${e.closes ? ' · ends ' + new Date(e.closes).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}</div></div></div>
      ${show.map(m => `<div class="mk"><div class="t">${esc(m.title === 'Yes' || e.markets.length === 1 ? 'Yes / No' : m.title)}<small>${Math.round((m.yes || 0) * 100)}% chance</small></div><button class="bb y" data-m="${esc(m.id)}" data-e="${ei}" data-s="y"><small>YES</small>${cents(m.yes)}</button><button class="bb n" data-m="${esc(m.id)}" data-e="${ei}" data-s="n"><small>NO</small>${cents(m.no)}</button>${m.tok ? `<div class="spk" data-tok="${esc(m.tok)}">${S.hist[m.tok] ? spark(S.hist[m.tok]) : ''}</div>` : ''}</div>`).join('')}
      ${e.markets.length > 5 ? `<button class="more" data-more="${ei}">${e.open ? 'show fewer' : 'show all ' + e.markets.length}</button>` : ''}
      ${e.slug ? `<a class="more" href="https://polymarket.com/event/${esc(e.slug)}" target="_blank" rel="noopener">rules on polymarket ↗</a>` : ''}</article>`; }).join('') || '<div class="empty">No live GTA VI markets right now.</div>';
  $$('#real .bb').forEach(b => b.onclick = () => openBet(+b.dataset.e, b.dataset.m, b.dataset.s)); loadSparks();
  $$('#real [data-more]').forEach(b => b.onclick = () => { const e = S.real.events[+b.dataset.more]; e.open = !e.open; renderReal(); }); }
const live = e => Math.max(...e.markets.map(m => 1 - Math.abs((m.yes ?? 0) - .5) * 2));
$$('#p-real [data-rs]').forEach(c => c.onclick = () => { S.rs = c.dataset.rs; $$('#p-real [data-rs]').forEach(x => x.classList.toggle('on', x === c)); renderReal(); });
function spark(h, w = 300, ht = 34, big) { if (!h || h.length < 2) return ''; const ps = h.map(x => x[1]), lo = Math.min(...ps), hi = Math.max(...ps), r = Math.max(.02, hi - lo), up = ps[ps.length - 1] >= ps[0];
  const pts = h.map((x, i) => `${(i / (h.length - 1) * w).toFixed(1)},${(ht - 3 - (x[1] - lo) / r * (ht - 6)).toFixed(1)}`).join(' '); const col = up ? '#2fe0a8' : '#ff5f98';
  return `<svg class="spark" viewBox="0 0 ${w} ${ht}" preserveAspectRatio="none"><polyline points="0,${ht} ${pts} ${w},${ht}" fill="${col}22" stroke="none"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${big ? 2 : 1.6}" vector-effect="non-scaling-stroke"/></svg>`; }
let sparkBusy = false; async function loadSparks() { if (sparkBusy) return; sparkBusy = true; try { const els = $$('#real [data-tok]').filter(el => !S.hist[el.dataset.tok]).slice(0, 24);
  for (let i = 0; i < els.length; i += 4) await Promise.all(els.slice(i, i + 4).map(async el => { const t = el.dataset.tok; try { const j = await api(`/api/hist?t=${t}&i=1w`); S.hist[t] = j.h || []; $$(`#real [data-tok="${t}"]`).forEach(x => x.innerHTML = spark(S.hist[t])); } catch (_) { S.hist[t] = []; } })); } finally { sparkBusy = false; } }
// ---------------------------------------------------------------- live: zones, wire, calls
function renderZones() { const now = Date.now(); $('#zones').innerHTML = ZONES.map(([n, c, off]) => { const t = unlockAt(off), live = now >= t, soon = !live && t - now < 3 * 3600e3;
  return `<div class="zone ${live ? 'live' : soon ? 'soon' : ''}"><b>${esc(n)}</b><span>${live ? '● live · ' + ago(t) + ' ago' : 'in ' + dur(t - now)}</span><small>${esc(c)} · ${new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })} your time</small></div>`; }).join('') +
  `<div class="zone"><small>PS5 rolling midnight launch, as announced on the PlayStation Blog. Xbox and some stores can unlock at different times.</small></div>`; }
function renderLive() { renderZones(); $('#news').innerHTML = S.news.length ? S.news.map(n => `<a href="${esc(n.url)}" target="_blank" rel="noopener"><b>${esc(n.title)}</b><small>${esc(n.src)} · ${ago(n.ts)} ago</small></a>`).join('') : '<div class="empty">loading headlines…</div>';
  const B = S.board; const setL = B ? Object.entries(B.sets).filter(([, s]) => s.at).sort((a, b) => b[1].at - a[1].at).slice(0, 8) : [];
  const rec = B ? B.recent.slice(0, 30) : [];
  $('#recent').innerHTML = (setL.map(([id, s]) => { const p = S.byId[id]; if (!p) return ''; return `<div class="it"><b>${s.r === 'void' ? 'VOID' : 'SETTLED'} · ${esc(p.q)}</b><small>${s.r === 'void' ? 'voided' : 'answer: ' + esc(p.o[s.r])} · ${ago(s.at)} ago</small></div>`; }).join('') +
    rec.map(c => { const p = S.byId[c.id]; if (!p) return ''; return `<div class="it"><b><span class="wl" data-w="${esc(c.wallet)}">${esc(short(c.wallet))}</span> called <span style="color:var(--gold)">${esc(p.o[c.oi])}</span></b><small class="wl" data-open="${p.id}">${esc(p.q)} · ${ago(c.ts)} ago</small></div>`; }).join('')) || '<div class="empty">No calls yet. Be the first.</div>'; bindLinks($('#recent')); }
function bindLinks(root) { $$('[data-w]', root).forEach(x => x.onclick = e => { e.stopPropagation(); openProfile(x.dataset.w); }); $$('[data-open]', root).forEach(x => x.onclick = e => { e.stopPropagation(); openProp(x.dataset.open); }); }
// ---------------------------------------------------------------- my slip: free calls + real positions
function renderSlip() { const box = $('#slipBox'); if (!S.wallet) { box.innerHTML = `<div class="pnl empty" style="padding:50px">Connect a wallet to see your calls and your real positions.<br><br><button class="btn w" id="sc">connect wallet</button></div>`; $('#sc').onclick = () => connect(); return; }
  const me = S.board?.me, mine = S.board?.mine || [];
  const head = `<div class="pnl me-card"><div><span>rank</span><b>${me ? '#' + me.rank : '—'}</b></div><div><span>points</span><b>${me ? me.pts.toLocaleString() : 0}</b></div><div><span>won / lost</span><b>${me ? me.won + ' / ' + me.lost : '0 / 0'}</b></div><div><span>open calls</span><b>${me ? me.open : 0}</b></div><div><span>tier</span><b><span class="tier ${me?.tier || 'rookie'}">${me?.tier || 'rookie'}</span></b></div></div>`;
  const calls = mine.length ? `<table class="tbl"><tr><th>prop</th><th>your call</th><th>status</th><th>pts</th></tr>${mine.map(c => { const p = S.byId[c.id]; if (!p) return ''; const st = c.status;
    return `<tr><td class="q wl" data-open="${p.id}">${esc(p.q)}</td><td>${esc(p.o[c.oi])}</td><td><span class="badge ${st === 'won' ? 'set' : st === 'lost' || st === 'void' ? 'void' : 'open'}">${st}</span></td><td>${c.pts || '—'}</td></tr>`; }).join('')}</table>` : '<div class="empty">No free calls yet.</div>';
  const P = S.pos; const pos = !P ? '<div class="empty">loading your positions…</div>' : P.error ? `<div class="empty">Couldn't load positions: ${esc(P.error)}</div>` : !P.list.length ? '<div class="empty">No real positions yet. Place a bet on the real money tab.</div>' :
    `<table class="tbl"><tr><th>market</th><th>side</th><th>contracts</th><th>cost</th><th>if right</th><th></th></tr>${P.list.map(x => `<tr><td class="q">${esc(x.title)}${x.status !== 'open' ? `<br><small class="mono" style="color:var(--faint)">${esc(x.status)}${x.result ? ' · ' + esc(x.result) : ''}</small>` : ''}</td><td class="${x.isYes ? 'up' : 'dn'}">${x.isYes ? 'YES' : 'NO'}</td><td>${x.contracts.toFixed(2)}</td><td>${money(x.cost)}</td><td>${money(x.contracts)}</td>
      <td>${x.claimable ? `<button class="sbtn g" data-claim="${esc(x.pubkey)}">claim</button>` : x.status === 'open' ? `<button class="sbtn" data-sell="${esc(x.pubkey)}">sell</button>` : ''}</td></tr>`).join('')}</table>`;
  const MP = S.board?.myParlays || []; const parl = MP.length ? `<table class="tbl"><tr><th>legs</th><th>odds</th><th>status</th><th>pts</th></tr>${MP.map(x => `<tr><td class="q">${x.legs.map(l => { const p = S.byId[l.id], s = set(l.id); return `<div class="wl" data-open="${l.id}">${s && typeof s.r === 'number' ? (s.r === l.oi ? '✓ ' : '✗ ') : '· '}${esc(p ? p.o[l.oi] : '?')} · ${esc(p ? p.q : l.id)}</div>`; }).join('')}</td><td>${x.mult}×</td><td><span class="badge ${x.status === 'won' ? 'set' : x.status === 'lost' || x.status === 'void' ? 'void' : 'open'}">${x.status}</span></td><td>${x.pts || '—'}</td></tr>`).join('')}</table>` : '<div class="empty">No parlays yet. Turn on parlay mode on the props tab.</div>';
  box.innerHTML = head + `<div class="two-col"><div class="pnl"><div class="ph"><div><h2>Free calls</h2><p>signed, free, settled with a source</p></div></div>${calls}</div><div class="pnl" style="grid-row:span 2"><div class="ph"><div><h2>Parlays</h2><p>every leg must hit · the crowd's odds multiply</p></div></div>${parl}</div><div class="pnl"><div class="ph"><div><h2>Real positions</h2><p>your Jupiter prediction positions, live</p></div><button class="sbtn" id="rp">refresh</button></div>${pos}</div></div>`;
  bindLinks(box); $('#rp').onclick = loadPos; $$('[data-sell]').forEach(b => b.onclick = () => closePos(b.dataset.sell, 'sell')); $$('[data-claim]').forEach(b => b.onclick = () => closePos(b.dataset.claim, 'claim')); }
// ---------------------------------------------------------------- leaderboard
function renderLeaders() { const L = S.board?.leaders || []; $('#lead').innerHTML = L.length ? `<table class="tbl"><tr><th>#</th><th>caller</th><th>tier</th><th>points</th><th>won</th><th>lost</th><th>open</th><th>parlays</th><th>hit rate</th><th>best streak</th></tr>${L.map((w, i) => `<tr${w.wallet === S.wallet ? ' style="background:rgba(255,63,164,.08)"' : ''}><td>${i + 1}</td><td><span class="wl" data-w="${esc(w.wallet)}">${esc(short(w.wallet))}</span></td><td><span class="tier ${w.tier}">${w.tier}</span></td><td><b>${w.pts.toLocaleString()}</b></td><td class="up">${w.won}</td><td class="dn">${w.lost}</td><td>${w.open}</td><td>${w.parlaysWon || 0}/${w.parlays || 0}</td><td>${w.acc == null ? '—' : Math.round(w.acc * 100) + '%'}</td><td>${w.best}</td></tr>`).join('')}</table>` : '<div class="empty">No callers yet. The board fills as props settle.</div>'; bindLinks($('#lead')); }
// ---------------------------------------------------------------- how it works
function renderHow() { $('#how').innerHTML = `
  <div class="pnl"><h3>Props: call it, free</h3><ol><li>Pick any open prop: story, characters, secrets, rides, streamers, records, music, Online and PC, launch week.</li><li>Pick your side. Your wallet signs one short message with the prop, your pick and the time. <b>No transaction, no SOL, nothing leaves your wallet.</b></li><li>One call per prop. Every prop closes before anyone can know the answer.</li><li>When the answer is public, the desk settles it with a source link: a clip, a stat page, an official post.</li></ol></div>
  <div class="pnl"><h3>Real money</h3><ol><li>The real money tab lists every live GTA VI market on <b>Polymarket</b> that <b>Jupiter</b> can trade on Solana.</li><li>Pick YES or NO and an amount ($5 minimum). Oddz swaps your SOL to USDC through Jupiter, then opens the position. You sign both in your own wallet.</li><li>Sell any time the market is open. When it resolves, winning contracts pay $1 each: claim it on My slip, or Jupiter's keepers claim it for you within a day.</li><li>Jupiter doesn't serve the US or South Korea.</li></ol></div>
  <div class="pnl"><h3>Parlays</h3><p>Turn on <b>parlay mode</b> and tap 2 to 5 answers on different props. One signature, still free. It pays only if <b>every leg hits</b>, and the legs' crowd odds multiply: <b>100 × odds × odds × …</b>, up to 10,000 points. A void leg drops out; fewer than 2 legs left and the parlay is void.</p></div>
  <div class="pnl"><h3>Points & ranks</h3><p>A right call pays the crowd's odds: <b>100 × (all calls ÷ calls on the winning answer)</b>, up to 2,000 per prop. Call the longshot and you climb fast. A wrong call pays nothing, a void pays nothing.</p><p><span class="tier">rookie</span> <span class="tier runner">runner 300</span> <span class="tier hustler">hustler 1,000</span> <span class="tier made">made 2,500</span> <span class="tier kingpin">kingpin 6,000</span></p></div>
  <div class="pnl"><h3>How props settle</h3><p>Every prop says what settles it. A prop is settled only with a public source link that anyone can open. If the answer is unclear or the question breaks, the prop is <b>voided</b>: nobody wins or loses. Every settlement is a message signed by the desk wallet and stored with its source.</p></div>
  <div class="pnl full"><h3>What Oddz never does</h3><ul><li>No account, no email, no sign-up.</li><li>A free call is a signed message, never a transaction.</li><li>Real bets are built by Jupiter and signed in your wallet. Oddz never holds your money or your positions.</li><li>The odds on props are the crowd's real calls. The odds on real markets are Polymarket's live prices.</li><li>Oddz is independent. It is not affiliated with Rockstar Games, Take-Two, Polymarket or Jupiter. Prediction markets carry risk, and nothing here is financial advice.</li></ul></div>`; }
// ---------------------------------------------------------------- the desk (owner wallet only)
function renderDesk() { if (!isAdmin()) { $('#desk').innerHTML = '<div class="empty">Desk wallet only.</div>'; return; } const q = ($('#dq').value || '').toLowerCase();
  const L = S.props.filter(p => !q || p.q.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  $('#desk').innerHTML = L.map(p => { const s = set(p.id), pc = pcts(p);
    return `<div class="desk-row"><b class="mono">${p.id}</b><div class="q">${esc(p.q)}<br><small class="mono" style="color:var(--faint)">${status(p)} · ${pc.n} calls${s && typeof s.r === 'number' ? ' · settled: ' + esc(p.o[s.r]) : s && s.r === 'void' ? ' · void' : ''}${s && s.lock ? ' · locked' : ''}</small></div>
      <select data-r="${p.id}">${p.o.map((o, i) => `<option value="${i}">${esc(o)}</option>`).join('')}<option value="V">VOID</option><option value="L">LOCK</option><option value="U">UNLOCK</option></select>
      <input data-src="${p.id}" placeholder="source link (https://…)"><div class="acts"><button class="sbtn g" data-go="${p.id}">sign</button></div></div>`; }).join('');
  $$('#desk [data-go]').forEach(b => b.onclick = () => settle(b.dataset.go)); }
$('#dq').oninput = renderDesk;
const isAdmin = () => !!(S.wallet && S.board?.admin && S.wallet === S.board.admin);
async function settle(id) { const p = S.byId[id]; const r = $(`[data-r="${id}"]`).value, src = $(`[data-src="${id}"]`).value.trim(); const label = r === 'V' ? 'VOID' : r === 'L' ? 'LOCK' : r === 'U' ? 'UNLOCK' : p.o[+r];
  if (/^\d+$/.test(r) && !/^https?:\/\//.test(src)) return toast('add a source link first', 1);
  try { const ts = Date.now(); const msg = `oddz settle\nprop: ${id}\nresult: ${label}\nsource: ${src || '-'}\ntime: ${ts}`; const sg = await S.prov.signMessage(new TextEncoder().encode(msg), 'utf8');
    await post('/api/settle', { wallet: S.wallet, id, r, src, ts, sig: b58(new Uint8Array(sg?.signature || sg)) }); toast(`${id}: ${label}`); await loadBoard(); renderDesk(); } catch (e) { toast(e.message || 'cancelled', 1); } }
// ---------------------------------------------------------------- the ticker, the strip, the feed for the street
function renderTicker() { const items = []; for (const e of (S.real?.events || [])) for (const m of e.markets.slice(0, e.markets.length > 1 ? 3 : 1)) items.push(`<span data-go="real"><span class="q">${esc(e.markets.length > 1 ? e.title + ' · ' + m.title : e.title)}</span><span class="y">YES ${cents(m.yes)}</span><span class="nn">NO ${cents(m.no)}</span></span>`);
  const top = S.props.filter(p => ['open', 'soon'].includes(status(p))).map(p => ({ p, n: pcts(p) })).filter(x => x.n.n).sort((a, b) => b.n.n - a.n.n).slice(0, 10);
  for (const { p, n } of top) { const i = n.v.indexOf(Math.max(...n.v)); items.push(`<span data-go="board"><span class="c">PROP</span><span class="q">${esc(p.q)}</span><span class="y">${n.v[i]}% ${esc(p.o[i])}</span></span>`); }
  if (!items.length) return; $('#tickR').innerHTML = items.join('') + items.join(''); $$('#tickR [data-go]').forEach(s => s.onclick = () => tab(s.dataset.go)); }
function renderStrip() { const open = S.props.filter(p => ['open', 'soon'].includes(status(p))).length; $('#sOpen').textContent = open; $('#nProps').textContent = open;
  const t = S.board?.totals; if (t) { countUp($('#sCalls'), t.calls); countUp($('#sCallers'), t.callers); countUp($('#sParl'), t.parlays || 0); }
  const ev = S.real?.events || []; $('#nReal').textContent = ev.length || '—'; if (ev.length) countUp($('#sVol'), ev.reduce((a, e) => a + (e.vol || 0), 0), money);
  $('#nMine').textContent = (S.board?.mine || []).length + (S.board?.myParlays || []).length + (S.pos?.list?.length || 0); $('#deskTab').hidden = !isAdmin(); }
function feedStreet() { let real = []; for (const e of (S.real?.events || [])) for (const m of e.markets) real.push({ q: e.markets.length > 1 ? `${e.title.replace(/\?$/, '')}: ${m.title}` : e.title, yes: m.yes, no: m.no, ev: e.id, s: (e.vol || 0) * (1 - Math.min(1, Math.abs((m.yes ?? .5) - .5) * 2)) });
  const live = real.filter(r => r.yes > .04 && r.yes < .96); real = (live.length >= 4 ? live : real).sort((a, b) => b.s - a.s); const seen = new Set(); real = real.filter(r => { if (seen.has(r.ev) && real.length > 8) return false; seen.add(r.ev); return true; });
  const props = S.props.filter(p => ['open', 'soon'].includes(status(p))).map(p => { const n = pcts(p); const i = n.n ? n.v.indexOf(Math.max(...n.v)) : -1; return { q: p.q, pct: i >= 0 ? n.v[i] : null, pick: i >= 0 ? p.o[i].toUpperCase().slice(0, 8) : '', n: n.n }; }).sort((a, b) => b.n - a.n).slice(0, 6);
  dispatchEvent(new CustomEvent('oddz:feed', { detail: { real: real.slice(0, 6), props } })); }
// ---------------------------------------------------------------- loads
async function loadProps() { const j = await api('/props.json'); S.props = j.props; S.cats = j.cats; S.byId = Object.fromEntries(j.props.map(p => [p.id, p])); }
async function loadBoard() { try { S.board = await api('/api/board' + (S.wallet ? '?wallet=' + S.wallet : '')); } catch (e) { S.board = S.board || { sets: {}, counts: {}, leaders: [], recent: [], mine: [], totals: null }; }
  renderStrip(); renderTicker(); feedStreet(); pops(); if (['board', 'live', 'slip', 'leaders', 'desk'].includes(S.tab)) render(); }
function pops() { const R = S.board?.recent || []; if (!R.length) return; const top = R[0].ts; if (!S.lastSeen) { S.lastSeen = top; return; } const fresh = R.filter(c => c.ts > S.lastSeen && c.wallet !== S.wallet).slice(0, 2); S.lastSeen = Math.max(S.lastSeen, top);
  for (const c of fresh.reverse()) { const p = S.byId[c.id]; if (!p) continue; const d = document.createElement('div'); d.className = 'pop'; d.innerHTML = `${esc(short(c.wallet))} called <b>${esc(p.o[c.oi])}</b><small>${esc(p.q)}</small>`; $('#pops').appendChild(d); setTimeout(() => d.remove(), 5200); } }
function countUp(el, v, fmt = x => Math.round(x).toLocaleString()) { if (!el) return; const a = +el.dataset.v || 0; el.dataset.v = v; if (a === v) { el.textContent = fmt(v); return; } const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(a + (v - a) * e); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
async function loadReal() { try { const j = await api('/api/markets'); S.real = { events: j.events || [], error: j.error || null }; } catch (e) { S.real = { events: S.real?.events || [], error: e.message }; }
  renderStrip(); renderTicker(); feedStreet(); if (S.tab === 'real') renderReal(); }
async function loadNews() { try { S.news = (await api('/api/news')).items || []; if (S.tab === 'live') renderLive(); } catch (_) {} }
// ---------------------------------------------------------------- wallets
function wallets() { const L = []; const ph = window.phantom?.solana; if (ph?.isPhantom) L.push({ id: 'phantom', name: 'Phantom', p: ph });
  if (window.solflare?.isSolflare) L.push({ id: 'solflare', name: 'Solflare', p: window.solflare }); if (window.backpack?.connect) L.push({ id: 'backpack', name: 'Backpack', p: window.backpack });
  if (!L.length && window.solana?.connect) L.push({ id: 'injected', name: 'Solana wallet', p: window.solana }); return L; }
function closeModals() { $$('.modal').forEach(m => m.classList.remove('on')); }
$$('[data-x]').forEach(b => b.onclick = closeModals); $$('.modal').forEach(m => m.onclick = e => { if (e.target === m) closeModals(); });
function connect() { return new Promise(res => { const L = wallets(); const box = $('#wList'); const u = encodeURIComponent(location.href), ref = encodeURIComponent(location.origin);
  box.innerHTML = L.length ? L.map((w, i) => `<button class="wopt" data-i="${i}">${w.name}<span>detected</span></button>`).join('') : `<div class="mnote">No Solana wallet in this browser. Get <a href="https://phantom.app" target="_blank" rel="noopener"><u>Phantom</u></a>, <a href="https://solflare.com" target="_blank" rel="noopener"><u>Solflare</u></a> or <a href="https://backpack.app" target="_blank" rel="noopener"><u>Backpack</u></a>.<br><br>On a phone: <a href="https://phantom.app/ul/browse/${u}?ref=${ref}"><u>open in Phantom</u></a> · <a href="https://solflare.com/ul/v1/browse/${u}?ref=${ref}"><u>open in Solflare</u></a></div>`;
  $$('.wopt', box).forEach(b => b.onclick = async () => { const w = L[+b.dataset.i]; try { const r = await w.p.connect(); const pk = (r?.publicKey || w.p.publicKey)?.toString(); if (!pk) throw new Error('no public key');
    S.wallet = pk; S.prov = w.p; store.set('oddz:w', w.id); closeModals(); walletUI(); loadBoard(); loadPos(); toast('connected ' + short(pk)); res(true); } catch (e) { toast(e.message || 'connection cancelled', 1); res(false); } });
  $('#mWal').classList.add('on'); }); }
async function disconnect() { try { await S.prov?.disconnect?.(); } catch (_) {} S.wallet = null; S.prov = null; S.pos = null; store.set('oddz:w', ''); walletUI(); loadBoard(); toast('disconnected'); }
function walletUI() { const on = !!S.wallet; $('#wal').classList.toggle('on', on); $('#hconn').classList.toggle('on', on); $('#walT').textContent = on ? short(S.wallet) : 'connect'; $('#hconn span').textContent = on ? short(S.wallet) : 'connect wallet'; renderStrip(); if (S.tab === 'slip') renderSlip(); }
(async () => { const id = store.get('oddz:w'); if (!id) return; await new Promise(r => setTimeout(r, 500)); const w = wallets().find(x => x.id === id); if (!w) return; try { const r = await w.p.connect({ onlyIfTrusted: true }); const pk = (r?.publicKey || w.p.publicKey)?.toString(); if (pk) { S.wallet = pk; S.prov = w.p; walletUI(); loadBoard(); loadPos(); } } catch (_) {} })();
// ---------------------------------------------------------------- a free call: the slip, the signature, MISSION PASSED
function slip(id, oi) { const p = S.byId[id]; if (!p) return; if (!['open', 'soon'].includes(status(p))) return toast('this prop is closed', 1); if (myCall(id)) return toast('you already called this one', 1);
  S.call = { id, oi }; const pc = pcts(p), cat = S.cats.find(c => c.id === p.c);
  $('#slip').innerHTML = `ODDZ · FREE CALL · ${esc(p.id)}<hr>${esc((cat?.name || '').toUpperCase())}<br>${esc(p.q)}<div class="big">${esc(p.o[oi])}</div>crowd: ${pc.v[oi] == null ? 'nobody yet, you set the line' : pc.v[oi] + '% on this answer'}<br>closes ${new Date(Date.parse(p.closes)).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}<br>stake: free · pays 100 × the crowd's odds`;
  $('#mCall').classList.add('on'); }
$('#sign').onclick = async () => { if (!S.call) return; if (!S.wallet && !(await connect())) return; const { id, oi } = S.call, p = S.byId[id]; const btn = $('#sign'); btn.disabled = true; btn.textContent = 'check your wallet…';
  try { if (!S.prov?.signMessage) throw new Error('this wallet cannot sign messages'); const ts = Date.now(); const msg = `oddz call\nprop: ${id}\npick: ${p.o[oi]}\ntime: ${ts}`;
    const r = await S.prov.signMessage(new TextEncoder().encode(msg), 'utf8'); const sig = b58(new Uint8Array(r?.signature || r));
    await post('/api/call', { wallet: S.wallet, id, oi, ts, sig }); closeModals(); passed('CALL PLACED!', `${p.o[oi]} · ${p.q}`); await loadBoard(); setTimeout(() => share(p, oi), 2600); }
  catch (e) { toast(e.message || 'cancelled', 1); } finally { btn.disabled = false; btn.textContent = 'sign the call'; } };
function passed(h, t) { const m = $('#mp'); $('#mp h4').textContent = h; $('#mpT').textContent = t; m.classList.remove('on'); void m.offsetWidth; m.classList.add('on'); }
function share(p, oi) { const cv = $('#card'), g = cv.getContext('2d'), W = 1200, Hh = 675; const gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, '#2a0f3e'); gr.addColorStop(1, '#0b0718'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
  g.fillStyle = 'rgba(255,63,164,.2)'; g.beginPath(); g.arc(W * .88, Hh * .05, 400, 0, 7); g.fill(); g.fillStyle = 'rgba(25,227,255,.1)'; g.beginPath(); g.arc(W * .1, Hh * 1.05, 330, 0, 7); g.fill();
  g.fillStyle = '#fff6f2'; g.beginPath(); g.moveTo(96, 62); g.arc(96, 102, 40, -Math.PI / 2, Math.PI / 2, true); g.closePath(); g.fill(); g.beginPath(); g.moveTo(104, 74); g.arc(104, 102, 28, -Math.PI / 2, Math.PI / 2); g.closePath(); g.fill();
  g.font = '900 64px RB'; g.fillText('Oddz', 150, 124); g.font = '700 22px JB'; g.globalAlpha = .65; g.fillText('THE ODDZ ON EVERYTHING IN GTA VI', 72, 186); g.globalAlpha = 1;
  g.font = '700 40px RB'; const words = p.q.split(' '); let line = '', y = 280; for (const w of words) { if (g.measureText(line + w).width > 1040) { g.fillText(line, 72, y); y += 52; line = ''; } line += w + ' '; } g.fillText(line, 72, y);
  g.font = '900 150px RB'; g.fillStyle = p.o.length === 2 ? (oi === 0 ? '#2fe0a8' : '#ff5f98') : '#ffc65a'; let pick = p.o[oi]; g.fillText(pick.length > 12 ? pick.slice(0, 12) : pick, 64, y + 175);
  g.fillStyle = '#fff6f2'; g.font = '600 26px JB'; g.fillText(`${p.id} · free call · settled with a source`, 72, 630);
  $('#dl').onclick = () => { const a = document.createElement('a'); a.download = `oddz-${p.id}.png`; a.href = cv.toDataURL('image/png'); a.click(); };
  $('#tw').href = 'https://x.com/intent/post?text=' + encodeURIComponent(`I called it: ${p.o[oi].toUpperCase()}\n${p.q}\n\nthe oddz on everything in GTA VI\n${location.origin}`); $('#mShare').classList.add('on'); }
// ---------------------------------------------------------------- real bets: SOL -> USDC (Jupiter swap) -> position (Jupiter prediction)
const JUP = 'https://lite-api.jup.ag', USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', WSOL = 'So11111111111111111111111111111111111111112';
let W3 = null; function web3() { if (W3) return W3; W3 = new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/assets/web3.min.js'; s.onload = () => res(window.solanaWeb3); s.onerror = () => rej(new Error('could not load the transaction library')); document.head.appendChild(s); }); return W3; }
async function jfetch(path, o) { const r = await fetch(JUP + path, o); const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch (_) {} if (!r.ok) throw new Error(j.message || j.error || j.msg || (r.status === 403 ? 'Jupiter blocks this region' : 'Jupiter ' + r.status)); return j; }
async function usdcBal(w) { const r = await rpc('getTokenAccountsByOwner', [w, { mint: USDC }, { encoding: 'jsonParsed' }]); return (r?.value || []).reduce((a, x) => a + (+x.account.data.parsed.info.tokenAmount.amount || 0), 0); }
async function signSend(b64) { const { VersionedTransaction } = await web3(); const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)); const tx = VersionedTransaction.deserialize(bin);
  if (!S.prov?.signAndSendTransaction) throw new Error('this wallet cannot send transactions'); const r = await S.prov.signAndSendTransaction(tx); const sig = typeof r === 'string' ? r : r?.signature; if (!sig) throw new Error('no signature returned'); return typeof sig === 'string' ? sig : b58(sig); }
async function confirm(sig, ms = 75000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { await new Promise(r => setTimeout(r, 1600)); try { const v = (await rpc('getSignatureStatuses', [[sig], { searchTransactionHistory: false }]))?.value?.[0]; if (v?.err) throw new Error('transaction failed on-chain'); if (v && ['confirmed', 'finalized'].includes(v.confirmationStatus)) return true; } catch (e) { if (/failed/.test(e.message)) throw e; } } throw new Error('not confirmed yet: check your wallet history'); }
function openBet(ei, mid, side) { const e = S.real.events[ei], m = e.markets.find(x => x.id === mid); if (!m) return; S.bet = { e, m, side, q: null };
  $('#betT').textContent = e.title; $('#betS').textContent = (e.markets.length > 1 ? m.title + ' · ' : '') + 'Polymarket via Jupiter · signed in your wallet'; $('#betR').textContent = m.rules || 'See the market on Polymarket.';
  $$('#mBet .seg button').forEach(b => b.classList.toggle('on', b.dataset.side === side)); betUI(); $('#mBet').classList.add('on'); betChart(m); }
async function betChart(m) { const el = $('#betC'); el.innerHTML = '<small>YES PRICE · 7 DAYS</small>'; if (!m.tok) return; try { if (!S.hist[m.tok]?.length) S.hist[m.tok] = (await api(`/api/hist?t=${m.tok}&i=1w`)).h || []; const h = S.hist[m.tok]; if (S.bet?.m !== m) return; el.innerHTML = `<small>YES PRICE · 7 DAYS · ${cents(h[0]?.[1])} → ${cents(h[h.length - 1]?.[1])}</small>` + spark(h, 400, 110, true); } catch (_) {} }
$$('#mBet .seg button').forEach(b => b.onclick = () => { if (!S.bet) return; S.bet.side = b.dataset.side; $$('#mBet .seg button').forEach(x => x.classList.toggle('on', x === b)); betUI(); });
$$('#mBet .amt button').forEach(b => b.onclick = () => { $('#betA').value = b.dataset.a; betUI(); }); $('#betA').oninput = () => betUI();
let quoteT = 0; function betUI(steps) { const B = S.bet; if (!B) return; const usd = Math.max(0, +$('#betA').value || 0), px = B.side === 'y' ? B.m.yes : B.m.no; const c = px ? usd / px : 0;
  $('#betKV').innerHTML = `<span>price</span><b>${cents(px)} per contract</b><span>contracts (about)</span><b>${c ? c.toFixed(2) : '—'}</b><span>pays if ${B.side === 'y' ? 'YES' : 'NO'}</span><b class="up">${c ? money(c) : '—'}</b><span>you pay</span><b id="solNeed">${usd >= 5 ? money(usd) + ' in USDC' : 'min $5'}</b>`;
  $('#betSteps').innerHTML = (steps || [['swap SOL to USDC (skipped if you already hold USDC)', ''], ['open the position on Jupiter', ''], ['confirmed on Solana', '']]).map(([t, s]) => `<li class="${s}"><i>${s === 'done' ? '✓' : s === 'now' ? '…' : '·'}</i>${esc(t)}</li>`).join('');
  $('#betGo').disabled = usd < 5; $('#betGo').textContent = S.wallet ? `bet ${money(usd)} on ${B.side === 'y' ? 'YES' : 'NO'}` : 'connect wallet';
  clearTimeout(quoteT); if (usd >= 5) quoteT = setTimeout(async () => { try { const q = await jfetch(`/swap/v1/quote?inputMint=${WSOL}&outputMint=${USDC}&amount=${Math.round(usd * 1e6)}&swapMode=ExactOut&slippageBps=100`); const el = $('#solNeed'); if (el && S.bet === B) el.textContent = `${money(usd)} ≈ ${(+q.inAmount / 1e9).toFixed(4)} SOL`; } catch (_) {} }, 350); }
$('#betGo').onclick = async () => { const B = S.bet; if (!B) return; if (!S.wallet && !(await connect())) return; const usd = +$('#betA').value || 0; if (usd < 5) return toast('minimum is $5', 1);
  const btn = $('#betGo'); btn.disabled = true; const need = Math.round(usd * 1e6); const st = [['swap SOL to USDC', 'now'], ['open the position on Jupiter', ''], ['confirmed on Solana', '']]; betUI(st);
  try { // 1. enough USDC? if not, swap exactly the missing amount from SOL
    let have = 0; try { have = await usdcBal(S.wallet); } catch (_) {}
    if (have < need) { btn.textContent = 'swap: check your wallet…'; const out = need - have + 20000; const q = await jfetch(`/swap/v1/quote?inputMint=${WSOL}&outputMint=${USDC}&amount=${out}&swapMode=ExactOut&slippageBps=100`);
      const sw = await jfetch('/swap/v1/swap', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quoteResponse: q, userPublicKey: S.wallet, wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true, prioritizationFeeLamports: { priorityLevelWithMaxLamports: { maxLamports: 400000, priorityLevel: 'high' } } }) });
      const s1 = await signSend(sw.swapTransaction); btn.textContent = 'swapping…'; await confirm(s1); }
    st[0][1] = 'done'; st[1][1] = 'now'; betUI(st); btn.disabled = true;
    // 2. the order: Jupiter builds it against the live Polymarket book
    btn.textContent = 'bet: check your wallet…'; const o = await jfetch('/prediction/v1/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ownerPubkey: S.wallet, marketId: B.m.id, isYes: B.side === 'y', isBuy: true, depositAmount: String(need), depositMint: USDC }) });
    const s2 = await signSend(o.transaction); st[1][1] = 'done'; st[2][1] = 'now'; betUI(st); btn.disabled = true; btn.textContent = 'confirming…'; await confirm(s2); st[2][1] = 'done'; betUI(st);
    closeModals(); passed('BET PLACED!', `${B.side === 'y' ? 'YES' : 'NO'} · ${money(usd)} · ${B.e.title}`); setTimeout(loadPos, 4000); setTimeout(loadPos, 15000); }
  catch (e) { toast(e.message || 'cancelled', 1); betUI(); } finally { btn.disabled = false; } };
// positions
async function loadPos() { if (!S.wallet) return; try { const j = await jfetch(`/prediction/v1/positions?ownerPubkey=${S.wallet}`); const list = (j.data || []).map(x => { const micro = +x.avgPriceUsd > 1.5; const u = v => v == null ? 0 : (+v) / (micro ? 1e6 : 1);
    const cMicro = x.contractsMicro ? +x.contractsMicro / 1e6 : null; return { pubkey: x.pubkey, isYes: !!x.isYes, contracts: cMicro ?? (+x.contracts || 0), cost: u(x.totalCostUsd), claimable: !!x.claimable && !x.claimed, title: x.marketMetadata?.title || x.marketId, status: x.marketMetadata?.status || 'open', result: x.marketMetadata?.result || null }; });
    S.pos = { list }; } catch (e) { S.pos = { list: [], error: e.message }; } renderStrip(); if (S.tab === 'slip') renderSlip(); }
async function closePos(pk, how) { try { const j = how === 'sell' ? await jfetch(`/prediction/v1/positions/${pk}`, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ownerPubkey: S.wallet }) })
    : await jfetch(`/prediction/v1/positions/${pk}/claim`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ownerPubkey: S.wallet }) });
  const sig = await signSend(j.transaction); toast(how === 'sell' ? 'selling…' : 'claiming…'); await confirm(sig); toast(how === 'sell' ? 'sold' : 'claimed'); loadPos(); } catch (e) { toast(e.message || 'cancelled', 1); } }
// ---------------------------------------------------------------- ⌘K palette
let palItems = [], palSel = 0;
function pal() { $('#mPal').classList.add('on'); const q = $('#palq'); q.value = ''; palList(''); setTimeout(() => q.focus(), 30); }
function palList(q) { q = q.toLowerCase().trim(); const tabsI = [['props', 'board'], ['real money', 'real'], ['live', 'live'], ['my slip', 'slip'], ['leaderboard', 'leaders'], ['how it works', 'how']].map(([n, t]) => ({ k: 'tab', n, go: () => tab(t) }));
  const props = S.props.map(p => ({ k: p.id, n: p.q, go: () => { tab('board'); openProp(p.id); } }));
  const mk = (S.real?.events || []).map(e => ({ k: 'real', n: e.title, go: () => tab('real') }));
  const cmds = [{ k: 'cmd', n: 'connect wallet', go: () => connect() }, { k: 'cmd', n: 'back to the street', go: openHome }];
  palItems = [...tabsI, ...cmds, ...mk, ...props].filter(i => !q || i.n.toLowerCase().includes(q) || i.k.toLowerCase() === q).slice(0, 40); palSel = 0; drawPal(); }
function drawPal() { $('#palr').innerHTML = palItems.map((i, k) => `<div class="pi ${k === palSel ? 'on' : ''}" data-k="${k}"><span>${esc(i.n)}</span><small>${esc(i.k)}</small></div>`).join('') || '<div class="empty">nothing found</div>'; $$('#palr .pi').forEach(d => d.onclick = () => palGo(+d.dataset.k)); }
function palGo(k) { const i = palItems[k]; if (!i) return; closeModals(); if (!H.classList.contains('term')) openTerm(); i.go(); }
$('#palq').oninput = e => palList(e.target.value);
$('#palq').onkeydown = e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, Math.min(palItems.length - 1, palSel + (e.key === 'ArrowDown' ? 1 : -1))); drawPal(); } if (e.key === 'Enter') palGo(palSel); if (e.key === 'Escape') closeModals(); };
// ---------------------------------------------------------------- the command line
const HELP = 'call <id> <answer> · open <id> · star <id> · parlay · hot · bet <#> yes|no <usd> · find <text> · cat <story|crew|secrets|rides|streams|records|music|online|launch> · props · real · live · slip · leaders · how · connect · home';
const hist = []; let hi = -1;
function run(line) { const a = line.trim().split(/\s+/), c0 = (a[0] || '').toLowerCase(), out = m => $('#cmdO').textContent = m; if (!c0) return; hist.unshift(line); hi = -1;
  const T = { props: 'board', board: 'board', real: 'real', money: 'real', live: 'live', slip: 'slip', mine: 'slip', leaders: 'leaders', leaderboard: 'leaders', how: 'how', help2: 'how', desk: 'desk' };
  if (c0 === 'help' || c0 === '?') return out(HELP); if (T[c0]) { tab(T[c0]); return out('→ ' + c0); } if (c0 === 'home') { openHome(); return; } if (c0 === 'connect') { connect(); return; }
  if (c0 === 'find') { tab('board'); S.q = a.slice(1).join(' '); $('#q').value = S.q; renderGrid(); return out(filtered().length + ' props'); }
  if (c0 === 'cat') { const c = S.cats.find(x => x.id.startsWith((a[1] || '').toLowerCase())); if (!c) return out('unknown category'); tab('board'); S.cat = c.id; renderCats(); renderGrid(); return out('→ ' + c.name); }
  if (c0 === 'open') { const p = S.byId[(a[1] || '').toUpperCase()]; if (!p) return out('open <prop id>'); openProp(p.id); return out(''); }
  if (c0 === 'star') { const p = S.byId[(a[1] || '').toUpperCase()]; if (!p) return out('star <prop id>'); toggleStar(p.id); return out(S.star.has(p.id) ? 'starred ' + p.id : 'unstarred ' + p.id); }
  if (c0 === 'parlay') { tab('board'); setPmode(!S.pmode); return out(S.pmode ? 'parlay mode on' : 'parlay mode off'); }
  if (c0 === 'hot') { tab('board'); S.f = 'hot'; $$('#p-board .bbar .chip[data-f]').forEach(x => x.classList.toggle('on', x.dataset.f === 'hot')); renderGrid(); return out('hot props'); }
  if (c0 === 'call') { const p = S.byId[(a[1] || '').toUpperCase()]; if (!p) return out('unknown prop id (e.g. ST01)'); const ans = a.slice(2).join(' ').toLowerCase(); const i = p.o.findIndex(o => o.toLowerCase() === ans || o.toLowerCase().startsWith(ans)); if (i < 0 || !ans) return out('answers: ' + p.o.join(' / ')); slip(p.id, i); return out(''); }
  if (c0 === 'bet') { const L = []; (S.real?.events || []).forEach((e, ei) => e.markets.forEach(m => L.push([ei, m]))); const n = +a[1]; const side = (a[2] || '').toLowerCase().startsWith('n') ? 'n' : 'y'; if (!n || !L[n - 1]) return out(`bet <1-${L.length}> yes|no <usd>`); tab('real'); openBet(L[n - 1][0], L[n - 1][1].id, side); if (+a[3]) { $('#betA').value = +a[3]; betUI(); } return out(''); }
  out('unknown command. type help'); }
$('#cmdI').onkeydown = e => { if (e.key === 'Enter') { run(e.target.value); e.target.value = ''; } if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.min(hist.length - 1, hi + 1); e.target.value = hist[hi]; } if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.max(-1, hi - 1); e.target.value = hi < 0 ? '' : hist[hi]; } if (e.key === 'Escape') e.target.blur(); };
// ---------------------------------------------------------------- keys
addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!H.classList.contains('term')) openTerm(); pal(); return; }
  if (e.target.matches && e.target.matches('input,select,textarea')) { if (e.key === 'Escape') e.target.blur(); return; } if ($('.modal.on')) { if (e.key === 'Escape') closeModals(); return; }
  const k = e.key.toLowerCase(); if (!H.classList.contains('term')) { if (k === 'enter') openTerm(); return; }
  if (k === 'escape') return openHome(); if (k === 'q' || k === 'e') { const L = TABS(), i = L.indexOf(S.tab); tab(L[(i + (k === 'e' ? 1 : L.length - 1)) % L.length]); return; }
  if (k === '/') { e.preventDefault(); tab('board'); $('#q').focus(); } if (k === ':' || k === '`') { e.preventDefault(); $('#cmdI').focus(); } });
// ---------------------------------------------------------------- parlays: 2 to 5 legs, one signature, every leg must hit
const legOdds = (id, oi) => { const c = counts(id); const n = c ? c.reduce((x, y) => x + y, 0) : 0, w = c ? c[oi] : 0; return n && w ? Math.min(20, n / w) : 2; };
function toggleLeg(id, oi) { const i = S.legs.findIndex(l => l.id === id); if (i >= 0 && S.legs[i].oi === oi) S.legs.splice(i, 1); else if (i >= 0) S.legs[i].oi = oi; else { if (S.legs.length >= 5) return toast('5 legs max', 1); S.legs.push({ id, oi }); } renderGrid(); renderDock(); }
function renderDock() { const d = $('#dock'); if (!S.pmode && !S.legs.length) { d.classList.remove('on'); return; } d.classList.add('on'); const m = S.legs.reduce((x, l) => x * legOdds(l.id, l.oi), 1);
  d.innerHTML = `<h4>Parlay slip <small>${S.legs.length}/5 legs</small></h4>${S.legs.length ? S.legs.map((l, i) => { const p = S.byId[l.id]; return `<div class="lg"><span>${esc(p.o[l.oi])} · <span style="color:var(--dim)">${esc(p.q)}</span></span><b>${legOdds(l.id, l.oi).toFixed(1)}×</b><button data-rm="${i}" title="remove">×</button></div>`; }).join('') : '<div class="mnote" style="padding:8px 0">Tap answers on 2 to 5 different props.</div>'}
    <div class="tot"><span>combined odds</span><b>${S.legs.length >= 2 ? m.toFixed(1) + '×' : '—'}</b></div><div class="tot" style="margin-top:-6px"><span>pays if every leg hits</span><b class="up">${S.legs.length >= 2 ? Math.min(10000, Math.round(100 * m)).toLocaleString() + ' pts' : '—'}</b></div>
    <div class="row2"><button class="gob" id="pclr">clear</button><button class="gob pink" id="psign" ${S.legs.length >= 2 ? '' : 'disabled'}>sign parlay</button></div>`;
  $$('[data-rm]', d).forEach(b => b.onclick = () => { S.legs.splice(+b.dataset.rm, 1); renderGrid(); renderDock(); }); $('#pclr').onclick = () => { S.legs = []; setPmode(false); }; $('#psign').onclick = signParlay; }
async function signParlay() { if (S.legs.length < 2) return; if (!S.wallet && !(await connect())) return; const btn = $('#psign'); btn.disabled = true; btn.textContent = 'check your wallet…';
  try { if (!S.prov?.signMessage) throw new Error('this wallet cannot sign messages'); const ts = Date.now(), legs = S.legs.map(l => ({ id: l.id, oi: l.oi }));
    const msg = `oddz parlay\nlegs: ${legs.map(l => l.id + '=' + S.byId[l.id].o[l.oi]).join(' | ')}\ntime: ${ts}`; const r = await S.prov.signMessage(new TextEncoder().encode(msg), 'utf8');
    await post('/api/parlay', { wallet: S.wallet, legs, ts, sig: b58(new Uint8Array(r?.signature || r)) }); const m = legs.reduce((x, l) => x * legOdds(l.id, l.oi), 1);
    passed('PARLAY PLACED!', `${legs.length} legs · ${m.toFixed(1)}× · ${Math.min(10000, Math.round(100 * m)).toLocaleString()} pts if it all hits`); S.legs = []; setPmode(false); loadBoard(); }
  catch (e) { toast(e.message || 'cancelled', 1); if ($('#psign')) { $('#psign').disabled = false; $('#psign').textContent = 'sign parlay'; } } }
// ---------------------------------------------------------------- a prop, up close
async function openProp(id, keep) { const p = S.byId[id]; if (!p) return; const cat = S.cats.find(c => c.id === p.c) || {}; const box = $('#propBox');
  const draw = extra => { const st = status(p), s = set(p.id), mc = myCall(p.id), pc = pcts(p), c = counts(p.id) || p.o.map(() => 0), live = st === 'open' || st === 'soon';
    box.innerHTML = `<button class="x" data-x>×</button><div class="mh" style="margin-top:0;color:${cat.color}">${esc(cat.name || '')} · ${p.id}</div><h3 style="font-size:26px;line-height:1.15;margin:4px 0 10px">${esc(p.q)}</h3>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${{ open: `<span class="badge open">open · closes in ${dur(Date.parse(p.closes) - Date.now())}</span>`, soon: `<span class="badge soon">closes in ${dur(Date.parse(p.closes) - Date.now())}</span>`, closed: `<span class="badge closed">closed · settling</span>`, set: `<span class="badge set">settled: ${esc(p.o[s?.r])}</span>`, void: `<span class="badge void">void</span>` }[st]}
      <button class="chip ${S.star.has(p.id) ? 'on' : ''}" id="pStar">${S.star.has(p.id) ? '★ starred' : '☆ star'}</button>${s?.src ? `<a class="chip" href="${esc(s.src)}" target="_blank" rel="noopener">source ↗</a>` : ''}</div>
      <div class="mh">the crowd · ${pc.n} call${pc.n === 1 ? '' : 's'}${extra?.parlays ? ' · in ' + extra.parlays + ' parlay' + (extra.parlays === 1 ? '' : 's') : ''}</div>
      <div class="dist" style="--cc:${cat.color}">${p.o.map((o, i) => `<div class="dr ${s && s.r === i ? 'win' : ''} ${mc && mc.oi === i ? 'me' : ''}"><span>${esc(o)}</span><em>${pc.v[i] == null ? '—' : pc.v[i] + '%'} · ${c[i]} · pays ${(legOdds(p.id, i) * 100).toFixed(0)} pts</em><div class="bar2"><i style="width:${pc.v[i] || 0}%"></i></div></div>`).join('')}</div>
      ${live && !mc ? `<div class="mh">call it, free</div><div class="pbtns">${p.o.map((o, i) => `<button class="gob ${p.o.length === 2 ? (i ? '' : 'pink') : ''}" data-call="${i}">${esc(o)}</button>`).join('')}</div>` : ''}
      ${live ? `<div class="pbtns">${p.o.map((o, i) => `<button class="sbtn" data-leg="${i}">＋ parlay: ${esc(o)}</button>`).join('')}</div>` : ''}
      <div class="mh">how it settles</div><p class="mnote" style="margin:0">${esc(p.s || cat.s || '')}</p><p class="mnote" style="margin:8px 0 0;color:var(--faint)">Closes ${new Date(Date.parse(p.closes)).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} your time. One call per wallet.</p>
      <div class="mh">latest callers</div><div class="callers">${extra ? (extra.callers.length ? extra.callers.slice(0, 20).map(c => `<div><span class="wl" data-w="${esc(c.wallet)}">${esc(short(c.wallet))}</span><b>${esc(p.o[c.oi])}</b><span style="color:var(--faint)">${ago(c.ts)} ago</span></div>`).join('') : '<div style="color:var(--faint)">nobody yet. set the line.</div>') : '<div style="color:var(--faint)">loading…</div>'}</div>`;
    $('[data-x]', box).onclick = closeModals; $('#pStar').onclick = () => toggleStar(p.id); $$('[data-call]', box).forEach(b => b.onclick = () => { closeModals(); slip(p.id, +b.dataset.call); });
    $$('[data-leg]', box).forEach(b => b.onclick = () => { closeModals(); if (!S.pmode) setPmode(true); toggleLeg(p.id, +b.dataset.leg); }); bindLinks($('.callers', box)); };
  if (!keep) $$('.modal').forEach(m => m.classList.remove('on')); draw(null); $('#mProp').classList.add('on');
  try { const j = await api('/api/board?prop=' + id + (S.wallet ? '&wallet=' + S.wallet : '')); if ($('#mProp.on')) draw(j.prop); } catch (_) {} }
// ---------------------------------------------------------------- a caller's profile
async function openProfile(w) { const box = $('#profBox'); closeModals(); box.innerHTML = `<button class="x" data-x>×</button><h3>${esc(short(w))}</h3><p class="sub">loading…</p>`; $('[data-x]', box).onclick = closeModals; $('#mProf').classList.add('on');
  try { const j = await api('/api/board?profile=' + w); const P = j.profile || {}; const calls = P.calls || [];
    box.innerHTML = `<button class="x" data-x>×</button><h3 class="mono" style="font-size:18px">${esc(short(w))} <span class="tier ${P.tier || 'rookie'}">${P.tier || 'rookie'}</span></h3><p class="sub"><a href="https://solscan.io/account/${esc(w)}" target="_blank" rel="noopener"><u>view wallet on solscan</u></a></p>
      <div class="me-card" style="padding:0;margin:0 0 14px"><div><span>rank</span><b>${P.rank ? '#' + P.rank : '—'}</b></div><div><span>points</span><b>${(P.pts || 0).toLocaleString()}</b></div><div><span>won / lost</span><b>${P.won || 0} / ${P.lost || 0}</b></div><div><span>parlays</span><b>${P.parlaysWon || 0}/${P.parlays || 0}</b></div><div><span>streak</span><b>${P.best || 0}</b></div></div>
      <div class="mh">calls</div><div class="callers">${calls.length ? calls.slice(0, 60).map(c => { const p = S.byId[c.id]; return p ? `<div><span class="wl" data-open="${p.id}" style="flex:1;margin-right:10px">${esc(p.q)}</span><b>${esc(p.o[c.oi])}</b><span class="badge ${c.status === 'won' ? 'set' : c.status === 'lost' || c.status === 'void' ? 'void' : 'open'}" style="margin-left:8px">${c.status}</span></div>` : ''; }).join('') : '<div style="color:var(--faint)">no calls yet</div>'}</div>`;
    $('[data-x]', box).onclick = closeModals; bindLinks(box); } catch (e) { box.innerHTML = `<button class="x" data-x>×</button><h3>${esc(short(w))}</h3><p class="sub">${esc(e.message)}</p>`; $('[data-x]', box).onclick = closeModals; } }
// ---------------------------------------------------------------- go
(async () => { try { await loadProps(); } catch (e) { toast('could not load props', 1); } dataOk = true; progress(); renderCats(); renderGrid(); renderStrip(); clock(); setInterval(clock, 1000);
  loadBoard(); loadReal(); loadNews(); setInterval(loadBoard, 15000); setInterval(loadReal, 30000); setInterval(loadNews, 600000); setInterval(() => { if (S.wallet) loadPos(); }, 60000); })();
