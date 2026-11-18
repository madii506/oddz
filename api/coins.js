// the trenches: every real GTA coin on Solana right now, from Jupiter's token search (real market, real holders, organic trading; copies of a bigger coin dropped)
const L = require('./_lib');
const JUP = 'https://lite-api.jup.ag/tokens/v2/search?query=';
const QUERIES = ['gta', 'gta 6', 'gta vi', 'vice city', 'lucia', 'leonida', 'rockstar', 'grand theft'];
const WORDS = /\bgta|gta ?(6|vi)\b|grand ?theft ?auto|vice ?city|lucia|leonida|rockstar|jason ?duval|hesoyam|los ?santos/i;
const BAD = /anthropic|good ?to ?ape|\bscam\b|\btest\b/i;
function quality(t) { const a = t.audit || {}; const name = `${t.name} ${t.symbol}`; const mc = t.mcap || 0, liq = t.liquidity || 0, h = t.holderCount || 0, s24 = t.stats24h || {}, org = t.organicScore || 0;
  if (!WORDS.test(name) || BAD.test(name) || a.isSus) return false;
  if (mc < 15000 || h < 100 || liq < 3000) return false;
  if (liq > mc * .6 && h < 2000) return false;
  if (org < 10 && h < 20000) return false;
  if (org < 25 && !(h >= 2000 && (s24.numTraders || 0) >= 200)) return false;
  return true; }
const norm = t => { const s24 = t.stats24h || {}, s1 = t.stats1h || {}, s5 = t.stats5m || {};
  return { mint: t.id, name: t.name, symbol: t.symbol, icon: t.icon || null, pad: t.launchpad || null, mcap: t.mcap || 0, liq: t.liquidity || 0, holders: t.holderCount || 0, price: t.usdPrice || 0,
    ch5m: s5.priceChange ?? null, ch1h: s1.priceChange ?? null, ch24h: s24.priceChange ?? null, vol24h: (s24.buyVolume || 0) + (s24.sellVolume || 0), buys24h: s24.numBuys || 0, sells24h: s24.numSells || 0, traders24h: s24.numTraders || 0,
    created: t.createdAt || (t.firstPool && t.firstPool.createdAt) || null, grad: !!t.graduatedAt, twitter: t.twitter || null, website: t.website || null, organic: Math.round(t.organicScore || 0) }; };
module.exports = async (req, res) => { try {
  const out = await L.cached('coins', 45000, async () => {
    const seen = new Map(); let ok = 0;
    for (let i = 0; i < QUERIES.length; i += 2) { const part = await Promise.allSettled(QUERIES.slice(i, i + 2).map(q => L.getJSON(JUP + encodeURIComponent(q), { timeout: 8000 })));
      for (const l of part) if (l.status === 'fulfilled' && Array.isArray(l.value)) { ok++; for (const t of l.value) if (t && t.id && !seen.has(t.id) && quality(t)) seen.set(t.id, norm(t)); } }
    if (!ok) throw new Error('jupiter unavailable');
    const all = [...seen.values()].sort((a, b) => b.mcap - a.mcap), big = new Map(), coins = [];
    for (const c of all) { const k = (c.symbol + '|' + c.name).toLowerCase().replace(/[^a-z0-9|$]/g, ''); const top = big.get(k); if (top && c.mcap < top * .25) continue; if (!top) big.set(k, c.mcap); coins.push(c); }
    return { coins: coins.slice(0, 60), at: Date.now(), partial: ok < QUERIES.length };
  });
  L.send(res, 200, out, 20);
} catch (e) { L.send(res, 502, { error: String(e.message || e), coins: [] }); } };
