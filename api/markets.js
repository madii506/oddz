// the real-money side: every live GTA VI market on Polymarket that Jupiter's prediction API can trade, with live prices
const L = require('./_lib');
const J = 'https://lite-api.jup.ag/prediction/v1';
const QUERIES = ['gta', 'gta vi', 'grand theft auto', 'kai cenat gta', 'jason lucia'];
const ok = e => /\bgta\b|grand theft auto/i.test((e.metadata && e.metadata.title) || '') || (e.tags || []).includes('gta-vi');
const usd = v => v == null ? null : +v / 1e6;
module.exports = async (req, res) => { try {
  const out = await L.cached('markets', 30000, async () => {
    const lists = await Promise.allSettled(QUERIES.map(q => L.getJSON(`${J}/events/search?query=${encodeURIComponent(q)}&includeMarkets=true`, { timeout: 8000 })));
    if (lists.every(l => l.status === 'rejected')) throw new Error(lists[0].reason && lists[0].reason.message || 'jupiter unavailable');
    const seen = new Map();
    for (const l of lists) if (l.status === 'fulfilled') for (const e of (l.value && l.value.data) || []) { if (!e || !e.eventId || seen.has(e.eventId) || !ok(e) || !e.isActive) continue;
      const m = (e.metadata || {}); seen.set(e.eventId, { id: e.eventId, title: (m.title || '').replace(/\s+\?$/, '?').trim(), slug: m.slug || null, img: m.imageUrl || null, closes: m.closeTime || null,
        vol: usd(e.volumeUsd), vol24: usd(e.volume24hr), cat: e.category || null,
        markets: (e.markets || []).filter(k => k.status === 'open').map(k => { const pr = k.pricing || {}; return { id: k.marketId, title: k.title, status: k.status, closes: k.closeTime ? k.closeTime * 1000 : null,
          yes: usd(pr.buyYesPriceUsd), no: usd(pr.buyNoPriceUsd), sellYes: usd(pr.sellYesPriceUsd), sellNo: usd(pr.sellNoPriceUsd), vol: pr.volume || null, rules: (k.rulesPrimary || '').slice(0, 900) }; })
          .sort((a, b) => (b.yes || 0) - (a.yes || 0)) }); }
    const events = [...seen.values()].filter(e => e.markets.length).sort((a, b) => (b.vol || 0) - (a.vol || 0));
    return { events, at: Date.now() }; });
  L.send(res, 200, out, 15);
} catch (e) { L.send(res, 502, { error: String(e.message || e), events: [] }); } };
