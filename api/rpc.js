// read-only RPC relay for the browser: balances, token accounts, signature status, blockhash
const L = require('./_lib');
const RPCS = [process.env.RPC_URL, 'https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'].filter(Boolean);
const OK = new Set(['getSignatureStatuses', 'getBalance', 'getTokenAccountsByOwner', 'getLatestBlockhash']);
module.exports = async (req, res) => { try {
  const b = await L.body(req); if (!OK.has(b.method) || !Array.isArray(b.params || [])) return L.send(res, 400, { error: 'method not allowed' });
  let err; for (const u of RPCS) { try { const j = await L.getJSON(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: b.method, params: b.params || [] }), timeout: 8000 }); return L.send(res, 200, j); } catch (e) { err = e; } }
  throw err; } catch (e) { L.send(res, 502, { error: String(e.message || e) }); } };
