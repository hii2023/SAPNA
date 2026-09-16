// ============================================================
// LEADS / INQUIRIES
// Every form submission is saved to Supabase (so no inquiry is
// ever lost) and, best-effort, emailed to Sapna via FormSubmit.
// The admin "Inquiries" tab reads them back.
// ============================================================
import { sbRpc } from './supabase'

const NOTIFY_EMAIL = 'sapnakm71@gmail.com'

function pass() {
  try { return sessionStorage.getItem('sapna_admin_passcode') || '' } catch (_) { return '' }
}

// Best-effort email to Sapna (FormSubmit). The first email needs a one-time
// activation click from Sapna's inbox; after that it just works.
async function notifyByEmail(rec) {
  try {
    await fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `New ${rec.type || 'inquiry'} from sapna.space`,
        Type: rec.type || 'inquiry',
        Name: rec.name || '', Email: rec.email || '', Phone: rec.phone || '',
        City: rec.city || '', Budget: rec.budget || '', Timeline: rec.timeline || '',
        Message: rec.message || '',
      }),
    })
  } catch (_) {}
}

// Save an inquiry (custom order / general). Never throws to the caller.
export async function submitLead(lead) {
  const rec = { type: 'inquiry', ...lead }
  try { await sbRpc('sapna_add_lead', { p: rec }) } catch (_) {}
  notifyByEmail(rec).catch(() => {})
  return true
}

// A workshop booking request. Saved first so the booking exists even if the
// person never gets as far as opening WhatsApp.
export async function submitBooking(booking) {
  return submitLead({ type: 'booking', ...booking })
}

export async function subscribeNewsletter(email, source = 'site') {
  const rec = { type: 'newsletter', email, meta: { source } }
  try { await sbRpc('sapna_add_lead', { p: rec }) } catch (_) {}
  notifyByEmail(rec).catch(() => {})
  return true
}

// Admin (passcode-gated) reads/updates.
export async function listLeads() {
  return sbRpc('sapna_list_leads', { p_passcode: pass() })
}
export async function updateLeadStatus(id, status) {
  await sbRpc('sapna_update_lead', { p_passcode: pass(), p_id: id, p_status: status })
}
