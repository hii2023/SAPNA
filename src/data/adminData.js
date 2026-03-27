// ============================================================
// ADMIN DATA UTILITY
// All pages read from here so admin edits reflect site-wide.
// Data is stored in localStorage as JSON overrides.
// ============================================================
import { products as defaultProducts } from './products'
import { galleryItems as defaultGallery } from './gallery'

const KEYS = {
  products: 'sapna_admin_products',
  profile:  'sapna_admin_profile',
  gallery:  'sapna_admin_gallery',
  password: 'sapna_admin_password',
  auth:     'sapna_admin_auth',
}

const DEFAULT_PASSWORD = 'sapna2024'

// ── Auth ──────────────────────────────────────────────────
export function isAdminLoggedIn() {
  return sessionStorage.getItem(KEYS.auth) === 'true'
}
export function adminLogin(password) {
  const stored = localStorage.getItem(KEYS.password) || DEFAULT_PASSWORD
  if (password === stored) {
    sessionStorage.setItem(KEYS.auth, 'true')
    return true
  }
  return false
}
export function adminLogout() {
  sessionStorage.removeItem(KEYS.auth)
}
export function getAdminPassword() {
  return localStorage.getItem(KEYS.password) || DEFAULT_PASSWORD
}
export function setAdminPassword(newPw) {
  localStorage.setItem(KEYS.password, newPw)
}

// ── Products ──────────────────────────────────────────────
export function getProducts() {
  try {
    const stored = localStorage.getItem(KEYS.products)
    if (stored) return JSON.parse(stored)
  } catch (_) {}
  return defaultProducts
}
export function saveProducts(products) {
  localStorage.setItem(KEYS.products, JSON.stringify(products))
}
export function resetProducts() {
  localStorage.removeItem(KEYS.products)
}

// ── Profile ───────────────────────────────────────────────
export const DEFAULT_PROFILE = {
  name:       'Sapna',
  tagline:    'Handcrafted with Love & Wanderlust',
  location:   'Ahmedabad, Gujarat, India',
  phone:      '+91 85113 41910',
  email:      'hello@sapnaart.studio',
  whatsapp:   '918511341910',
  instagram:  'art_wt_sapna',
  photo:      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
  bio:        'I\'m Sapna — a textile artist, painter, and wanderer based in Ahmedabad, Gujarat. I pour my travel memories and love for craft into every macrame wall hanging, painting, embroidery piece, and DIY kit I create.',
  longBio:    'Every journey I take becomes a piece of art. From the sand dunes of Rajasthan to the misty peaks of the Himalayas, I bring those textures, colours, and stories home — and weave them into pieces that carry a little magic for you. I started Sapna\'s Art Studio from a small corner of my home in Ahmedabad, and it has grown into a beautiful community of art lovers across India.',
  studioYear: '2018',
}
export function getProfile() {
  try {
    const stored = localStorage.getItem(KEYS.profile)
    if (stored) return { ...DEFAULT_PROFILE, ...JSON.parse(stored) }
  } catch (_) {}
  return DEFAULT_PROFILE
}
export function saveProfile(profile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}
export function resetProfile() {
  localStorage.removeItem(KEYS.profile)
}

// ── Gallery ───────────────────────────────────────────────
export function getGallery() {
  try {
    const stored = localStorage.getItem(KEYS.gallery)
    if (stored) return JSON.parse(stored)
  } catch (_) {}
  return defaultGallery
}
export function saveGallery(gallery) {
  localStorage.setItem(KEYS.gallery, JSON.stringify(gallery))
}
export function resetGallery() {
  localStorage.removeItem(KEYS.gallery)
}
