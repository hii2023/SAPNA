import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  isAdminLoggedIn, adminLogin, adminLogout,
  getProducts, saveProducts, resetProducts,
  getProfile, saveProfile, resetProfile, DEFAULT_PROFILE,
  getGallery, saveGallery, resetGallery,
  getProjects, saveProjects, resetProjects,
  getSiteImages, saveSiteImages,
  getSiteTexts, saveSiteTexts, getSiteText,
  getWorkshops, saveWorkshops, resetWorkshops,
  getCategories, saveCategories, resetCategories,
  getBlog, saveBlog, resetBlog,
  getRecycle, saveRecycle, resetRecycle,
  getCustomOrders, saveCustomOrders, resetCustomOrders,
  getVideos, saveVideos, resetVideos,
  changeAdminPassword, countEmbeddedImages, waLink, SOCIAL_NETWORKS, resolveSocial,
} from '../data/adminData'
import { products as defaultProducts } from '../data/products'
import { galleryCategories, galleryItems as defaultGallery } from '../data/gallery'
import { projectCategories, projects as defaultProjects } from '../data/projects'
import { youtubeId, youtubePoster } from '../data/videos'
import { SITE_IMAGE_GROUPS } from '../data/siteImages'
import { SITE_TEXT_GROUPS } from '../data/siteText'
import { compressImage, fileToDataUrl, loadImage } from '../utils/image'
import { listLeads, updateLeadStatus } from '../data/leads'
import ImageCropModal from './ImageCropModal'
import './Admin.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

// Newly picked photos are uploaded to storage as part of saving, which on a
// phone connection is the slow part. Say so, otherwise the button just sits
// there and it looks like nothing happened.
function announceUpload(payload, onToast) {
  const n = countEmbeddedImages(payload)
  if (n > 0) onToast(`Uploading ${n} photo${n === 1 ? '' : 's'}…`, 'success')
}

// Turn a save failure into something the admin can act on.
function saveErrorMessage(err) {
  const msg = String((err && err.message) || '')
  if (/passcode/i.test(msg)) return 'Your session expired. Log out, log back in, then save again.'
  if (/too large/i.test(msg)) return 'One photo is too large (max 10 MB). Try a smaller one.'
  if (/Unsupported image type/i.test(msg)) return 'That image format is not supported. Use a JPG or PNG.'
  if (/upload/i.test(msg)) return 'A photo could not be uploaded. Check your connection and try again.'
  return 'Could not save. Check your connection and try again.'
}

// Profile and Inquiries now live inside the Settings tab as sub-pages, so
// they are intentionally left out of the main sidebar nav below.
const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: 'fas fa-tachometer-alt' },
  { id: 'products',  label: 'Products',   icon: 'fas fa-store' },
  { id: 'recycle',   label: 'Second Life',icon: 'fas fa-recycle' },
  { id: 'workshops', label: 'Workshops',  icon: 'fas fa-chalkboard-teacher' },
  { id: 'projects',  label: 'Projects',   icon: 'fas fa-drafting-compass' },
  { id: 'customOrders', label: 'Custom Orders', icon: 'fas fa-pen-fancy' },
  { id: 'shopSetup', label: 'Shop Setup', icon: 'fas fa-sliders-h' },
  { id: 'siteText',  label: 'Website Text', icon: 'fas fa-heading' },
  { id: 'siteImages',label: 'Website Photos', icon: 'fas fa-image' },
  { id: 'gallery',   label: 'Gallery',    icon: 'fas fa-images' },
  { id: 'videos',    label: 'Videos',     icon: 'fab fa-youtube' },
  { id: 'blog',      label: 'Journal',    icon: 'fas fa-feather-alt' },
  { id: 'settings',  label: 'Settings',   icon: 'fas fa-cog' },
]

// Read + downscale + compress so saved photos stay small (raw phone
// photos are several MB and make saving fail). Product/gallery/project/
// workshop/journal/recycle uploads all go through here.
const readFilesAsDataUrls = async (fileList) => {
  const files = Array.from(fileList || []).filter(file => file.type.startsWith('image/'))
  if (!files.length) return []
  return Promise.all(files.map(f => compressImage(f, { maxW: 1400, maxH: 1400, quality: 0.82 })))
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`admin-toast admin-toast-${type}`}>
      <i className={`fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`} />
      {msg}
    </div>
  )
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="admin-confirm-overlay">
      <div className="admin-confirm-box">
        <i className="fas fa-exclamation-triangle" />
        <p>{msg}</p>
        <div className="admin-confirm-btns">
          <button className="admin-btn admin-btn-danger" onClick={onConfirm}>Yes, Reset</button>
          <button className="admin-btn admin-btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Clickable thumbnail that opens the full photo in a fullscreen overlay.
// Drop-in replacement for an <img> preview in the admin panel.
function ZoomImg({ src, alt, className, ...rest }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`admin-zoomable${className ? ' ' + className : ''}`}
        onClick={() => { if (src) setOpen(true) }}
        {...rest}
      />
      {open && (
        <div className="admin-photo-lightbox" onClick={() => setOpen(false)}>
          <button className="admin-photo-lightbox-close" onClick={() => setOpen(false)} aria-label="Close">
            <i className="fas fa-times" />
          </button>
          <img src={src} alt={alt} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [show, setShow] = useState(false)

  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = await adminLogin(pw)
    setBusy(false)
    if (ok) {
      onLogin()
    } else {
      setErr(true)
      setPw('')
      setTimeout(() => setErr(false), 2000)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-logo">
          <div className="admin-logo-mark">S</div>
          <div>
            <span className="admin-logo-name">Sapna's Art Studio</span>
            <span className="admin-logo-sub">Admin Dashboard</span>
          </div>
        </div>
        <h2>Welcome back 🌸</h2>
        <p>Enter your admin password to manage your studio.</p>
        <form onSubmit={handleSubmit}>
          <div className={`admin-login-field ${err ? 'error' : ''}`}>
            <i className="fas fa-lock" />
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Admin password"
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)}>
              <i className={`fas fa-eye${show ? '-slash' : ''}`} />
            </button>
          </div>
          {err && <p className="admin-login-err"><i className="fas fa-times-circle" /> Incorrect password</p>}
          <button type="submit" className="admin-btn admin-btn-primary admin-login-submit">
            <i className="fas fa-sign-in-alt" /> Sign In
          </button>
        </form>
        <p className="admin-login-hint">Use your admin password to sign in.</p>
        <Link to="/" className="admin-back-link"><i className="fas fa-arrow-left" /> Back to website</Link>
      </div>
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ products, profile, gallery, projects, onTabChange }) {
  const available   = products.filter(p => p.available).length
  const soldOut     = products.filter(p => !p.available).length
  const newItems    = products.filter(p => p.isNew).length
  const bestsellers = products.filter(p => p.isBestseller).length

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <h2>Welcome back, {profile.name}! 🌸</h2>
        <p>Here's a quick overview of your studio.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card terracotta" onClick={() => onTabChange('products')}>
          <div className="admin-stat-icon"><i className="fas fa-box-open" /></div>
          <div className="admin-stat-body">
            <span className="admin-stat-num">{products.length}</span>
            <span className="admin-stat-label">Total Products</span>
          </div>
        </div>
        <div className="admin-stat-card sage" onClick={() => onTabChange('products')}>
          <div className="admin-stat-icon"><i className="fas fa-check-circle" /></div>
          <div className="admin-stat-body">
            <span className="admin-stat-num">{available}</span>
            <span className="admin-stat-label">Available</span>
          </div>
        </div>
        <div className="admin-stat-card gold" onClick={() => onTabChange('products')}>
          <div className="admin-stat-icon"><i className="fas fa-clock" /></div>
          <div className="admin-stat-body">
            <span className="admin-stat-num">{soldOut}</span>
            <span className="admin-stat-label">Sold Out</span>
          </div>
        </div>
        <div className="admin-stat-card blush" onClick={() => onTabChange('gallery')}>
          <div className="admin-stat-icon"><i className="fas fa-images" /></div>
          <div className="admin-stat-body">
            <span className="admin-stat-num">{gallery.length}</span>
            <span className="admin-stat-label">Gallery Items</span>
          </div>
        </div>
        <div className="admin-stat-card terracotta" onClick={() => onTabChange('projects')}>
          <div className="admin-stat-icon"><i className="fas fa-drafting-compass" /></div>
          <div className="admin-stat-body">
            <span className="admin-stat-num">{projects.length}</span>
            <span className="admin-stat-label">Projects</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-row">
        <div className="admin-quick-actions">
          <h3>Quick Actions</h3>
          <div className="admin-action-list">
            <button className="admin-action-item" onClick={() => onTabChange('products')}>
              <i className="fas fa-toggle-on" />
              <div>
                <strong>Toggle Availability</strong>
                <span>Mark products as sold out / available</span>
              </div>
              <i className="fas fa-chevron-right" />
            </button>
            <button className="admin-action-item" onClick={() => onTabChange('products')}>
              <i className="fas fa-tag" />
              <div>
                <strong>Update Prices</strong>
                <span>Change product prices instantly</span>
              </div>
              <i className="fas fa-chevron-right" />
            </button>
            <button className="admin-action-item" onClick={() => onTabChange('settings')}>
              <i className="fas fa-user-edit" />
              <div>
                <strong>Update Profile</strong>
                <span>Bio, photo, contact details</span>
              </div>
              <i className="fas fa-chevron-right" />
            </button>
            <button className="admin-action-item" onClick={() => onTabChange('gallery')}>
              <i className="fas fa-plus-circle" />
              <div>
                <strong>Add Gallery Photo</strong>
                <span>Add new pieces to your portfolio</span>
              </div>
              <i className="fas fa-chevron-right" />
            </button>
            <button className="admin-action-item" onClick={() => onTabChange('projects')}>
              <i className="fas fa-folder-plus" />
              <div>
                <strong>Add Project</strong>
                <span>Manage project details, categories, and photos</span>
              </div>
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>

        <div className="admin-products-overview">
          <h3>Product Status</h3>
          <div className="admin-overview-list">
            {products.slice(0, 8).map(p => (
              <div key={p.id} className="admin-overview-item">
                <img src={p.images[0]} alt={p.name} />
                <span className="admin-overview-name">{p.name}</span>
                <span className={`admin-avail-badge ${p.available ? 'avail' : 'sold'}`}>
                  {p.available ? 'Available' : 'Sold Out'}
                </span>
                <span className="admin-overview-price">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          {products.length > 8 && (
            <button className="admin-btn admin-btn-ghost" style={{ width: '100%', marginTop: '1rem' }} onClick={() => onTabChange('products')}>
              View all {products.length} products →
            </button>
          )}
        </div>
      </div>

      <div className="admin-whatsapp-tip">
        <i className="fab fa-whatsapp" />
        <div>
          <strong>WhatsApp linked to: +{profile.whatsapp}</strong>
          <span>All "Buy" buttons and contact links use this number. Update it in Profile → Contact.</span>
        </div>
        <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-whatsapp">
          Test Link
        </a>
      </div>
    </div>
  )
}

// ── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab({ products, onSave, onToast }) {
  // The categories Sapna has actually defined, so the dropdown and the filter
  // below always reflect the live Shop Setup rather than the code defaults.
  const liveCats = getCategories()
  const [items, setItems]         = useState(products)
  const [expandedId, setExpandedId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [filterAvail, setFilterAvail] = useState('all')
  const [search, setSearch]       = useState('')
  const [dirty, setDirty]         = useState(false)
  const [confirm, setConfirm]     = useState(false)

  const update = (id, field, value) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    setDirty(true)
  }

  const updateSizes = (id, val) => {
    const sz = val.split('\n').map(s => s.trim()).filter(Boolean)
    update(id, 'sizes', sz)
  }

  const handleImageUpload = async (id, fileList) => {
    try {
      const uploaded = await readFilesAsDataUrls(fileList)
      if (!uploaded.length) return
      update(id, 'images', uploaded)
      onToast('Product images uploaded. Save to publish changes.', 'success')
    } catch (_) {
      onToast('Could not upload product images. Please try again.', 'error')
    }
  }

  const moveImage = (productId, fromIndex, toIndex) => {
    const product = items.find(item => item.id === productId)
    if (!product) return
    const images = [...(product.images || [])]
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= images.length) return
    const [moved] = images.splice(fromIndex, 1)
    images.splice(toIndex, 0, moved)
    update(productId, 'images', images)
  }

  const removeImage = (productId, imageIndex) => {
    const product = items.find(item => item.id === productId)
    if (!product) return
    const images = product.images || []
    if (images.length <= 1) {
      onToast('At least one product image is required.', 'error')
      return
    }
    update(productId, 'images', images.filter((_, index) => index !== imageIndex))
    onToast('Product image removed. Save to publish changes.', 'success')
  }

  const handleSave = async () => {
    try {
      announceUpload(items, onToast)
      // saveProducts returns the published copy, with any newly added photo
      // now a Storage URL. Adopt it so the next save does not re-upload.
      const published = await saveProducts(items)
      setItems(published)
      onSave(published)
      setDirty(false)
      onToast('Products saved and now live on your website!', 'success')
    } catch (err) {
      onToast(saveErrorMessage(err), 'error')
    }
  }

  const handleReset = () => { setConfirm(true) }
  const doReset = async () => {
    try {
      await resetProducts()
      const fresh = JSON.parse(JSON.stringify(defaultProducts))
      setItems(fresh)
      onSave(fresh)
      setConfirm(false)
      setDirty(false)
      onToast('Products reset to defaults.', 'success')
    } catch (err) {
      setConfirm(false)
      onToast('Could not reset. Check your connection and try again.', 'error')
    }
  }

  const addProduct = () => {
    const newId = Math.max(...items.map(p => p.id)) + 1
    const newP = {
      id: newId,
      name: 'New Product',
      category: 'macrame',
      theme: 'homedecor',
      price: 1000,
      originalPrice: null,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
      size: 'Standard',
      sizes: ['Standard - ₹1,000'],
      available: true,
      isNew: true,
      isBestseller: false,
      description: 'Describe your product here.',
      materials: 'List materials here.',
      careInstructions: 'Add care instructions here.',
    }
    setItems(prev => [...prev, newP])
    setExpandedId(newId)
    setDirty(true)
    onToast('New product added, fill in the details and save.', 'success')
  }

  const deleteProduct = (id) => {
    setItems(prev => prev.filter(p => p.id !== id))
    setExpandedId(null)
    setDirty(true)
  }

  const filtered = items.filter(p => {
    const matchCat   = filterCat === 'all' ? true
      : filterCat === '__orphan' ? !liveCats.some(c => c.id === p.category)
      : p.category === filterCat
    const matchAvail = filterAvail === 'all'
      ? true : filterAvail === 'available' ? p.available : !p.available
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchAvail && matchSearch
  })

  return (
    <div className="admin-tab-content">
      {confirm && (
        <ConfirmModal
          msg="Reset all products to default? All your changes will be lost."
          onConfirm={doReset}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div className="admin-section-header">
        <div>
          <h2>Products</h2>
          <p>{items.length} products · {items.filter(p => p.available).length} available</p>
        </div>
        <div className="admin-header-actions">
          {dirty && (
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              <i className="fas fa-save" /> Save Changes
            </button>
          )}
          <button className="admin-btn admin-btn-sage" onClick={addProduct}>
            <i className="fas fa-plus" /> Add Product
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={handleReset}>
            <i className="fas fa-undo" /> Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-product-filters">
        <div className="admin-search-wrap">
          <i className="fas fa-search" />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {liveCats.filter(c => c.id !== 'all').map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
          <option value="__orphan">⚠ Not in any category</option>
        </select>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="soldout">Sold Out</option>
        </select>
      </div>

      {/* Product List */}
      <div className="admin-product-list">
        {filtered.map(product => (
          <div key={product.id} className={`admin-product-row ${expandedId === product.id ? 'expanded' : ''}`}>
            {/* Row Header */}
            <div className="admin-product-row-header" onClick={() => setExpandedId(product.id)}>
              <ZoomImg src={product.images[0]} alt={product.name} className="admin-product-thumb" />
              <div className="admin-product-row-info">
                <span className="admin-product-row-name">{product.name}</span>
                <div className="admin-product-row-meta">
                  <span className="admin-cat-chip">{product.category}</span>
                  {product.isNew && <span className="admin-tag-new">New</span>}
                  {product.isBestseller && <span className="admin-tag-best">⭐ Best</span>}
                </div>
              </div>
              <div className="admin-product-row-right">
                <span className="admin-product-row-price">₹{product.price.toLocaleString('en-IN')}</span>
                <label className="admin-toggle" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={product.available}
                    onChange={e => update(product.id, 'available', e.target.checked)}
                  />
                  <span className="admin-toggle-slider" />
                  <span className="admin-toggle-label">{product.available ? 'Available' : 'Sold Out'}</span>
                </label>
                <button className="admin-expand-btn" title="Edit product">
                  <i className="fas fa-pen" />
                </button>
              </div>
            </div>

            {/* Edit Form (popup) */}
            {expandedId === product.id && (
              <div className="admin-edit-modal-overlay" onClick={() => setExpandedId(null)}>
                <div className="admin-edit-modal" onClick={e => e.stopPropagation()}>
                  <div className="admin-edit-modal-header">
                    <h3>{product.name ? `Edit: ${product.name}` : 'New product'}</h3>
                    <button type="button" className="crop-x" onClick={() => setExpandedId(null)} aria-label="Close"><i className="fas fa-times" /></button>
                  </div>
                  <div className="admin-edit-modal-body">
              <div className="admin-product-edit">
                <div className="admin-edit-grid">
                  <div className="admin-field-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={e => update(product.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="admin-field-group">
                    <label>Category</label>
                    {/* Reads the live categories, not the built-in defaults: the old
                        dropdown listed categories that no longer existed, so a product
                        could not be moved to a newly created one. */}
                    <select value={product.category || ''} onChange={e => update(product.id, 'category', e.target.value)}>
                      {!liveCats.some(c => c.id === product.category) && (
                        <option value={product.category || ''}>
                          {product.category ? `${product.category} (no longer a category)` : 'Not set'}
                        </option>
                      )}
                      {liveCats.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    {!liveCats.some(c => c.id === product.category) && (
                      <p className="admin-field-err">
                        <i className="fas fa-exclamation-triangle" /> This product is not in any
                        current category, so it only shows under "All". Pick one above.
                      </p>
                    )}
                  </div>
                  <div className="admin-field-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={e => update(product.id, 'price', Number(e.target.value))}
                    />
                  </div>
                  <div className="admin-field-group">
                    <label>Original Price (₹) <small>leave blank if no discount</small></label>
                    <input
                      type="number"
                      value={product.originalPrice || ''}
                      placeholder="e.g. 3500"
                      onChange={e => update(product.id, 'originalPrice', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  <div className="admin-field-group">
                    <label>Size / Default Option</label>
                    <input
                      type="text"
                      value={product.size}
                      onChange={e => update(product.id, 'size', e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-field-group full">
                  <label>Size Options <small>(one per line, format: "Label - ₹Price")</small></label>
                  <textarea
                    rows={3}
                    value={product.sizes.join('\n')}
                    onChange={e => updateSizes(product.id, e.target.value)}
                  />
                </div>

                <div className="admin-field-group full">
                  <label>Description</label>
                  <textarea
                    rows={4}
                    value={product.description}
                    onChange={e => update(product.id, 'description', e.target.value)}
                  />
                </div>

                <div className="admin-edit-grid">
                  <div className="admin-field-group">
                    <label>Materials</label>
                    <input
                      type="text"
                      value={product.materials}
                      onChange={e => update(product.id, 'materials', e.target.value)}
                    />
                  </div>
                  <div className="admin-field-group">
                    <label>Care Instructions</label>
                    <input
                      type="text"
                      value={product.careInstructions}
                      onChange={e => update(product.id, 'careInstructions', e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-field-group full">
                  <label>Upload Product Images <small>(first image is the main display image · frame is 3:4 portrait)</small></label>
                  <UploadCropButton
                    label="Upload & position images"
                    aspect={3 / 4}
                    outW={900}
                    outH={1200}
                    multiple
                    onToast={onToast}
                    onAdd={u => { setItems(prev => prev.map(p => p.id === product.id ? { ...p, images: [...(p.images || []), u] } : p)); setDirty(true) }}
                  />
                  <div className="admin-image-previews">
                    {product.images.map((img, i) => (
                      <div key={`${product.id}-${i}`} className="admin-image-preview-item">
                        <ZoomImg src={img} alt={`Preview ${i + 1}`} title={`Image ${i + 1}`} />
                        <div className="admin-image-preview-actions">
                          <RecropButton
                            src={img}
                            aspect={3 / 4}
                            outW={900}
                            outH={1200}
                            onToast={onToast}
                            onCropped={u => { setItems(prev => prev.map(p => p.id === product.id ? { ...p, images: p.images.map((im, idx) => idx === i ? u : im) } : p)); setDirty(true) }}
                          />
                          <button
                            type="button"
                            className="admin-image-action-btn"
                            onClick={() => moveImage(product.id, i, i - 1)}
                            disabled={i === 0}
                            title="Move image left"
                            aria-label={`Move image ${i + 1} left`}
                          >
                            <i className="fas fa-arrow-left" />
                          </button>
                          <button
                            type="button"
                            className="admin-image-action-btn"
                            onClick={() => moveImage(product.id, i, i + 1)}
                            disabled={i === product.images.length - 1}
                            title="Move image right"
                            aria-label={`Move image ${i + 1} right`}
                          >
                            <i className="fas fa-arrow-right" />
                          </button>
                          <button
                            type="button"
                            className="admin-image-action-btn danger"
                            onClick={() => removeImage(product.id, i)}
                            title="Delete image"
                            aria-label={`Delete image ${i + 1}`}
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <small className="admin-image-help">First image is used as the main product image.</small>
                </div>

                <div className="admin-checkboxes">
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={product.isNew} onChange={e => update(product.id, 'isNew', e.target.checked)} />
                    Mark as "New"
                  </label>
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={product.isBestseller} onChange={e => update(product.id, 'isBestseller', e.target.checked)} />
                    Mark as "Bestseller"
                  </label>
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={product.available} onChange={e => update(product.id, 'available', e.target.checked)} />
                    Available to buy
                  </label>
                </div>

                <div className="admin-product-edit-footer">
                  <button className="admin-btn admin-btn-primary" onClick={() => { handleSave(); setExpandedId(null) }}>
                    <i className="fas fa-save" /> Save &amp; Close
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteProduct(product.id)}>
                    <i className="fas fa-trash" /> Delete This Product
                  </button>
                </div>
              </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dirty && (
        <div className="admin-sticky-save">
          <span>{items.length} products · {items.filter(p => p.available).length} available · unsaved changes</span>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            <i className="fas fa-save" /> Save All Changes
          </button>
        </div>
      )}
    </div>
  )
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ onToast }) {
  const [form, setForm]     = useState(() => getProfile())
  const [dirty, setDirty]   = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setDirty(true)
  }

  const handlePhotoUpload = async (fileList) => {
    try {
      const [photo] = await readFilesAsDataUrls(fileList)
      if (!photo) return
      handleChange('photo', photo)
      onToast('Profile photo uploaded. Save to publish changes.', 'success')
    } catch (_) {
      onToast('Could not upload profile photo. Please try again.', 'error')
    }
  }

  const handleSave = async () => {
    try {
      announceUpload(form, onToast)
      const published = await saveProfile(form)
      setForm(published)
      setDirty(false)
      onToast('Profile saved and now live on your website!', 'success')
    } catch (err) {
      onToast(saveErrorMessage(err), 'error')
    }
  }

  const handleReset = () => setConfirm(true)
  const doReset = async () => {
    try {
      await resetProfile()
      setForm({ ...DEFAULT_PROFILE })
      setDirty(false)
      setConfirm(false)
      onToast('Profile reset to defaults.', 'success')
    } catch (err) {
      setConfirm(false)
      onToast('Could not reset. Check your connection and try again.', 'error')
    }
  }

  return (
    <div className="admin-tab-content">
      {confirm && (
        <ConfirmModal
          msg="Reset profile to default? All profile edits will be lost."
          onConfirm={doReset}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div className="admin-section-header">
        <div>
          <h2>Profile</h2>
          <p>Update your bio, photo, and contact information</p>
        </div>
        <div className="admin-header-actions">
          {dirty && (
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              <i className="fas fa-save" /> Save Profile
            </button>
          )}
          <button className="admin-btn admin-btn-ghost" onClick={handleReset}>
            <i className="fas fa-undo" /> Reset
          </button>
        </div>
      </div>

      <div className="admin-profile-layout">
        {/* Photo Preview */}
        <div className="admin-profile-photo-col">
          <div className="admin-profile-photo-wrap">
            <ZoomImg src={form.photo} alt="Profile" onError={e => { e.target.src = 'https://via.placeholder.com/200x200?text=Photo' }} />
            {form.photo && (
              <RecropButton
                src={form.photo}
                aspect={1}
                outW={600}
                outH={600}
                onToast={onToast}
                className="admin-image-action-btn admin-profile-recrop"
                title="Reposition / resize"
                onCropped={u => handleChange('photo', u)}
              />
            )}
          </div>
          <p className="admin-photo-hint">Upload a photo below, or use the crop button to reposition the current one</p>
        </div>

        <div className="admin-profile-fields">
          <h3>Personal Info</h3>
          <div className="admin-edit-grid">
            <div className="admin-field-group">
              <label>Your Name</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label>Tagline</label>
              <input type="text" value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label>Studio Founded Year</label>
              <input type="text" value={form.studioYear} onChange={e => handleChange('studioYear', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label>Location</label>
              <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)} />
            </div>
          </div>

          <div className="admin-field-group full">
            <label>Profile Photo <small>(square)</small></label>
            <UploadCropButton
              label="Upload & position photo"
              aspect={1}
              outW={600}
              outH={600}
              onToast={onToast}
              onAdd={u => handleChange('photo', u)}
            />
          </div>

          <div className="admin-field-group full">
            <label>Short Bio <small>(shown in footer & about preview)</small></label>
            <textarea rows={3} value={form.bio} onChange={e => handleChange('bio', e.target.value)} />
          </div>

          <div className="admin-field-group full">
            <label>Full Bio <small>(shown on About page)</small></label>
            <textarea rows={5} value={form.longBio} onChange={e => handleChange('longBio', e.target.value)} />
          </div>

          <h3>Contact Details</h3>
          <div className="admin-edit-grid">
            <div className="admin-field-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="admin-field-group">
              <label>Phone (display)</label>
              <input type="text" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="admin-field-group">
              <label>WhatsApp Number <small>(country code, no + or spaces)</small></label>
              <input type="text" value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="918511341910" />
            </div>
          </div>

          <h3>Links &amp; Social</h3>
          <p className="admin-hint">
            Paste a full link, an @handle or just the username, whichever you have.
            Anything you leave blank is hidden across the whole site, so there are
            never links that go nowhere. These feed every follow button, the footer
            and the mobile menu.
          </p>
          <div className="admin-edit-grid">
            {SOCIAL_NETWORKS.map(net => {
              const value = form[net.key] || ''
              const preview = resolveSocial(value, net)
              return (
                <div className="admin-field-group" key={net.key}>
                  <label><i className={net.icon} /> {net.label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={e => handleChange(net.key, e.target.value)}
                    placeholder={net.hint}
                  />
                  {preview
                    ? <a className="admin-link-preview" href={preview} target="_blank" rel="noreferrer">
                        <i className="fas fa-external-link-alt" /> {preview}
                      </a>
                    : <span className="admin-link-preview muted">Not shown on the site</span>}
                </div>
              )
            })}
          </div>

          {dirty && (
            <button className="admin-btn admin-btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleSave}>
              <i className="fas fa-save" /> Save Profile Changes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Gallery Tab ───────────────────────────────────────────────────────────────
function GalleryTab({ onToast }) {
  const [items, setItems]       = useState(() => getGallery())
  const [expandedId, setExpandedId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [dirty, setDirty]       = useState(false)
  const [confirm, setConfirm]   = useState(false)
  const [draggedId, setDraggedId] = useState(null)

  const update = (id, field, val) => {
    setItems(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g))
    setDirty(true)
  }

  const handleImageUpload = async (id, fileList) => {
    try {
      const [image] = await readFilesAsDataUrls(fileList)
      if (!image) return
      update(id, 'image', image)
      onToast('Gallery image uploaded. Save to publish changes.', 'success')
    } catch (_) {
      onToast('Could not upload gallery image. Please try again.', 'error')
    }
  }

  const handleSave = async () => {
    try {
      announceUpload(items, onToast)
      const published = await saveGallery(items)
      setItems(published)
      setDirty(false)
      onToast('Gallery saved and now live on your website!', 'success')
    } catch (err) {
      onToast(saveErrorMessage(err), 'error')
    }
  }

  const handleReset = () => setConfirm(true)
  const doReset = async () => {
    try {
      await resetGallery()
      setItems(JSON.parse(JSON.stringify(defaultGallery)))
      setDirty(false)
      setConfirm(false)
      onToast('Gallery reset to defaults.', 'success')
    } catch (err) {
      setConfirm(false)
      onToast('Could not reset. Check your connection and try again.', 'error')
    }
  }

  const addItem = () => {
    const newId = 'g' + Date.now()
    const newItem = {
      id: newId,
      title: 'New Gallery Piece',
      category: 'macrame',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      project: 'New Project',
      year: new Date().getFullYear().toString(),
      description: 'Describe this piece.',
      size: '60cm × 90cm',
      featured: false,
      cols: 1,
    }
    setItems(prev => [newItem, ...prev])
    setExpandedId(newId)
    setDirty(true)
  }

  const deleteItem = (id) => {
    setItems(prev => prev.filter(g => g.id !== id))
    setExpandedId(null)
    setDirty(true)
  }

  const moveItem = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return
    setItems(prev => {
      const fromIndex = prev.findIndex(item => item.id === fromId)
      const toIndex = prev.findIndex(item => item.id === toId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setDirty(true)
  }

  const filtered = filterCat === 'all' ? items : items.filter(g => g.category === filterCat)

  return (
    <div className="admin-tab-content">
      {confirm && (
        <ConfirmModal
          msg="Reset gallery to defaults? All your changes will be lost."
          onConfirm={doReset}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div className="admin-section-header">
        <div>
          <h2>Gallery</h2>
          <p>{items.length} pieces in your portfolio</p>
          <p className="admin-gallery-help">Drag and drop cards to change photo sequence.</p>
        </div>
        <div className="admin-header-actions">
          {dirty && (
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              <i className="fas fa-save" /> Save Gallery
            </button>
          )}
          <button className="admin-btn admin-btn-sage" onClick={addItem}>
            <i className="fas fa-plus" /> Add Photo
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={handleReset}>
            <i className="fas fa-undo" /> Reset
          </button>
        </div>
      </div>

      <div className="admin-gallery-filter">
        {[{ id: 'all', label: 'All' }, ...galleryCategories.filter(c => c.id !== 'all')].map(c => (
          <button
            key={c.id}
            className={`admin-filter-chip ${filterCat === c.id ? 'active' : ''}`}
            onClick={() => setFilterCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="admin-gallery-grid">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`admin-gallery-card ${draggedId === item.id ? 'is-dragging' : ''}`}
            draggable
            onDragStart={() => setDraggedId(item.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              moveItem(draggedId, item.id)
              setDraggedId(null)
            }}
          >
            <div className="admin-gallery-img-wrap" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <button
                type="button"
                className="admin-gallery-remove-btn"
                title="Delete photo"
                aria-label={`Delete ${item.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteItem(item.id)
                }}
              >
                ×
              </button>
              <ZoomImg src={item.image} alt={item.title} onError={e => { e.target.style.opacity = '0.3' }} />
              {item.featured && <span className="admin-featured-dot">⭐</span>}
              <div className="admin-gallery-overlay">
                <span><i className="fas fa-edit" /> Edit</span>
              </div>
            </div>
            <div className="admin-gallery-card-info">
              <span>{item.title}</span>
              <div className="admin-gallery-card-meta">
                <span className="admin-cat-chip">{item.category}</span>
                <span className="admin-drag-hint" title="Drag to reorder"><i className="fas fa-grip-vertical" /></span>
              </div>
            </div>

            {expandedId === item.id && (
              <div className="admin-gallery-edit">
                <div className="admin-field-group">
                  <label>Title</label>
                  <input type="text" value={item.title} onChange={e => update(item.id, 'title', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Category</label>
                  <select value={item.category} onChange={e => update(item.id, 'category', e.target.value)}>
                    {galleryCategories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field-group">
                  <label>Gallery Image <small>(keeps the photo's own shape)</small></label>
                  <div className="admin-inline-actions">
                    <UploadCropButton
                      label="Upload & position"
                      aspect="natural"
                      onToast={onToast}
                      onAdd={u => { setItems(prev => prev.map(g => g.id === item.id ? { ...g, image: u } : g)); setDirty(true) }}
                    />
                    {item.image && (
                      <RecropButton
                        src={item.image}
                        aspect="natural"
                        onToast={onToast}
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        title="Reposition current photo"
                        onCropped={u => { setItems(prev => prev.map(g => g.id === item.id ? { ...g, image: u } : g)); setDirty(true) }}
                      />
                    )}
                  </div>
                </div>
                <div className="admin-field-group">
                  <label>Project / Series</label>
                  <input type="text" value={item.project} onChange={e => update(item.id, 'project', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Year</label>
                  <input type="text" value={item.year} onChange={e => update(item.id, 'year', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Size / Dimensions</label>
                  <input type="text" value={item.size} onChange={e => update(item.id, 'size', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Description</label>
                  <textarea rows={3} value={item.description} onChange={e => update(item.id, 'description', e.target.value)} />
                </div>
                <div className="admin-checkboxes">
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={item.featured} onChange={e => update(item.id, 'featured', e.target.checked)} />
                    Featured piece (⭐ badge)
                  </label>
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={item.cols === 2} onChange={e => update(item.id, 'cols', e.target.checked ? 2 : 1)} />
                    Wide layout (2 columns)
                  </label>
                </div>
                <div className="admin-gallery-edit-footer">
                  <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                    <i className="fas fa-save" /> Save
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteItem(item.id)}>
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dirty && (
        <div className="admin-sticky-save">
          <span>{items.length} gallery items · unsaved changes</span>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            <i className="fas fa-save" /> Save Gallery
          </button>
        </div>
      )}
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab({ projects, onSave, onToast }) {
  const [items, setItems] = useState(() => JSON.parse(JSON.stringify(projects || [])))
  const [expandedId, setExpandedId] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [draggedId, setDraggedId] = useState(null)

  const update = (id, field, val) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item))
    setDirty(true)
  }

  const handleUploadPhotos = async (id, fileList) => {
    try {
      const newPhotos = await readFilesAsDataUrls(fileList)
      if (!newPhotos.length) return
      setItems(prev => prev.map(item => item.id === id ? { ...item, photos: [...(item.photos || []), ...newPhotos] } : item))
      setDirty(true)
      onToast('Project photos added. Save to publish changes.', 'success')
    } catch (_) {
      onToast('Could not upload project photos. Please try again.', 'error')
    }
  }

  const removePhoto = (projectId, photoIndex) => {
    setItems(prev => prev.map(item => {
      if (item.id !== projectId) return item
      return { ...item, photos: (item.photos || []).filter((_, index) => index !== photoIndex) }
    }))
    setDirty(true)
  }

  const addProject = () => {
    const newId = `project_${Date.now()}`
    const newProject = {
      id: newId,
      title: 'New Project',
      category: 'diorama',
      method: 'Diorama / Art Technique',
      year: new Date().getFullYear().toString(),
      description: 'Add details about this project.',
      materials: '',
      photos: ['https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&q=80'],
      featured: false,
    }
    setItems(prev => [newProject, ...prev])
    setExpandedId(newId)
    setDirty(true)
  }

  const deleteProject = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
    setExpandedId(null)
    setDirty(true)
  }

  const moveProject = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return
    setItems(prev => {
      const fromIndex = prev.findIndex(item => item.id === fromId)
      const toIndex = prev.findIndex(item => item.id === toId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setDirty(true)
  }

  const handleSave = async () => {
    try {
      announceUpload(items, onToast)
      const published = await saveProjects(items)
      setItems(published)
      onSave(published)
      setDirty(false)
      onToast('Projects saved and now live on your website!', 'success')
    } catch (err) {
      onToast(saveErrorMessage(err), 'error')
    }
  }

  const doReset = async () => {
    try {
      await resetProjects()
      const defaults = JSON.parse(JSON.stringify(defaultProjects))
      setItems(defaults)
      onSave(defaults)
      setDirty(false)
      setConfirm(false)
      onToast('Projects reset to defaults.', 'success')
    } catch (err) {
      setConfirm(false)
      onToast('Could not reset. Check your connection and try again.', 'error')
    }
  }

  const filtered = filterCat === 'all' ? items : items.filter(item => item.category === filterCat)

  return (
    <div className="admin-tab-content">
      {confirm && (
        <ConfirmModal
          msg="Reset projects to defaults? All your project edits will be lost."
          onConfirm={doReset}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div className="admin-section-header">
        <div>
          <h2>Projects</h2>
          <p>{items.length} projects in your portfolio</p>
          <p className="admin-gallery-help">Drag and drop cards to reorder project sequence.</p>
        </div>
        <div className="admin-header-actions">
          {dirty && (
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>
              <i className="fas fa-save" /> Save Projects
            </button>
          )}
          <button className="admin-btn admin-btn-sage" onClick={addProject}>
            <i className="fas fa-plus" /> Add Project
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(true)}>
            <i className="fas fa-undo" /> Reset
          </button>
        </div>
      </div>

      <div className="admin-gallery-filter">
        {projectCategories.map(category => (
          <button
            key={category.id}
            className={`admin-filter-chip ${filterCat === category.id ? 'active' : ''}`}
            onClick={() => setFilterCat(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="admin-projects-grid">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`admin-project-card ${draggedId === item.id ? 'is-dragging' : ''}`}
            draggable
            onDragStart={() => setDraggedId(item.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              moveProject(draggedId, item.id)
              setDraggedId(null)
            }}
          >
            <div className="admin-project-head">
              <button
                type="button"
                className="admin-gallery-remove-btn"
                title="Delete project"
                aria-label={`Delete ${item.title}`}
                onClick={() => deleteProject(item.id)}
              >
                ×
              </button>
              <ZoomImg src={item.photos?.[0]} alt={item.title} onError={e => { e.target.style.opacity = '0.3' }} />
              <div className="admin-gallery-card-info">
                <span>{item.title}</span>
                <div className="admin-gallery-card-meta">
                  <span className="admin-cat-chip">{item.category}</span>
                  <span className="admin-drag-hint" title="Drag to reorder"><i className="fas fa-grip-vertical" /></span>
                </div>
              </div>
            </div>

            <button className="admin-btn admin-btn-ghost admin-project-toggle" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <i className={`fas fa-chevron-${expandedId === item.id ? 'up' : 'down'}`} /> {expandedId === item.id ? 'Close Editor' : 'Edit Project'}
            </button>

            {expandedId === item.id && (
              <div className="admin-gallery-edit">
                <div className="admin-field-group">
                  <label>Title</label>
                  <input type="text" value={item.title} onChange={e => update(item.id, 'title', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Category</label>
                  <select value={item.category} onChange={e => update(item.id, 'category', e.target.value)}>
                    {projectCategories.filter(category => category.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field-group">
                  <label>Method / Art Used</label>
                  <input type="text" value={item.method || ''} onChange={e => update(item.id, 'method', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Year / Context</label>
                  <input type="text" value={item.year || ''} onChange={e => update(item.id, 'year', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Description</label>
                  <textarea rows={4} value={item.description || ''} onChange={e => update(item.id, 'description', e.target.value)} />
                </div>
                <div className="admin-field-group">
                  <label>Materials / Notes</label>
                  <textarea rows={3} value={item.materials || ''} onChange={e => update(item.id, 'materials', e.target.value)} />
                </div>

                <div className="admin-field-group">
                  <label>Project Photos <small>(frame is 4:3)</small></label>
                  <UploadCropButton
                    label="Upload & position photos"
                    aspect={4 / 3}
                    outW={1000}
                    outH={750}
                    multiple
                    onToast={onToast}
                    onAdd={u => { setItems(prev => prev.map(it => it.id === item.id ? { ...it, photos: [...(it.photos || []), u] } : it)); setDirty(true) }}
                  />
                  <div className="admin-project-photos-grid">
                    {(item.photos || []).map((photo, index) => (
                      <div key={`${item.id}-${index}`} className="admin-project-photo-item">
                        <ZoomImg src={photo} alt={`${item.title} ${index + 1}`} />
                        <div className="admin-project-photo-tools">
                          <RecropButton
                            src={photo}
                            aspect={4 / 3}
                            outW={1000}
                            outH={750}
                            onToast={onToast}
                            className="admin-project-photo-crop"
                            onCropped={u => { setItems(prev => prev.map(it => it.id === item.id ? { ...it, photos: it.photos.map((ph, idx) => idx === index ? u : ph) } : it)); setDirty(true) }}
                          />
                          <button
                            type="button"
                            className="admin-project-photo-remove"
                            onClick={() => removePhoto(item.id, index)}
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="admin-checkbox-label">
                  <input type="checkbox" checked={!!item.featured} onChange={e => update(item.id, 'featured', e.target.checked)} />
                  Mark as featured project
                </label>

                <div className="admin-gallery-edit-footer">
                  <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                    <i className="fas fa-save" /> Save
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteProject(item.id)}>
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {dirty && (
        <div className="admin-sticky-save">
          <span>{items.length} projects · unsaved changes</span>
          <button className="admin-btn admin-btn-primary" onClick={handleSave}>
            <i className="fas fa-save" /> Save Projects
          </button>
        </div>
      )}
    </div>
  )
}

// ── Website Photos Tab ────────────────────────────────────────────────────────
// Lets the admin change the fixed "section" photos across the site (heroes,
// category cards, banners, etc.). Each slot is labelled so it's clear which
// part of the website will change. Product/gallery/project photos live in
// their own tabs.
// ── Website Text Tab (editable headings / labels / taglines) ──────────────────
function SiteTextTab({ onToast }) {
  const [overrides, setOverrides] = useState(() => ({ ...getSiteTexts() }))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const valueOf = (item) => (overrides[item.key] !== undefined && overrides[item.key] !== null) ? overrides[item.key] : item.def
  const isCustom = (item) => overrides[item.key] !== undefined && overrides[item.key] !== item.def

  const setVal = (item, val) => {
    setOverrides(prev => {
      const next = { ...prev }
      if (val === item.def) delete next[item.key]
      else next[item.key] = val
      return next
    })
    setDirty(true)
  }
  const resetOne = (item) => {
    setOverrides(prev => { const n = { ...prev }; delete n[item.key]; return n })
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteTexts(overrides)
      setDirty(false)
      onToast('Website text saved and now live on your website!', 'success')
    } catch (err) {
      onToast('Could not save. Check your connection and try again.', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Website Text</h2>
          <p>Edit any heading, label or tagline across your website. Each field says where it appears. Leave blank to keep the original wording.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty || saving}>
          <i className="fas fa-save" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {SITE_TEXT_GROUPS.map(group => (
        <div key={group.page} className="siteimg-group">
          <h3 className="siteimg-group-title">{group.page}</h3>
          <div className="sitetext-grid">
            {group.items.map(item => (
              <div key={item.key} className="sitetext-field">
                <label>
                  <span className="sitetext-label">{item.label}{isCustom(item) && <span className="siteimg-badge sitetext-badge">Changed</span>}</span>
                  {item.multiline
                    ? <textarea rows="2" value={valueOf(item)} onChange={e => setVal(item, e.target.value)} />
                    : <input type="text" value={valueOf(item)} onChange={e => setVal(item, e.target.value)} />}
                </label>
                {isCustom(item) && (
                  <button className="admin-btn admin-btn-ghost admin-btn-sm sitetext-reset" onClick={() => resetOne(item)}>
                    <i className="fas fa-undo" /> Reset to original
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty || saving}>
          <i className="fas fa-save" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function SiteImagesTab({ onToast }) {
  const [overrides, setOverrides] = useState(() => ({ ...getSiteImages() }))
  // Some slots also own a caption (the home category cards), so this tab edits
  // a slice of Website Text too and saves both together.
  const [texts, setTexts] = useState(() => ({ ...getSiteTexts() }))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cropTarget, setCropTarget] = useState(null) // { item, src }

  const currentUrl = (item) => overrides[item.key] || item.url
  const isCustom = (item) => Boolean(overrides[item.key])

  const setUrl = (key, url) => {
    setOverrides(prev => {
      const next = { ...prev }
      if (url) next[key] = url
      else delete next[key]
      return next
    })
    setDirty(true)
  }

  // Choosing a file opens the crop modal (locked to this section's shape).
  const startCrop = async (item, fileList) => {
    const file = Array.from(fileList || []).find(f => f.type.startsWith('image/'))
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      onToast('That image is very large (over 15 MB). Please use a smaller photo.', 'error')
      return
    }
    try {
      const src = await fileToDataUrl(file)
      setCropTarget({ item, src })
    } catch (_) {
      onToast('Could not read that image. Please try another.', 'error')
    }
  }

  const onCropConfirm = (dataUrl) => {
    if (cropTarget) setUrl(cropTarget.item.key, dataUrl)
    setCropTarget(null)
    onToast('Photo positioned. Click "Save changes" to publish.', 'success')
  }

  const setText = (key, value) => {
    setTexts(prev => {
      const next = { ...prev }
      if (value) next[key] = value
      else delete next[key] // blank falls back to the built-in wording
      return next
    })
    setDirty(true)
  }

  const resetSlot = (key) => { setUrl(key, '') }

  const handleSave = async () => {
    setSaving(true)
    try {
      announceUpload(overrides, onToast)
      const published = await saveSiteImages(overrides)
      setOverrides(published)
      setTexts(await saveSiteTexts(texts))
      setDirty(false)
      onToast('Website photos saved and now live on your website!', 'success')
    } catch (err) {
      onToast(saveErrorMessage(err), 'error')
    }
    setSaving(false)
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Website Photos</h2>
          <p>Change the fixed photos in each section. After you pick a photo you can drag to choose exactly which part shows. The size guide tells you the best shape for each spot.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty || saving}>
          <i className="fas fa-save" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {SITE_IMAGE_GROUPS.map(group => (
        <div key={group.page} className="siteimg-group">
          <h3 className="siteimg-group-title">{group.page}</h3>
          <div className="siteimg-grid">
            {group.items.map(item => (
              <div key={item.key} className="siteimg-card">
                <div className="siteimg-preview" style={{ aspectRatio: `${item.w} / ${item.h}` }}>
                  <ZoomImg src={currentUrl(item)} alt={item.label} loading="lazy" />
                  {isCustom(item) && <span className="siteimg-badge">Changed</span>}
                </div>
                <div className="siteimg-body">
                  <strong className="siteimg-label">{item.label}</strong>
                  <span className="siteimg-desc">{item.desc}</span>
                  {item.textKey && (
                    <label className="siteimg-name">
                      <span>Name shown on the card</span>
                      <input
                        type="text"
                        value={texts[item.textKey] ?? ''}
                        placeholder={getSiteText(item.textKey)}
                        onChange={e => setText(item.textKey, e.target.value)}
                      />
                    </label>
                  )}
                  {item.descKey && (
                    <label className="siteimg-name">
                      <span>Description under the name</span>
                      <textarea
                        rows="2"
                        value={texts[item.descKey] ?? ''}
                        placeholder={getSiteText(item.descKey)}
                        onChange={e => setText(item.descKey, e.target.value)}
                      />
                      <small>Leave blank to keep the wording above.</small>
                    </label>
                  )}
                  <span className="siteimg-guide"><i className="fas fa-ruler-combined" /> Best size: {item.w} × {item.h} px</span>
                  <div className="siteimg-actions">
                    <label className="admin-btn admin-btn-ghost admin-btn-sm siteimg-upload">
                      <i className="fas fa-upload" /> Upload &amp; position
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => { startCrop(item, e.target.files); e.target.value = '' }}
                      />
                    </label>
                    {isCustom(item) && overrides[item.key] && overrides[item.key].startsWith('data:') && (
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setCropTarget({ item, src: overrides[item.key] })}>
                        <i className="fas fa-crop-alt" /> Reposition
                      </button>
                    )}
                    {isCustom(item) && (
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => resetSlot(item.key)}>
                        <i className="fas fa-undo" /> Reset
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="siteimg-url"
                    placeholder="…or paste an image URL"
                    value={overrides[item.key] && !overrides[item.key].startsWith('data:') ? overrides[item.key] : ''}
                    onChange={e => setUrl(item.key, e.target.value.trim())}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty || saving}>
          <i className="fas fa-save" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {cropTarget && (
        <ImageCropModal
          src={cropTarget.src}
          aspect={cropTarget.item.w / cropTarget.item.h}
          outW={cropTarget.item.w}
          outH={cropTarget.item.h}
          label={`${cropTarget.item.label} · ${cropTarget.item.w} × ${cropTarget.item.h} px`}
          onCancel={() => setCropTarget(null)}
          onConfirm={onCropConfirm}
        />
      )}
    </div>
  )
}

// ── Shared: upload button that opens the crop/position frame for each file ────
// aspect: a number (locked shape) or 'natural' (keep each photo's own shape).
// Files are processed one at a time so the user frames each photo.
function UploadCropButton({ label = 'Upload & position', aspect = 'natural', outW, outH, multiple = false, onAdd, onToast, buttonClass = 'admin-btn admin-btn-ghost admin-btn-sm', icon = 'fas fa-upload' }) {
  const [queue, setQueue] = useState([])

  const pick = async (fileList) => {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const items = []
    for (const f of files) {
      if (f.size > 15 * 1024 * 1024) { onToast && onToast('One image is over 15 MB. Please use a smaller photo.', 'error'); continue }
      try {
        const src = await fileToDataUrl(f)
        let a = aspect, ow = outW, oh = outH
        if (aspect === 'natural') {
          const im = await loadImage(src)
          let na = (im.naturalWidth || 1) / (im.naturalHeight || 1)
          na = Math.max(0.6, Math.min(1.9, na))
          a = na
          const cap = 1400
          if (na >= 1) { ow = Math.min(im.naturalWidth || cap, cap); oh = Math.round(ow / na) }
          else { oh = Math.min(im.naturalHeight || cap, cap); ow = Math.round(oh * na) }
        }
        items.push({ src, aspect: a, outW: ow, outH: oh })
      } catch (_) { onToast && onToast('Could not read one image. Please try another.', 'error') }
    }
    if (items.length) setQueue(items)
  }

  const current = queue[0]
  const confirm = (url) => { onAdd && onAdd(url); setQueue(q => q.slice(1)) }
  const cancel = () => setQueue([])

  return (
    <>
      <label className={`${buttonClass} siteimg-upload`}>
        <i className={icon} /> {label}
        <input type="file" accept="image/*" multiple={multiple} hidden onChange={e => { pick(e.target.files); e.target.value = '' }} />
      </label>
      {current && (
        <ImageCropModal
          src={current.src}
          aspect={current.aspect}
          outW={current.outW}
          outH={current.outH}
          label={label + (queue.length > 1 ? ` (${queue.length} left)` : '')}
          onCancel={cancel}
          onConfirm={confirm}
        />
      )}
    </>
  )
}

// ── Shared: reposition/resize an EXISTING image (opens the crop frame) ────────
function RecropButton({ src, aspect = 'natural', outW, outH, onCropped, onToast, className = 'admin-image-action-btn', title = 'Reposition / resize' }) {
  const [job, setJob] = useState(null)
  const open = async () => {
    if (!src) return
    try {
      let a = aspect, ow = outW, oh = outH
      if (aspect === 'natural') {
        const im = await loadImage(src)
        let na = (im.naturalWidth || 1) / (im.naturalHeight || 1)
        na = Math.max(0.6, Math.min(1.9, na))
        a = na
        const cap = 1400
        if (na >= 1) { ow = Math.min(im.naturalWidth || cap, cap); oh = Math.round(ow / na) }
        else { oh = Math.min(im.naturalHeight || cap, cap); ow = Math.round(oh * na) }
      }
      setJob({ src, aspect: a, outW: ow, outH: oh })
    } catch (_) { onToast && onToast('Could not open that image.', 'error') }
  }
  return (
    <>
      <button type="button" className={className} onClick={open} title={title}><i className="fas fa-crop-alt" /></button>
      {job && (
        <ImageCropModal
          src={job.src}
          aspect={job.aspect}
          outW={job.outW}
          outH={job.outH}
          label={title}
          onCancel={() => setJob(null)}
          onConfirm={u => { onCropped(u); setJob(null) }}
        />
      )}
    </>
  )
}

// ── Shared: image row editor (upload / paste URL / reorder / delete) ──────────
function ImageRowEditor({ images, onChange, onToast, aspect = 'natural', outW, outH }) {
  const list = images || []
  const addUrl = (url) => { if (url) onChange([...list, url]) }
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i))
  const move = (i, to) => {
    if (to < 0 || to >= list.length) return
    const next = [...list]; const [it] = next.splice(i, 1); next.splice(to, 0, it); onChange(next)
  }
  const [url, setUrl] = useState('')
  return (
    <div className="admin-image-editor">
      <div className="admin-image-previews">
        {list.map((img, i) => (
          <div key={i} className="admin-image-preview-item">
            <ZoomImg src={img} alt={`Image ${i + 1}`} />
            <div className="admin-image-preview-actions">
              <RecropButton src={img} aspect={aspect} outW={outW} outH={outH} onToast={onToast} onCropped={u => onChange(list.map((im, idx) => idx === i ? u : im))} />
              <button type="button" className="admin-image-action-btn" onClick={() => move(i, i - 1)} disabled={i === 0} title="Move left"><i className="fas fa-arrow-left" /></button>
              <button type="button" className="admin-image-action-btn" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} title="Move right"><i className="fas fa-arrow-right" /></button>
              <button type="button" className="admin-image-action-btn danger" onClick={() => remove(i)} title="Remove"><i className="fas fa-trash" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-image-add-row">
        <UploadCropButton
          label="Upload & position"
          aspect={aspect}
          outW={outW}
          outH={outH}
          multiple
          onAdd={u => onChange([...(images || []), u])}
          onToast={onToast}
        />
        <input type="text" className="siteimg-url" placeholder="…or paste image URL and press Add" value={url} onChange={e => setUrl(e.target.value)} />
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { addUrl(url.trim()); setUrl('') }}>Add</button>
      </div>
    </div>
  )
}

// Convert a textarea (one item per line) to/from an array of strings.
const linesToArr = (s) => (s || '').split('\n').map(x => x.trim()).filter(Boolean)
const arrToLines = (a) => (a || []).join('\n')

// ── Second Life (Recycle) Tab ─────────────────────────────────────────────────
function RecycleTab({ onToast }) {
  const [items, setItems] = useState(() => getRecycle().map(x => ({ ...x })))
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const upd = (id, f, v) => { setItems(p => p.map(it => it.id === id ? { ...it, [f]: v } : it)); setDirty(true) }
  const setImages = (id, imgs) => upd(id, 'images', imgs)
  const addItem = () => {
    setItems(p => [{ id: Date.now(), name: 'New Second Life piece', price: 0, originalPrice: null, condition: 'Upcycled', material: '', size: '', images: [], description: '', available: true }, ...p])
    setDirty(true)
  }
  const del = (id) => { if (!window.confirm('Delete this piece? This cannot be undone after you save.')) return; setItems(p => p.filter(it => it.id !== id)); setDirty(true) }

  const handleSave = async () => {
    try {
      announceUpload(items, onToast)
      setItems(await saveRecycle(items)); setDirty(false)
      onToast('Second Life saved and now live on your website!', 'success')
    }
    catch (e) { onToast(saveErrorMessage(e), 'error') }
  }
  const doReset = async () => {
    try { await resetRecycle(); setItems(getRecycle().map(x => ({ ...x }))); setDirty(false); setConfirm(false); onToast('Second Life reset to defaults.', 'success') }
    catch (e) { setConfirm(false); onToast('Could not reset. Try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      {confirm && <ConfirmModal msg="Reset Second Life to the original default pieces? Your changes will be lost." onConfirm={doReset} onCancel={() => setConfirm(false)} />}
      <div className="admin-section-header">
        <div>
          <h2>Second Life</h2>
          <p>Recycled &amp; upcycled pieces shown on the Second Life page.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(true)}><i className="fas fa-undo" /> Reset</button>
          <button className="admin-btn admin-btn-primary" onClick={addItem}><i className="fas fa-plus" /> Add piece</button>
        </div>
      </div>

      <div className="admin-edit-list">
        {items.map(it => (
          <div key={it.id} className="admin-edit-card">
            <div className="admin-field-grid">
              <label className="admin-field span2"><span>Name</span>
                <input type="text" value={it.name || ''} onChange={e => upd(it.id, 'name', e.target.value)} />
              </label>
              <label className="admin-field"><span>Price (₹)</span>
                <input type="number" value={it.price || 0} onChange={e => upd(it.id, 'price', Number(e.target.value))} />
              </label>
              <label className="admin-field"><span>Original price (₹, optional)</span>
                <input type="number" value={it.originalPrice || ''} onChange={e => upd(it.id, 'originalPrice', e.target.value ? Number(e.target.value) : null)} />
              </label>
              <label className="admin-field"><span>Condition / tag</span>
                <input type="text" value={it.condition || ''} onChange={e => upd(it.id, 'condition', e.target.value)} placeholder="Upcycled / Recycled" />
              </label>
              <label className="admin-field"><span>Size</span>
                <input type="text" value={it.size || ''} onChange={e => upd(it.id, 'size', e.target.value)} />
              </label>
              <label className="admin-field span2"><span>Made from (materials)</span>
                <input type="text" value={it.material || ''} onChange={e => upd(it.id, 'material', e.target.value)} />
              </label>
              <label className="admin-field span2"><span>Description</span>
                <textarea rows="3" value={it.description || ''} onChange={e => upd(it.id, 'description', e.target.value)} />
              </label>
            </div>
            <div className="admin-field"><span>Photos</span>
              <ImageRowEditor images={it.images} onChange={imgs => setImages(it.id, imgs)} onToast={onToast} aspect={1} outW={1000} outH={1000} />
            </div>
            <div className="admin-edit-card-footer">
              <label className="admin-checkbox">
                <input type="checkbox" checked={it.available !== false} onChange={e => upd(it.id, 'available', e.target.checked)} /> Available to buy
              </label>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => del(it.id)}><i className="fas fa-trash" /> Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="admin-empty-note">No pieces yet. Click "Add piece" to create one.</p>}
      </div>

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Workshops Tab ─────────────────────────────────────────────────────────────
function WorkshopsTab({ onToast }) {
  const [items, setItems] = useState(() => getWorkshops().map(x => ({ ...x })))
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const upd = (id, f, v) => { setItems(p => p.map(it => it.id === id ? { ...it, [f]: v } : it)); setDirty(true) }
  const addItem = () => {
    setItems(p => [{ id: Date.now(), title: 'New Workshop', subtitle: '', icon: '🎨', image: '', duration: '', groupSize: '', price: 0, level: 'All Levels', tag: '', mode: [], whatYouLearn: [], includes: [], upcoming: [] }, ...p])
    setDirty(true)
  }
  const del = (id) => { if (!window.confirm('Delete this workshop?')) return; setItems(p => p.filter(it => it.id !== id)); setDirty(true) }

  const addSession = (id) => upd(id, 'upcoming', [...(items.find(w => w.id === id).upcoming || []), { date: '', time: '', mode: 'In-person', seats: 0 }])
  const updSession = (id, i, f, v) => {
    const w = items.find(x => x.id === id)
    const next = (w.upcoming || []).map((s, idx) => idx === i ? { ...s, [f]: v } : s)
    upd(id, 'upcoming', next)
  }
  const delSession = (id, i) => { const w = items.find(x => x.id === id); upd(id, 'upcoming', (w.upcoming || []).filter((_, idx) => idx !== i)) }

  const handleSave = async () => {
    try {
      announceUpload(items, onToast)
      setItems(await saveWorkshops(items)); setDirty(false)
      onToast('Workshops saved and now live on your website!', 'success')
    }
    catch (e) { onToast(saveErrorMessage(e), 'error') }
  }
  const doReset = async () => {
    try { await resetWorkshops(); setItems(getWorkshops().map(x => ({ ...x }))); setDirty(false); setConfirm(false); onToast('Workshops reset to defaults.', 'success') }
    catch (e) { setConfirm(false); onToast('Could not reset. Try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      {confirm && <ConfirmModal msg="Reset all workshops to defaults? Your changes will be lost." onConfirm={doReset} onCancel={() => setConfirm(false)} />}
      <div className="admin-section-header">
        <div><h2>Workshops</h2><p>Add, edit or remove the workshops shown on the Workshops page.</p></div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(true)}><i className="fas fa-undo" /> Reset</button>
          <button className="admin-btn admin-btn-primary" onClick={addItem}><i className="fas fa-plus" /> Add workshop</button>
        </div>
      </div>

      <div className="admin-edit-list">
        {items.map(w => (
          <div key={w.id} className="admin-edit-card">
            <div className="admin-field-grid">
              <label className="admin-field"><span>Icon (emoji)</span>
                <input type="text" value={w.icon || ''} onChange={e => upd(w.id, 'icon', e.target.value)} /></label>
              <label className="admin-field span2"><span>Title</span>
                <input type="text" value={w.title || ''} onChange={e => upd(w.id, 'title', e.target.value)} /></label>
              <label className="admin-field span3"><span>Subtitle</span>
                <input type="text" value={w.subtitle || ''} onChange={e => upd(w.id, 'subtitle', e.target.value)} /></label>
              <label className="admin-field"><span>Price (₹)</span>
                <input type="number" value={w.price || 0} onChange={e => upd(w.id, 'price', Number(e.target.value))} /></label>
              <label className="admin-field"><span>Duration</span>
                <input type="text" value={w.duration || ''} onChange={e => upd(w.id, 'duration', e.target.value)} placeholder="3 hours" /></label>
              <label className="admin-field"><span>Group size</span>
                <input type="text" value={w.groupSize || ''} onChange={e => upd(w.id, 'groupSize', e.target.value)} /></label>
              <label className="admin-field"><span>Level</span>
                <input type="text" value={w.level || ''} onChange={e => upd(w.id, 'level', e.target.value)} /></label>
              <label className="admin-field"><span>Tag / badge</span>
                <input type="text" value={w.tag || ''} onChange={e => upd(w.id, 'tag', e.target.value)} placeholder="Most Popular" /></label>
              <label className="admin-field span3"><span>Modes (one per line)</span>
                <textarea rows="2" value={arrToLines(w.mode)} onChange={e => upd(w.id, 'mode', linesToArr(e.target.value))} placeholder={'In-person (Ahmedabad)\nOnline via Zoom'} /></label>
              <label className="admin-field span3"><span>What you'll learn (one per line)</span>
                <textarea rows="4" value={arrToLines(w.whatYouLearn)} onChange={e => upd(w.id, 'whatYouLearn', linesToArr(e.target.value))} /></label>
              <label className="admin-field span3"><span>What's included (one per line)</span>
                <textarea rows="3" value={arrToLines(w.includes)} onChange={e => upd(w.id, 'includes', linesToArr(e.target.value))} /></label>
            </div>
            <div className="admin-field"><span>Photo</span>
              <ImageRowEditor images={w.image ? [w.image] : []} onChange={imgs => upd(w.id, 'image', imgs[imgs.length - 1] || '')} onToast={onToast} aspect={16 / 9} outW={1200} outH={675} />
            </div>
            <div className="admin-subsection">
              <div className="admin-subsection-head">
                <strong>Upcoming sessions</strong>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => addSession(w.id)}><i className="fas fa-plus" /> Add session</button>
              </div>
              {(w.upcoming || []).map((s, i) => (
                <div key={i} className="admin-session-row">
                  <input type="text" placeholder="Date (April 5, 2026)" value={s.date || ''} onChange={e => updSession(w.id, i, 'date', e.target.value)} />
                  <input type="text" placeholder="Time" value={s.time || ''} onChange={e => updSession(w.id, i, 'time', e.target.value)} />
                  <input type="text" placeholder="Mode" value={s.mode || ''} onChange={e => updSession(w.id, i, 'mode', e.target.value)} />
                  <input type="number" placeholder="Seats" value={s.seats ?? ''} onChange={e => updSession(w.id, i, 'seats', Number(e.target.value))} />
                  <button className="admin-image-action-btn danger" onClick={() => delSession(w.id, i)} title="Remove session"><i className="fas fa-trash" /></button>
                </div>
              ))}
            </div>
            <div className="admin-edit-card-footer">
              <span />
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => del(w.id)}><i className="fas fa-trash" /> Delete workshop</button>
            </div>
          </div>
        ))}
      </div>
      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Videos Tab ────────────────────────────────────────────────────────────────
// YouTube links, not uploaded files: a phone video is tens of megabytes and
// YouTube already handles streaming and playback everywhere.
function VideosTab({ onToast }) {
  const [items, setItems] = useState(() => getVideos().map(x => ({ ...x })))
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const upd = (id, f, v) => { setItems(p => p.map(it => it.id === id ? { ...it, [f]: v } : it)); setDirty(true) }
  const addItem = () => {
    setItems(p => [{ id: Date.now(), title: '', description: '', video: '', photo: '' }, ...p])
    setDirty(true)
  }
  const del = (id) => { if (!window.confirm('Remove this video?')) return; setItems(p => p.filter(it => it.id !== id)); setDirty(true) }
  const move = (i, to) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]; const [it] = next.splice(i, 1); next.splice(to, 0, it)
    setItems(next); setDirty(true)
  }

  const handleSave = async () => {
    // Drop blank rows so an accidental "Add video" never publishes an empty card.
    const cleaned = items.filter(v => (v.video || '').trim() || (v.title || '').trim())
    try {
      announceUpload(cleaned, onToast)
      setItems(await saveVideos(cleaned)); setDirty(false)
      onToast('Videos saved and now live on your website!', 'success')
    }
    catch (e) { onToast(saveErrorMessage(e), 'error') }
  }
  const doReset = async () => {
    try { await resetVideos(); setItems(getVideos().map(x => ({ ...x }))); setDirty(false); setConfirm(false); onToast('Videos cleared.', 'success') }
    catch (e) { setConfirm(false); onToast('Could not reset. Try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      {confirm && <ConfirmModal msg="Remove all videos from the website?" onConfirm={doReset} onCancel={() => setConfirm(false)} />}
      <div className="admin-section-header">
        <div>
          <h2>Videos</h2>
          <p>Paste a YouTube link to show it on your home page. The thumbnail loads automatically.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(true)}><i className="fas fa-undo" /> Clear all</button>
          <button className="admin-btn admin-btn-primary" onClick={addItem}><i className="fas fa-plus" /> Add video</button>
        </div>
      </div>

      {!items.length && (
        <div className="admin-empty-note">
          <i className="fab fa-youtube" />
          <div>
            <strong>No videos yet</strong>
            <span>The video section stays hidden on your website until you add one.</span>
          </div>
        </div>
      )}

      <div className="admin-edit-list">
        {items.map((v, i) => {
          const id = youtubeId(v.video)
          return (
            <div key={v.id} className="admin-edit-card">
              <div className="admin-video-row">
                <div className="admin-video-thumb">
                  {id ? (
                    <img src={youtubePoster(v.video, v.photo)} alt="" />
                  ) : (
                    <span className="admin-video-thumb-empty"><i className="fab fa-youtube" /></span>
                  )}
                </div>
                <div className="admin-video-fields">
                  <label className="admin-field"><span>YouTube link</span>
                    <input
                      type="text"
                      value={v.video || ''}
                      onChange={e => upd(v.id, 'video', e.target.value)}
                      placeholder="https://youtu.be/..."
                    />
                  </label>
                  {v.video && !id && (
                    <p className="admin-field-err"><i className="fas fa-times-circle" /> That does not look like a YouTube link yet.</p>
                  )}
                  <label className="admin-field"><span>Title</span>
                    <input type="text" value={v.title || ''} onChange={e => upd(v.id, 'title', e.target.value)} placeholder="Macrame knot tutorial" />
                  </label>
                  <label className="admin-field"><span>Short description <small>(optional)</small></span>
                    <textarea rows="2" value={v.description || ''} onChange={e => upd(v.id, 'description', e.target.value)} />
                  </label>
                </div>
              </div>

              <div className="admin-field">
                <span>Custom thumbnail <small>(optional, otherwise YouTube's is used)</small></span>
                <ImageRowEditor
                  images={v.photo ? [v.photo] : []}
                  onChange={imgs => upd(v.id, 'photo', imgs[imgs.length - 1] || '')}
                  onToast={onToast}
                  aspect={16 / 9}
                  outW={1200}
                  outH={675}
                />
              </div>

              <div className="admin-edit-card-footer">
                <div className="admin-header-actions">
                  <button className="admin-image-action-btn" onClick={() => move(i, i - 1)} disabled={i === 0} title="Move up"><i className="fas fa-arrow-up" /></button>
                  <button className="admin-image-action-btn" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} title="Move down"><i className="fas fa-arrow-down" /></button>
                </div>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => del(v.id)}><i className="fas fa-trash" /> Remove video</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Journal (Blog) Tab ────────────────────────────────────────────────────────
function BlogTab({ onToast }) {
  const [items, setItems] = useState(() => getBlog().map(x => ({ ...x })))
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const upd = (id, f, v) => { setItems(p => p.map(it => it.id === id ? { ...it, [f]: v } : it)); setDirty(true) }
  const slugify = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const addItem = () => {
    const id = Date.now()
    setItems(p => [{ id, title: 'New Journal Post', slug: 'new-post-' + id, category: 'Travel & Inspiration', tag: 'travel', date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), readTime: '5 min read', excerpt: '', image: '', featured: false, author: 'Sapna', content: '' }, ...p])
    setDirty(true)
  }
  const del = (id) => { if (!window.confirm('Delete this journal post?')) return; setItems(p => p.filter(it => it.id !== id)); setDirty(true) }

  const handleSave = async () => {
    const cleaned = items.map(it => ({ ...it, slug: it.slug || slugify(it.title) }))
    try {
      announceUpload(cleaned, onToast)
      setItems(await saveBlog(cleaned)); setDirty(false)
      onToast('Journal saved and now live on your website!', 'success')
    }
    catch (e) { onToast(saveErrorMessage(e), 'error') }
  }
  const doReset = async () => {
    try { await resetBlog(); setItems(getBlog().map(x => ({ ...x }))); setDirty(false); setConfirm(false); onToast('Journal reset to defaults.', 'success') }
    catch (e) { setConfirm(false); onToast('Could not reset. Try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      {confirm && <ConfirmModal msg="Reset the Journal to default posts? Your changes will be lost." onConfirm={doReset} onCancel={() => setConfirm(false)} />}
      <div className="admin-section-header">
        <div><h2>Journal</h2><p>Write and manage the blog posts shown on the Journal page.</p></div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(true)}><i className="fas fa-undo" /> Reset</button>
          <button className="admin-btn admin-btn-primary" onClick={addItem}><i className="fas fa-plus" /> Add post</button>
        </div>
      </div>

      <div className="admin-edit-list">
        {items.map(b => (
          <div key={b.id} className="admin-edit-card">
            <div className="admin-field-grid">
              <label className="admin-field span3"><span>Title</span>
                <input type="text" value={b.title || ''} onChange={e => upd(b.id, 'title', e.target.value)} /></label>
              <label className="admin-field"><span>Category</span>
                <input type="text" value={b.category || ''} onChange={e => upd(b.id, 'category', e.target.value)} /></label>
              <label className="admin-field"><span>Tag</span>
                <input type="text" value={b.tag || ''} onChange={e => upd(b.id, 'tag', e.target.value)} /></label>
              <label className="admin-field"><span>Date</span>
                <input type="text" value={b.date || ''} onChange={e => upd(b.id, 'date', e.target.value)} /></label>
              <label className="admin-field"><span>Read time</span>
                <input type="text" value={b.readTime || ''} onChange={e => upd(b.id, 'readTime', e.target.value)} placeholder="6 min read" /></label>
              <label className="admin-field"><span>Author</span>
                <input type="text" value={b.author || ''} onChange={e => upd(b.id, 'author', e.target.value)} /></label>
              <label className="admin-field span3"><span>Excerpt (short summary)</span>
                <textarea rows="2" value={b.excerpt || ''} onChange={e => upd(b.id, 'excerpt', e.target.value)} /></label>
              <label className="admin-field span3"><span>Full article (use a blank line between paragraphs; **text** for bold headings)</span>
                <textarea rows="10" value={b.content || ''} onChange={e => upd(b.id, 'content', e.target.value)} /></label>
            </div>
            <div className="admin-field"><span>Cover photo</span>
              <ImageRowEditor images={b.image ? [b.image] : []} onChange={imgs => upd(b.id, 'image', imgs[imgs.length - 1] || '')} onToast={onToast} aspect={16 / 9} outW={1200} outH={675} />
            </div>
            <div className="admin-edit-card-footer">
              <label className="admin-checkbox">
                <input type="checkbox" checked={!!b.featured} onChange={e => upd(b.id, 'featured', e.target.checked)} /> Featured post
              </label>
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => del(b.id)}><i className="fas fa-trash" /> Delete post</button>
            </div>
          </div>
        ))}
      </div>
      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Custom Orders Tab (intro + process text) ──────────────────────────────────
function CustomOrdersTab({ onToast }) {
  const [data, setData] = useState(() => {
    const c = getCustomOrders()
    return { ...c, steps: (c.steps || []).map(s => ({ ...s })) }
  })
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const upd = (f, v) => { setData(d => ({ ...d, [f]: v })); setDirty(true) }
  const updStep = (i, f, v) => { setData(d => ({ ...d, steps: d.steps.map((s, idx) => idx === i ? { ...s, [f]: v } : s) })); setDirty(true) }

  const handleSave = async () => {
    try {
      announceUpload(data, onToast)
      setData(await saveCustomOrders(data)); setDirty(false)
      onToast('Custom Orders page saved and now live on your website!', 'success')
    }
    catch (e) { onToast(saveErrorMessage(e), 'error') }
  }
  const doReset = async () => {
    try {
      await resetCustomOrders()
      const c = getCustomOrders(); setData({ ...c, steps: (c.steps || []).map(s => ({ ...s })) })
      setDirty(false); setConfirm(false); onToast('Custom Orders text reset to defaults.', 'success')
    } catch (e) { setConfirm(false); onToast('Could not reset. Try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      {confirm && <ConfirmModal msg="Reset the Custom Orders intro and steps to defaults? Your changes will be lost." onConfirm={doReset} onCancel={() => setConfirm(false)} />}
      <div className="admin-section-header">
        <div><h2>Custom Orders</h2><p>Edit the intro at the top of the Custom Orders page and the "How It Works" steps. (Prices, examples and the form stay as they are.)</p></div>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(true)}><i className="fas fa-undo" /> Reset</button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
        </div>
      </div>

      <div className="admin-edit-card">
        <div className="admin-field-grid">
          <label className="admin-field span3"><span>Top heading</span>
            <input type="text" value={data.heroTitle || ''} onChange={e => upd('heroTitle', e.target.value)} /></label>
          <label className="admin-field span3"><span>Intro paragraph</span>
            <textarea rows="2" value={data.heroIntro || ''} onChange={e => upd('heroIntro', e.target.value)} /></label>
          <label className="admin-field span3"><span>"How It Works" heading</span>
            <input type="text" value={data.processHeading || ''} onChange={e => upd('processHeading', e.target.value)} /></label>
        </div>
      </div>

      <h3 className="siteimg-group-title">How It Works, steps</h3>
      <div className="admin-edit-list">
        {(data.steps || []).map((s, i) => (
          <div key={i} className="admin-edit-card">
            <div className="admin-field-grid">
              <label className="admin-field"><span>Step {i + 1} icon (emoji)</span>
                <input type="text" value={s.icon || ''} onChange={e => updStep(i, 'icon', e.target.value)} /></label>
              <label className="admin-field span2"><span>Step {i + 1} title</span>
                <input type="text" value={s.title || ''} onChange={e => updStep(i, 'title', e.target.value)} /></label>
              <label className="admin-field span3"><span>Step {i + 1} description</span>
                <textarea rows="2" value={s.desc || ''} onChange={e => updStep(i, 'desc', e.target.value)} /></label>
            </div>
          </div>
        ))}
      </div>

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Shop Setup Tab (categories + themes) ──────────────────────────────────────
function ShopSetupTab({ onToast }) {
  const [cats, setCats] = useState(() => getCategories().map(x => ({ ...x })))
  const [dirty, setDirty] = useState(false)
  const products = getProducts()

  // A category's id is what every product points at, so it is generated once
  // and never shown or edited. It used to be an editable field sitting next to
  // the name, and typing the new name into it renamed the id too, which
  // detached every product already filed under the old one.
  const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

  const updCat = (i, f, v) => { setCats(p => p.map((c, idx) => idx === i ? { ...c, [f]: v } : c)); setDirty(true) }
  const addCat = () => { setCats(p => [...p, { id: newId(), label: 'New Category', icon: '🎨' }]); setDirty(true) }
  const delCat = (i) => { setCats(p => p.filter((_, idx) => idx !== i)); setDirty(true) }

  // How many products sit in each category, and how many are in none.
  const countFor = (id) => products.filter(p => p.category === id).length
  const orphanCount = products.filter(p => !cats.some(c => c.id === p.category)).length

  const handleSave = async () => {
    try {
      // Trim so a stray space in a name can never produce a mismatched id.
      await saveCategories(cats.map(c => ({ ...c, id: String(c.id).trim(), label: String(c.label || '').trim() })))
      setDirty(false)
      onToast('Shop categories saved and now live on your website!', 'success')
    } catch (e) { onToast('Could not save. Check your connection and try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div><h2>Shop Setup</h2><p>The categories used to organise and filter products in the Shop.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>

      {orphanCount > 0 && (
        <div className="admin-empty-note">
          <i className="fas fa-exclamation-triangle" />
          <div>
            <strong>{orphanCount} {orphanCount === 1 ? 'product is' : 'products are'} not in any category</strong>
            <span>They only appear under "All Art" in the Shop. Open the Products tab and filter by "Not in any category" to assign them.</span>
          </div>
        </div>
      )}

      <div className="admin-settings-card">
        <h3><i className="fas fa-tags" /> Shop Categories</h3>
        <p className="admin-hint-note">
          The first one ("All Art") is the default filter and can't be removed. Renaming a
          category is safe: products stay with it. Deleting one leaves its products
          uncategorised until you move them.
        </p>
        {cats.map((c, i) => {
          const n = countFor(c.id)
          return (
            <div key={c.id} className="admin-taxo-row">
              <input className="admin-taxo-icon" type="text" value={c.icon || ''} onChange={e => updCat(i, 'icon', e.target.value)} placeholder="🎨" title="Icon (emoji)" />
              <input className="admin-taxo-label" type="text" value={c.label || ''} onChange={e => updCat(i, 'label', e.target.value)} placeholder="Category name" />
              {c.id !== 'all' && <span className="admin-taxo-count">{n} {n === 1 ? 'product' : 'products'}</span>}
              <button className="admin-image-action-btn danger" onClick={() => delCat(i)} disabled={c.id === 'all'} title="Remove"><i className="fas fa-trash" /></button>
            </div>
          )
        })}
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addCat}><i className="fas fa-plus" /> Add category</button>
      </div>

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Inquiries Tab (leads captured from the site) ──────────────────────────────
function InquiriesTab({ onToast }) {
  const [leads, setLeads] = useState(null)
  const [filter, setFilter] = useState('all')

  const load = useCallback(async () => {
    try { setLeads(await listLeads() || []) }
    catch (e) { setLeads([]); onToast('Could not load inquiries. Try again.', 'error') }
  }, [onToast])
  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    try { await updateLeadStatus(id, status) } catch (e) { onToast('Could not update. Try again.', 'error') }
  }

  const typeLabel = { commission: 'Custom order', inquiry: 'Inquiry', newsletter: 'Newsletter', workshop: 'Workshop', booking: 'Workshop booking' }
  const shown = (leads || []).filter(l => filter === 'all' ? true : l.status === filter)
  const fmtDate = (d) => { try { return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) } catch (_) { return d } }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Inquiries</h2>
          <p>Every custom order, message and newsletter signup from your website. Saved here so none are lost.</p>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={load}><i className="fas fa-sync-alt" /> Refresh</button>
      </div>

      <div className="admin-lead-filters">
        {['all', 'new', 'contacted', 'done'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {leads === null ? (
        <p className="admin-empty-note">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="admin-empty-note">No inquiries yet. New form submissions will appear here.</p>
      ) : (
        <div className="admin-leads">
          {shown.map(l => (
            <div key={l.id} className={`admin-lead-card status-${l.status}`}>
              <div className="admin-lead-top">
                <span className="admin-lead-type">{typeLabel[l.type] || l.type}</span>
                <span className="admin-lead-date">{fmtDate(l.created_at)}</span>
              </div>
              {l.name && <strong className="admin-lead-name">{l.name}</strong>}
              <div className="admin-lead-contacts">
                {l.phone && <a href={`https://wa.me/${(l.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"><i className="fab fa-whatsapp" /> {l.phone}</a>}
                {l.email && <a href={`mailto:${l.email}`}><i className="fas fa-envelope" /> {l.email}</a>}
                {l.city && <span><i className="fas fa-map-marker-alt" /> {l.city}</span>}
              </div>
              {(l.budget || l.timeline) && <div className="admin-lead-meta2">{l.budget && <span>Budget: {l.budget}</span>}{l.timeline && <span>Timeline: {l.timeline}</span>}</div>}
              {/* Workshop bookings carry their details in meta. */}
              {l.meta && (l.meta.workshop || l.meta.preferredDate || l.meta.mode || l.meta.people) && (
                <div className="admin-lead-meta2">
                  {l.meta.workshop && <span>Workshop: {l.meta.workshop}</span>}
                  {l.meta.preferredDate && <span>Date: {l.meta.preferredDate}</span>}
                  {l.meta.mode && <span>Format: {l.meta.mode}</span>}
                  {l.meta.people && <span>People: {l.meta.people}</span>}
                </div>
              )}
              {l.message && <p className="admin-lead-msg">{l.message}</p>}
              <div className="admin-lead-actions">
                {['new', 'contacted', 'done'].map(s => (
                  <button key={s} className={`admin-btn admin-btn-sm ${l.status === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setStatus(l.id, s)}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
const SETTINGS_SUBTABS = [
  { id: 'general',   label: 'General',   icon: 'fas fa-cog' },
  { id: 'profile',   label: 'Profile',   icon: 'fas fa-user-circle' },
  { id: 'inquiries', label: 'Inquiries', icon: 'fas fa-inbox' },
]

function SettingsTab({ onToast }) {
  const [sub, setSub]               = useState('general')
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [pwErr, setPwErr]           = useState('')

  const handleChangePw = async (e) => {
    e.preventDefault()
    if (newPw.length < 6) {
      setPwErr('New password must be at least 6 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setPwErr('Passwords do not match.')
      return
    }
    try {
      await changeAdminPassword(currentPw, newPw)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwErr('')
      onToast('Password updated successfully!', 'success')
    } catch (err) {
      setPwErr('Current password is incorrect.')
    }
  }

  const handleClearAll = () => {
    if (!window.confirm('Refresh this device from the live website? Your published content is safe. This only clears the local copy and reloads the latest from the cloud.')) return
    localStorage.removeItem('sapna_admin_products')
    localStorage.removeItem('sapna_admin_profile')
    localStorage.removeItem('sapna_admin_gallery')
    localStorage.removeItem('sapna_admin_projects')
    onToast('Refreshing from the live website…', 'success')
    setTimeout(() => window.location.reload(), 1500)
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Settings</h2>
          <p>Profile, inquiries and admin password</p>
        </div>
      </div>

      {/* Sub-navigation for the pages that live inside Settings */}
      <div className="admin-subnav">
        {SETTINGS_SUBTABS.map(s => (
          <button
            key={s.id}
            className={`admin-subnav-item ${sub === s.id ? 'active' : ''}`}
            onClick={() => setSub(s.id)}
          >
            <i className={s.icon} /> <span>{s.label}</span>
          </button>
        ))}
      </div>

      {sub === 'profile'   && <ProfileTab onToast={onToast} />}
      {sub === 'inquiries' && <InquiriesTab onToast={onToast} />}

      {sub === 'general' && (
      <div className="admin-settings-grid">
        {/* Change Password */}
        <div className="admin-settings-card">
          <h3><i className="fas fa-lock" /> Change Admin Password</h3>
          <p>Change the password used to access this admin dashboard.</p>
          <form onSubmit={handleChangePw}>
            <div className="admin-field-group">
              <label>Current Password</label>
              <div className="admin-pw-field">
                <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                <button type="button" onClick={() => setShowCurrent(s => !s)}><i className={`fas fa-eye${showCurrent ? '-slash' : ''}`} /></button>
              </div>
            </div>
            <div className="admin-field-group">
              <label>New Password <small>(min. 6 characters)</small></label>
              <div className="admin-pw-field">
                <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} />
                <button type="button" onClick={() => setShowNew(s => !s)}><i className={`fas fa-eye${showNew ? '-slash' : ''}`} /></button>
              </div>
            </div>
            <div className="admin-field-group">
              <label>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            {pwErr && <p className="admin-field-err"><i className="fas fa-times-circle" /> {pwErr}</p>}
            <button type="submit" className="admin-btn admin-btn-primary">
              <i className="fas fa-key" /> Update Password
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="admin-settings-card">
          <h3><i className="fas fa-info-circle" /> How Admin Data Works</h3>
          <p>Your changes (products, profile, gallery, projects) are saved to the <strong>cloud</strong> and go live on your website for everyone, instantly.</p>
          <ul className="admin-info-list">
            <li><i className="fas fa-check" /> Changes show on the live site right away</li>
            <li><i className="fas fa-check" /> Log in and edit from any device or phone</li>
            <li><i className="fas fa-check" /> Everyone visiting the site sees the same content</li>
            <li><i className="fas fa-check" /> Nothing is lost if you clear your browser</li>
          </ul>
        </div>

        {/* Refresh this device */}
        <div className="admin-settings-card danger-zone">
          <h3><i className="fas fa-sync-alt" /> Refresh This Device</h3>
          <p>Reload the latest published content from the cloud onto this device. Your live website content is not affected.</p>
          <button className="admin-btn admin-btn-danger" onClick={handleClearAll}>
            <i className="fas fa-sync-alt" /> Refresh From Live Site
          </button>
        </div>
      </div>
      )}
    </div>
  )
}

// ── Main Admin Component ───────────────────────────────────────────────────────
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts]   = useState(() => getProducts())
  const [profile]                 = useState(() => getProfile())
  const [gallery]                 = useState(() => getGallery())
  const [projects, setProjects]   = useState(() => getProjects())
  const [toast, setToast]         = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, key: Date.now() })
  }, [])

  const handleLogout = () => {
    adminLogout()
    setLoggedIn(false)
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="admin-logo-mark">S</div>
          <div>
            <span className="admin-logo-name">Art Studio</span>
            <span className="admin-logo-sub">Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
            >
              <i className={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <i className="fas fa-external-link-alt" />
            <span>View Website</span>
          </Link>
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(s => !s)}>
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`} />
          </button>
          <h1 className="admin-topbar-title">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="admin-topbar-right">
            <span className="admin-topbar-user">
              <i className="fas fa-user-circle" /> Admin
            </span>
            <a href={waLink()} target="_blank" rel="noreferrer" className="admin-btn admin-btn-whatsapp">
              <i className="fab fa-whatsapp" />
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <DashboardTab
              products={products}
              profile={profile}
              gallery={gallery}
              projects={projects}
              onTabChange={setActiveTab}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              onSave={setProducts}
              onToast={showToast}
            />
          )}
          {activeTab === 'gallery' && (
            <GalleryTab onToast={showToast} />
          )}
          {activeTab === 'projects' && (
            <ProjectsTab projects={projects} onSave={setProjects} onToast={showToast} />
          )}
          {activeTab === 'recycle' && (
            <RecycleTab onToast={showToast} />
          )}
          {activeTab === 'workshops' && (
            <WorkshopsTab onToast={showToast} />
          )}
          {activeTab === 'videos' && (
            <VideosTab onToast={showToast} />
          )}
          {activeTab === 'blog' && (
            <BlogTab onToast={showToast} />
          )}
          {activeTab === 'customOrders' && (
            <CustomOrdersTab onToast={showToast} />
          )}
          {activeTab === 'shopSetup' && (
            <ShopSetupTab onToast={showToast} />
          )}
          {activeTab === 'siteText' && (
            <SiteTextTab onToast={showToast} />
          )}
          {activeTab === 'siteImages' && (
            <SiteImagesTab onToast={showToast} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab onToast={showToast} />
          )}
        </div>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  )
}
