// ============================================================
// ADMIN DATA UTILITY
// All pages read from here so admin edits reflect site-wide.
//
// Source of truth is now Supabase (table `sapna_content`).
// On app start we hydrate() from Supabase into a local cache
// (localStorage), so the synchronous getters below stay
// synchronous and existing pages need no changes. Admin edits
// are saved to Supabase via a passcode-gated RPC and go live
// for every visitor, on every device.
// ============================================================
import { products as defaultProducts, categories as defaultCategories, themes as defaultThemes } from './products'
import { galleryItems as defaultGallery } from './gallery'
import { projects as defaultProjects } from './projects'
import { workshops as defaultWorkshops } from './workshops'
import { blogPosts as defaultBlog } from './blog'
import { recycleProducts as defaultRecycle } from './recycle'
import { customOrdersContent as defaultCustomOrders } from './customOrders'
import { SITE_IMAGE_DEFAULTS } from './siteImages'
import { sbGet, sbRpc } from './supabase'

const KEYS = {
  products:   'sapna_admin_products',
  profile:    'sapna_admin_profile',
  gallery:    'sapna_admin_gallery',
  projects:   'sapna_admin_projects',
  siteImages: 'sapna_admin_site_images',
  workshops:  'sapna_admin_workshops',
  categories: 'sapna_admin_categories',
  themes:     'sapna_admin_themes',
  blog:       'sapna_admin_blog',
  recycle:    'sapna_admin_recycle',
  customOrders: 'sapna_admin_custom_orders',
  passcode:   'sapna_admin_passcode', // per-session, so saves can pass it
  auth:       'sapna_admin_auth',
}

// ── Local cache helpers ───────────────────────────────────
function cacheGet(key) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (_) {}
  return null
}
function cacheSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch (_) {}
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
    if (map.workshops)  cacheSet(KEYS.workshops,  map.workshops)
    if (map.categories) cacheSet(KEYS.categories, map.categories)
    if (map.themes)     cacheSet(KEYS.themes,     map.themes)
    if (map.blog)       cacheSet(KEYS.blog,       map.blog)
    if (map.recycle)    cacheSet(KEYS.recycle,    map.recycle)
    if (map.customOrders) cacheSet(KEYS.customOrders, map.customOrders)
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

// ── Generic save to a content section ─────────────────────
async function saveSection(key, data) {
  await sbRpc('sapna_save_content', {
    p_passcode: currentPasscode(), p_key: key, p_data: data,
  })
  cacheSet(KEYS[key], data)
}

// ── Products ──────────────────────────────────────────────
export function getProducts() {
  return cacheGet(KEYS.products) || defaultProducts
}
export async function saveProducts(products) {
  await saveSection('products', products)
}
export async function resetProducts() {
  await saveProducts(JSON.parse(JSON.stringify(defaultProducts)))
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
  photo:      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
  bio:        'I\'m Sapna — an artist, painter, and wanderer based in Ahmedabad, Gujarat. I pour my travel memories and love for craft into every macrame wall hanging, painting, embroidery piece, and DIY kit I create.',
  longBio:    'Every journey I take becomes a piece of art. From the sand dunes of Rajasthan to the misty peaks of the Himalayas, I bring those textures, colours, and stories home — and weave them into pieces that carry a little magic for you. I started Sapna\'s Art Studio from a small corner of my home in Ahmedabad, and it has grown into a beautiful community of art lovers across India.',
  studioYear: '2018',
}
export function getProfile() {
  const stored = cacheGet(KEYS.profile)
  return stored ? { ...DEFAULT_PROFILE, ...stored } : DEFAULT_PROFILE
}
export async function saveProfile(profile) {
  await saveSection('profile', profile)
}
export async function resetProfile() {
  await saveProfile({ ...DEFAULT_PROFILE })
}

// ── Gallery ───────────────────────────────────────────────
export function getGallery() {
  return cacheGet(KEYS.gallery) || defaultGallery
}
export async function saveGallery(gallery) {
  await saveSection('gallery', gallery)
}
export async function resetGallery() {
  await saveGallery(JSON.parse(JSON.stringify(defaultGallery)))
}

// ── Projects ──────────────────────────────────────────────
export function getProjects() {
  return cacheGet(KEYS.projects) || defaultProjects
}
export async function saveProjects(projects) {
  await saveSection('projects', projects)
}
export async function resetProjects() {
  await saveProjects(JSON.parse(JSON.stringify(defaultProjects)))
}

// ── Site images (fixed section photos) ────────────────────
// Stored as a { slotKey: url } map of overrides. Any slot not
// overridden falls back to its built-in default from siteImages.js.
export function getSiteImages() {
  return cacheGet(KEYS.siteImages) || {}
}
export async function saveSiteImages(map) {
  await saveSection('siteImages', map)
}
// Resolve a single slot to its current URL (override or default).
export function getSiteImage(key) {
  const overrides = getSiteImages()
  return (overrides && overrides[key]) || SITE_IMAGE_DEFAULTS[key] || ''
}

// ── Workshops ─────────────────────────────────────────────
export function getWorkshops() {
  return cacheGet(KEYS.workshops) || defaultWorkshops
}
export async function saveWorkshops(items) {
  await saveSection('workshops', items)
}
export async function resetWorkshops() {
  await saveWorkshops(JSON.parse(JSON.stringify(defaultWorkshops)))
}

// ── Shop categories ───────────────────────────────────────
export function getCategories() {
  return cacheGet(KEYS.categories) || defaultCategories
}
export async function saveCategories(items) {
  await saveSection('categories', items)
}
export async function resetCategories() {
  await saveCategories(JSON.parse(JSON.stringify(defaultCategories)))
}

// ── Shop themes ───────────────────────────────────────────
export function getThemes() {
  return cacheGet(KEYS.themes) || defaultThemes
}
export async function saveThemes(items) {
  await saveSection('themes', items)
}
export async function resetThemes() {
  await saveThemes(JSON.parse(JSON.stringify(defaultThemes)))
}

// ── Journal (blog) ────────────────────────────────────────
export function getBlog() {
  return cacheGet(KEYS.blog) || defaultBlog
}
export async function saveBlog(items) {
  await saveSection('blog', items)
}
export async function resetBlog() {
  await saveBlog(JSON.parse(JSON.stringify(defaultBlog)))
}

// ── Recycle products ──────────────────────────────────────
export function getRecycle() {
  return cacheGet(KEYS.recycle) || defaultRecycle
}
export async function saveRecycle(items) {
  await saveSection('recycle', items)
}
export async function resetRecycle() {
  await saveRecycle(JSON.parse(JSON.stringify(defaultRecycle)))
}

// ── Custom Orders page (intro + process text) ─────────────
export function getCustomOrders() {
  const stored = cacheGet(KEYS.customOrders)
  return stored ? { ...defaultCustomOrders, ...stored } : defaultCustomOrders
}
export async function saveCustomOrders(data) {
  await saveSection('customOrders', data)
}
export async function resetCustomOrders() {
  await saveCustomOrders(JSON.parse(JSON.stringify(defaultCustomOrders)))
}
