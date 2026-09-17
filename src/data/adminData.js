// ============================================================
// ADMIN DATA UTILITY
// All pages read from here so admin edits reflect site-wide.
//
// Source of truth is Supabase (table `sapna_content`). On app
// start we hydrate() from Supabase into an in-memory store (and
// mirror it to localStorage for a fast first paint), so the
// synchronous getters below stay synchronous and existing pages
// need no changes. Admin edits are saved to Supabase via a
// passcode-gated RPC and go live for every visitor, on every
// device.
//
// Photos live in the `sapna-images` Storage bucket and the JSON
// carries only their URLs — see uploadEmbeddedImages() below for
// why embedding them as base64 broke saving.
// ============================================================
import { products as defaultProducts, categories as defaultCategories, themes as defaultThemes } from './products'
import { galleryItems as defaultGallery } from './gallery'
import { projects as defaultProjects } from './projects'
import { workshops as defaultWorkshops } from './workshops'
import { blogPosts as defaultBlog } from './blog'
import { recycleProducts as defaultRecycle } from './recycle'
import { customOrdersContent as defaultCustomOrders } from './customOrders'
import { videos as defaultVideos } from './videos'
import { SITE_IMAGE_DEFAULTS } from './siteImages'
import { SITE_TEXT_DEFAULTS } from './siteText'
import { sbGet, sbRpc, sbUpload } from './supabase'

const KEYS = {
  products:   'sapna_admin_products',
  profile:    'sapna_admin_profile',
  gallery:    'sapna_admin_gallery',
  projects:   'sapna_admin_projects',
  siteImages: 'sapna_admin_site_images',
  siteText:   'sapna_admin_site_text',
  workshops:  'sapna_admin_workshops',
  categories: 'sapna_admin_categories',
  themes:     'sapna_admin_themes',
  blog:       'sapna_admin_blog',
  recycle:    'sapna_admin_recycle',
  customOrders: 'sapna_admin_custom_orders',
  videos:     'sapna_admin_videos',
  passcode:   'sapna_admin_passcode', // per-session, so saves can pass it
  auth:       'sapna_admin_auth',
}

// ── Local cache helpers ───────────────────────────────────
// `mem` is the real source of truth once hydrate() has run. localStorage is
// only a best-effort cache so the first paint after a reload has content
// before Supabase answers.
//
// It must not be the source of truth: localStorage is capped (~5 MB) and
// setItem throws once that is reached. Writing straight through to it meant a
// full cache silently dropped later sections — the admin would save a photo,
// the write would fail, the getter would fall back to the code defaults and
// the edit looked like it never happened. Different browsers (and incognito)
// filled up at different points, so pages disagreed about which photo was
// current. Keeping the truth in memory makes a storage failure cosmetic.
const mem = {}

function cacheGet(key) {
  if (key in mem) return mem[key]
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const val = JSON.parse(stored)
      mem[key] = val
      return val
    }
  } catch (_) {}
  return null
}
function cacheSet(key, val) {
  mem[key] = val // always wins, and cannot fail
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (_) {
    // Out of quota or storage disabled. Drop any older copy so a later read
    // cannot resurrect stale content, then carry on from memory.
    try { localStorage.removeItem(key) } catch (_) {}
  }
}

// ── Hydration: pull latest published content from Supabase ─
// Called once at app startup (see App.jsx). Writes into the
// local cache so the synchronous getters return live data.
export async function hydrate() {
  try {
    const rows = await sbGet('sapna_content?select=key,data')
    const map = {}
    for (const row of rows || []) map[row.key] = row.data
    if (map.products)   cacheSet(KEYS.products,   map.products)
    if (map.profile)    cacheSet(KEYS.profile,    map.profile)
    if (map.gallery)    cacheSet(KEYS.gallery,    map.gallery)
    if (map.projects)   cacheSet(KEYS.projects,   map.projects)
    if (map.siteImages) cacheSet(KEYS.siteImages, map.siteImages)
    if (map.siteText)   cacheSet(KEYS.siteText,   map.siteText)
    if (map.workshops)  cacheSet(KEYS.workshops,  map.workshops)
    if (map.categories) cacheSet(KEYS.categories, map.categories)
    if (map.themes)     cacheSet(KEYS.themes,     map.themes)
    if (map.blog)       cacheSet(KEYS.blog,       map.blog)
    if (map.recycle)    cacheSet(KEYS.recycle,    map.recycle)
    if (map.customOrders) cacheSet(KEYS.customOrders, map.customOrders)
    if (map.videos)     cacheSet(KEYS.videos,     map.videos)
    return true
  } catch (_) {
    // Offline / first run: keep whatever is cached (or code defaults).
    return false
  }
}

// ── Auth ──────────────────────────────────────────────────
export function isAdminLoggedIn() {
  return sessionStorage.getItem(KEYS.auth) === 'true'
}
// Verifies the passcode server-side (RPC), so login works on any device.
export async function adminLogin(passcode) {
  try {
    const ok = await sbRpc('sapna_check_pass', { p_passcode: passcode })
    if (ok === true) {
      sessionStorage.setItem(KEYS.auth, 'true')
      try { sessionStorage.setItem(KEYS.passcode, passcode) } catch (_) {}
      return true
    }
  } catch (_) {}
  return false
}
export function adminLogout() {
  sessionStorage.removeItem(KEYS.auth)
  sessionStorage.removeItem(KEYS.passcode)
}
function currentPasscode() {
  return sessionStorage.getItem(KEYS.passcode) || ''
}
// Change the admin passcode (verifies the current one server-side).
export async function changeAdminPassword(current, next) {
  await sbRpc('sapna_set_pass', { p_passcode: current, p_new: next })
  try { sessionStorage.setItem(KEYS.passcode, next) } catch (_) {}
  return true
}

// ── Publishing images ─────────────────────────────────────
// The editors hold a freshly picked photo as a base64 data URL so the preview
// is instant. Published content must not: base64 bloated the content JSON to
// ~7.7 MB, which blew the localStorage quota above and made every visitor
// download megabytes before the first image appeared.
//
// So before saving, walk the payload and swap each embedded image for the
// Storage URL it uploads to. `cache` maps a data URL to the URL it became, so
// the same photo is only sent once. Object *keys* are remapped through the
// same cache too: crop rectangles are stored keyed by the photo's URL, and if
// the key and the value resolved to different uploads the crop would be
// orphaned and the site would silently fall back to a centred crop.
async function uploadEmbeddedImages(value, label, cache = {}) {
  if (typeof value === 'string') {
    if (!value.startsWith('data:image/')) return value
    if (cache[value]) return cache[value]
    const url = await sbUpload(currentPasscode(), label, value)
    cache[value] = url
    return url
  }
  if (Array.isArray(value)) {
    const out = []
    for (const item of value) out.push(await uploadEmbeddedImages(item, label, cache))
    return out
  }
  if (value && typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value)) {
      const nv = await uploadEmbeddedImages(value[k], `${label}-${k}`, cache)
      const nk = k.startsWith('data:image/')
        ? await uploadEmbeddedImages(k, `${label}-key`, cache)
        : k
      out[nk] = nv
    }
    return out
  }
  return value
}

// Count embedded images without uploading, so the UI can say what it is doing.
export function countEmbeddedImages(value, seen = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/') && !seen.has(value)) { seen.add(value); return 1 }
    return 0
  }
  if (Array.isArray(value)) return value.reduce((n, v) => n + countEmbeddedImages(v, seen), 0)
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce(
      (n, k) => n + countEmbeddedImages(k, seen) + countEmbeddedImages(value[k], seen), 0)
  }
  return 0
}

// ── Generic save to a content section ─────────────────────
// Returns the published payload (images now Storage URLs) so callers can put
// it back into their editor state and avoid re-uploading on the next save.
async function saveSection(key, data) {
  const payload = await uploadEmbeddedImages(data, `sapna-${key}`)
  await sbRpc('sapna_save_content', {
    p_passcode: currentPasscode(), p_key: key, p_data: payload,
  })
  cacheSet(KEYS[key], payload)
  return payload
}

// ── Products ──────────────────────────────────────────────
export function getProducts() {
  return cacheGet(KEYS.products) || defaultProducts
}
export async function saveProducts(products) {
  return await saveSection('products', products)
}
export async function resetProducts() {
  return await saveProducts(JSON.parse(JSON.stringify(defaultProducts)))
}

// ── Profile ───────────────────────────────────────────────
export const DEFAULT_PROFILE = {
  name:       'Sapna',
  tagline:    'Handcrafted with Love & Wanderlust',
  location:   'Ahmedabad, Gujarat, India',
  phone:      '+91 85113 41910',
  email:      'sapnakm71@gmail.com',
  whatsapp:   '918511341910',
  instagram:  'art_wt_sapna',
  // Full channel URL, or a @handle. Empty until Sapna has a channel;
  // every YouTube link on the site hides itself while it is blank.
  youtube:    '',
  photo:      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
  bio:        'I\'m Sapna, an artist, painter, and wanderer based in Ahmedabad, Gujarat. I pour my travel memories and love for craft into every macrame wall hanging, painting, embroidery piece, and DIY kit I create.',
  longBio:    'Every journey I take becomes a piece of art. From the sand dunes of Rajasthan to the misty peaks of the Himalayas, I bring those textures, colours, and stories home, and weave them into pieces that carry a little magic for you. I started Sapna\'s Art Studio from a small corner of my home in Ahmedabad, and it has grown into a beautiful community of art lovers across India.',
  studioYear: '2018',
}
export function getProfile() {
  const stored = cacheGet(KEYS.profile)
  return stored ? { ...DEFAULT_PROFILE, ...stored } : DEFAULT_PROFILE
}
export async function saveProfile(profile) {
  return await saveSection('profile', profile)
}
export async function resetProfile() {
  return await saveProfile({ ...DEFAULT_PROFILE })
}

// ── Gallery ───────────────────────────────────────────────
export function getGallery() {
  return cacheGet(KEYS.gallery) || defaultGallery
}
export async function saveGallery(gallery) {
  return await saveSection('gallery', gallery)
}
export async function resetGallery() {
  return await saveGallery(JSON.parse(JSON.stringify(defaultGallery)))
}

// ── Projects ──────────────────────────────────────────────
export function getProjects() {
  return cacheGet(KEYS.projects) || defaultProjects
}
export async function saveProjects(projects) {
  return await saveSection('projects', projects)
}
export async function resetProjects() {
  return await saveProjects(JSON.parse(JSON.stringify(defaultProjects)))
}

// ── Site images (fixed section photos) ────────────────────
// Stored as a { slotKey: url } map of overrides. Any slot not
// overridden falls back to its built-in default from siteImages.js.
export function getSiteImages() {
  return cacheGet(KEYS.siteImages) || {}
}
export async function saveSiteImages(map) {
  return await saveSection('siteImages', map)
}
// Resolve a single slot to its current URL (override or default).
export function getSiteImage(key) {
  const overrides = getSiteImages()
  return (overrides && overrides[key]) || SITE_IMAGE_DEFAULTS[key] || ''
}

// ── Site text (editable headings / labels / taglines) ─────
export function getSiteTexts() {
  return cacheGet(KEYS.siteText) || {}
}
export async function saveSiteTexts(map) {
  return await saveSection('siteText', map)
}
// Resolve one text slot: override, else built-in default.
export function getSiteText(key) {
  const o = getSiteTexts()
  const v = o && o[key]
  return (v !== undefined && v !== null && v !== '') ? v : (SITE_TEXT_DEFAULTS[key] || '')
}

// ── Workshops ─────────────────────────────────────────────
export function getWorkshops() {
  return cacheGet(KEYS.workshops) || defaultWorkshops
}
export async function saveWorkshops(items) {
  return await saveSection('workshops', items)
}
export async function resetWorkshops() {
  return await saveWorkshops(JSON.parse(JSON.stringify(defaultWorkshops)))
}

// ── Shop categories ───────────────────────────────────────
export function getCategories() {
  return cacheGet(KEYS.categories) || defaultCategories
}
export async function saveCategories(items) {
  return await saveSection('categories', items)
}
export async function resetCategories() {
  return await saveCategories(JSON.parse(JSON.stringify(defaultCategories)))
}

// ── Shop themes ───────────────────────────────────────────
export function getThemes() {
  return cacheGet(KEYS.themes) || defaultThemes
}
export async function saveThemes(items) {
  return await saveSection('themes', items)
}
export async function resetThemes() {
  return await saveThemes(JSON.parse(JSON.stringify(defaultThemes)))
}

// ── Journal (blog) ────────────────────────────────────────
export function getBlog() {
  return cacheGet(KEYS.blog) || defaultBlog
}
export async function saveBlog(items) {
  return await saveSection('blog', items)
}
export async function resetBlog() {
  return await saveBlog(JSON.parse(JSON.stringify(defaultBlog)))
}

// ── Recycle products ──────────────────────────────────────
export function getRecycle() {
  return cacheGet(KEYS.recycle) || defaultRecycle
}
export async function saveRecycle(items) {
  return await saveSection('recycle', items)
}
export async function resetRecycle() {
  return await saveRecycle(JSON.parse(JSON.stringify(defaultRecycle)))
}

// ── Custom Orders page (intro + process text) ─────────────
export function getCustomOrders() {
  const stored = cacheGet(KEYS.customOrders)
  return stored ? { ...defaultCustomOrders, ...stored } : defaultCustomOrders
}
export async function saveCustomOrders(data) {
  return await saveSection('customOrders', data)
}
export async function resetCustomOrders() {
  return await saveCustomOrders(JSON.parse(JSON.stringify(defaultCustomOrders)))
}

// ── Videos (YouTube links) ────────────────────────────────
export function getVideos() {
  return cacheGet(KEYS.videos) || defaultVideos
}
export async function saveVideos(items) {
  return await saveSection('videos', items)
}
export async function resetVideos() {
  return await saveVideos(JSON.parse(JSON.stringify(defaultVideos)))
}

// Sapna may paste a full channel URL, a @handle or a bare name. Normalise all
// three to a usable URL; empty means "no channel", and callers hide the link.
export function getYoutubeUrl() {
  const raw = (getProfile().youtube || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('@')) return `https://youtube.com/${raw}`
  return `https://youtube.com/@${raw.replace(/^\/+/, '')}`
}
