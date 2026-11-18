// GTA VI headlines from Google News RSS
const L = require('./_lib');
const dec = s => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
module.exports = async (req, res) => { try {
  const out = await L.cached('news', 600000, async () => {
    const r = await fetch('https://news.google.com/rss/search?q=%22GTA+6%22+OR+%22GTA+VI%22+OR+%22Grand+Theft+Auto+VI%22&hl=en-US&gl=US&ceid=US:en', { headers: { 'user-agent': 'Mozilla/5.0 oddz' } });
    if (!r.ok) throw new Error('news ' + r.status); const x = await r.text();
    const items = [...x.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => { const g = t => (m[1].match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1] || '';
      const src = dec(g('source')); let title = dec(g('title')); if (src && title.endsWith(' - ' + src)) title = title.slice(0, -(src.length + 3));
      return { title, url: dec(g('link')), src, ts: Date.parse(g('pubDate')) || 0 }; }).filter(i => i.title && i.url).sort((a, b) => b.ts - a.ts).slice(0, 24);
    return { items }; });
  L.send(res, 200, out, 300); } catch (e) { L.send(res, 502, { error: String(e.message || e), items: [] }); } };
