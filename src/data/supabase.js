// ============================================================
// SUPABASE CLIENT (lightweight REST, no npm dependency)
// Same shared project used by Rumaliwala / CatCare / NOSH7.
// The publishable key is safe to ship in the browser bundle;
// all writes are gated server-side by a passcode-checked RPC.
// ============================================================
export const SB = {
  url: 'https://xoiksbtxoxrifkgvupqp.supabase.co',
  key: 'sb_publishable_UwUNp74KFKUlbqQ7aY0s7Q_toy7kUiD',
}

// Public read via PostgREST
export async function sbGet(path) {
  const r = await fetch(`${SB.url}/rest/v1/${path}`, {
    headers: { apikey: SB.key, Authorization: 'Bearer ' + SB.key },
  })
  if (!r.ok) throw new Error('fetch failed: ' + r.status)
  return r.json()
}

// Write / verify via SECURITY DEFINER RPC (passcode-checked server-side)
export async function sbRpc(fn, body) {
  const r = await fetch(`${SB.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SB.key,
      Authorization: 'Bearer ' + SB.key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  })
  const text = await r.text()
  if (!r.ok) throw new Error(text || 'request failed')
  try { return JSON.parse(text) } catch (_) { return text }
}
