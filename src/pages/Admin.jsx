import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  isAdminLoggedIn, adminLogin, adminLogout,
  getProducts, saveProducts, resetProducts,
  getProfile, saveProfile, resetProfile, DEFAULT_PROFILE,
  getGallery, saveGallery, resetGallery,
  getProjects, saveProjects, resetProjects,
  getSiteImages, saveSiteImages,
  getWorkshops, saveWorkshops, resetWorkshops,
  getCategories, saveCategories, resetCategories,
  getThemes, saveThemes, resetThemes,
  getBlog, saveBlog, resetBlog,
  getRecycle, saveRecycle, resetRecycle,
  getCustomOrders, saveCustomOrders, resetCustomOrders,
  changeAdminPassword,
} from '../data/adminData'
import { categories, themes, products as defaultProducts } from '../data/products'
import { galleryCategories, galleryItems as defaultGallery } from '../data/gallery'
import { projectCategories, projects as defaultProjects } from '../data/projects'
import { SITE_IMAGE_GROUPS } from '../data/siteImages'
import './Admin.css'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: 'fas fa-tachometer-alt' },
  { id: 'products',  label: 'Products',   icon: 'fas fa-store' },
  { id: 'profile',   label: 'Profile',    icon: 'fas fa-user-circle' },
  { id: 'gallery',   label: 'Gallery',    icon: 'fas fa-images' },
  { id: 'recycle',   label: 'Second Life',icon: 'fas fa-recycle' },
  { id: 'workshops', label: 'Workshops',  icon: 'fas fa-chalkboard-teacher' },
  { id: 'projects',  label: 'Projects',   icon: 'fas fa-drafting-compass' },
  { id: 'blog',      label: 'Journal',    icon: 'fas fa-feather-alt' },
  { id: 'customOrders', label: 'Custom Orders', icon: 'fas fa-pen-fancy' },
  { id: 'shopSetup', label: 'Shop Setup', icon: 'fas fa-sliders-h' },
  { id: 'siteImages',label: 'Website Photos', icon: 'fas fa-image' },
  { id: 'settings',  label: 'Settings',   icon: 'fas fa-cog' },
]

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Failed to read file'))
  reader.readAsDataURL(file)
})

const readFilesAsDataUrls = async (fileList) => {
  const files = Array.from(fileList || []).filter(file => file.type.startsWith('image/'))
  if (!files.length) return []
  return Promise.all(files.map(readFileAsDataUrl))
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
            <button className="admin-action-item" onClick={() => onTabChange('profile')}>
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
      await saveProducts(items)
      onSave(items)
      setDirty(false)
      onToast('Products saved and now live on your website!', 'success')
    } catch (err) {
      onToast('Could not save. Check your connection and try again.', 'error')
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
    const matchCat   = filterCat === 'all'   || p.category === filterCat
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
          {categories.filter(c => c.id !== 'all').map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
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
            <div className="admin-product-row-header" onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}>
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
                <button className="admin-expand-btn">
                  <i className={`fas fa-chevron-${expandedId === product.id ? 'up' : 'down'}`} />
                </button>
              </div>
            </div>

            {/* Expanded Edit Form */}
            {expandedId === product.id && (
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
                    <select value={product.category} onChange={e => update(product.id, 'category', e.target.value)}>
                      {categories.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field-group">
                    <label>Theme</label>
                    <select value={product.theme} onChange={e => update(product.id, 'theme', e.target.value)}>
                      {themes.filter(t => t.id !== 'all').map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
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
                  <label>Upload Product Images <small>(select one or more images, first image is the main display image)</small></label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleImageUpload(product.id, e.target.files)}
                  />
                  <div className="admin-image-previews">
                    {product.images.map((img, i) => (
                      <div key={`${product.id}-${i}`} className="admin-image-preview-item">
                        <ZoomImg src={img} alt={`Preview ${i + 1}`} title={`Image ${i + 1}`} />
                        <div className="admin-image-preview-actions">
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
                  <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                    <i className="fas fa-save" /> Save All Changes
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => deleteProduct(product.id)}>
                    <i className="fas fa-trash" /> Delete This Product
                  </button>
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
      await saveProfile(form)
      setDirty(false)
      onToast('Profile saved and now live on your website!', 'success')
    } catch (err) {
      onToast('Could not save. Check your connection and try again.', 'error')
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
          </div>
          <p className="admin-photo-hint">Upload a photo below to update your profile picture</p>
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
            <label>Profile Photo</label>
            <input type="file" accept="image/*" onChange={e => handlePhotoUpload(e.target.files)} />
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
            <div className="admin-field-group">
              <label>Instagram Handle <small>(without @)</small></label>
              <input type="text" value={form.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder="art_wt_sapna" />
            </div>
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
      await saveGallery(items)
      setDirty(false)
      onToast('Gallery saved and now live on your website!', 'success')
    } catch (err) {
      onToast('Could not save. Check your connection and try again.', 'error')
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
                  <label>Gallery Image</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(item.id, e.target.files)} />
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
      await saveProjects(items)
      onSave(items)
      setDirty(false)
      onToast('Projects saved and now live on your website!', 'success')
    } catch (err) {
      onToast('Could not save. Check your connection and try again.', 'error')
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
                  <label>Project Photos</label>
                  <input type="file" accept="image/*" multiple onChange={e => handleUploadPhotos(item.id, e.target.files)} />
                  <div className="admin-project-photos-grid">
                    {(item.photos || []).map((photo, index) => (
                      <div key={`${item.id}-${index}`} className="admin-project-photo-item">
                        <ZoomImg src={photo} alt={`${item.title} ${index + 1}`} />
                        <button
                          type="button"
                          className="admin-project-photo-remove"
                          onClick={() => removePhoto(item.id, index)}
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          ×
                        </button>
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
function SiteImagesTab({ onToast }) {
  const [overrides, setOverrides] = useState(() => ({ ...getSiteImages() }))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handleUpload = async (key, fileList) => {
    const file = Array.from(fileList || []).find(f => f.type.startsWith('image/'))
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      onToast('That image is larger than 3 MB. Please use a smaller photo.', 'error')
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setUrl(key, dataUrl)
      onToast('Photo added. Click "Save changes" to publish.', 'success')
    } catch (_) {
      onToast('Could not read that image. Please try another.', 'error')
    }
  }

  const resetSlot = (key) => { setUrl(key, '') }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSiteImages(overrides)
      setDirty(false)
      onToast('Website photos saved and now live on your website!', 'success')
    } catch (err) {
      onToast('Could not save. Check your connection and try again.', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Website Photos</h2>
          <p>Change the fixed photos in each section of your website. The name tells you exactly which part will change.</p>
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
                <div className="siteimg-preview">
                  <ZoomImg src={currentUrl(item)} alt={item.label} loading="lazy" />
                  {isCustom(item) && <span className="siteimg-badge">Changed</span>}
                </div>
                <div className="siteimg-body">
                  <strong className="siteimg-label">{item.label}</strong>
                  <span className="siteimg-desc">{item.desc}</span>
                  <div className="siteimg-actions">
                    <label className="admin-btn admin-btn-ghost admin-btn-sm siteimg-upload">
                      <i className="fas fa-upload" /> Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => { handleUpload(item.key, e.target.files); e.target.value = '' }}
                      />
                    </label>
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
    </div>
  )
}

// ── Shared: image row editor (upload / paste URL / reorder / delete) ──────────
function ImageRowEditor({ images, onChange, onToast }) {
  const list = images || []
  const addFiles = async (files) => {
    const urls = await readFilesAsDataUrls(files)
    if (!urls.length) return
    onChange([...list, ...urls])
  }
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
              <button type="button" className="admin-image-action-btn" onClick={() => move(i, i - 1)} disabled={i === 0} title="Move left"><i className="fas fa-arrow-left" /></button>
              <button type="button" className="admin-image-action-btn" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} title="Move right"><i className="fas fa-arrow-right" /></button>
              <button type="button" className="admin-image-action-btn danger" onClick={() => remove(i)} title="Remove"><i className="fas fa-trash" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-image-add-row">
        <label className="admin-btn admin-btn-ghost admin-btn-sm siteimg-upload">
          <i className="fas fa-upload" /> Upload
          <input type="file" accept="image/*" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
        </label>
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
    try { await saveRecycle(items); setDirty(false); onToast('Second Life saved and now live on your website!', 'success') }
    catch (e) { onToast('Could not save. Check your connection and try again.', 'error') }
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
              <ImageRowEditor images={it.images} onChange={imgs => setImages(it.id, imgs)} onToast={onToast} />
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
    try { await saveWorkshops(items); setDirty(false); onToast('Workshops saved and now live on your website!', 'success') }
    catch (e) { onToast('Could not save. Check your connection and try again.', 'error') }
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
              <ImageRowEditor images={w.image ? [w.image] : []} onChange={imgs => upd(w.id, 'image', imgs[imgs.length - 1] || '')} onToast={onToast} />
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
    try { await saveBlog(cleaned); setItems(cleaned); setDirty(false); onToast('Journal saved and now live on your website!', 'success') }
    catch (e) { onToast('Could not save. Check your connection and try again.', 'error') }
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
              <ImageRowEditor images={b.image ? [b.image] : []} onChange={imgs => upd(b.id, 'image', imgs[imgs.length - 1] || '')} onToast={onToast} />
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
    try { await saveCustomOrders(data); setDirty(false); onToast('Custom Orders page saved and now live on your website!', 'success') }
    catch (e) { onToast('Could not save. Check your connection and try again.', 'error') }
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
  const [themes, setThemes] = useState(() => getThemes().map(x => ({ ...x })))
  const [dirty, setDirty] = useState(false)

  const idFrom = (label) => (label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('c' + Date.now())

  const updCat = (i, f, v) => { setCats(p => p.map((c, idx) => idx === i ? { ...c, [f]: v } : c)); setDirty(true) }
  const addCat = () => { setCats(p => [...p, { id: idFrom('new-' + Date.now()), label: 'New Category', icon: '🎨' }]); setDirty(true) }
  const delCat = (i) => { setCats(p => p.filter((_, idx) => idx !== i)); setDirty(true) }

  const updTheme = (i, f, v) => { setThemes(p => p.map((t, idx) => idx === i ? { ...t, [f]: v } : t)); setDirty(true) }
  const addTheme = () => { setThemes(p => [...p, { id: idFrom('new-' + Date.now()), label: 'New Theme' }]); setDirty(true) }
  const delTheme = (i) => { setThemes(p => p.filter((_, idx) => idx !== i)); setDirty(true) }

  const handleSave = async () => {
    try {
      await saveCategories(cats)
      await saveThemes(themes)
      setDirty(false)
      onToast('Shop setup saved and now live on your website!', 'success')
    } catch (e) { onToast('Could not save. Check your connection and try again.', 'error') }
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div><h2>Shop Setup</h2><p>The categories and themes used to organise and filter products in the Shop.</p></div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>

      <div className="admin-settings-card">
        <h3><i className="fas fa-tags" /> Shop Categories</h3>
        <p className="admin-hint-note">The first one ("All Art") is the default filter and can't be removed. Renaming or deleting a category won't change products already assigned to it.</p>
        {cats.map((c, i) => (
          <div key={i} className="admin-taxo-row">
            <input className="admin-taxo-icon" type="text" value={c.icon || ''} onChange={e => updCat(i, 'icon', e.target.value)} placeholder="🎨" title="Icon (emoji)" />
            <input className="admin-taxo-label" type="text" value={c.label || ''} onChange={e => updCat(i, 'label', e.target.value)} placeholder="Category name" />
            <input className="admin-taxo-id" type="text" value={c.id || ''} onChange={e => updCat(i, 'id', e.target.value)} placeholder="id" disabled={c.id === 'all'} title="Internal id (letters/numbers)" />
            <button className="admin-image-action-btn danger" onClick={() => delCat(i)} disabled={c.id === 'all'} title="Remove"><i className="fas fa-trash" /></button>
          </div>
        ))}
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addCat}><i className="fas fa-plus" /> Add category</button>
      </div>

      <div className="admin-settings-card">
        <h3><i className="fas fa-palette" /> Shop Themes</h3>
        <p className="admin-hint-note">The first one ("All Themes") is the default filter and can't be removed.</p>
        {themes.map((t, i) => (
          <div key={i} className="admin-taxo-row">
            <input className="admin-taxo-label" type="text" value={t.label || ''} onChange={e => updTheme(i, 'label', e.target.value)} placeholder="Theme name" />
            <input className="admin-taxo-id" type="text" value={t.id || ''} onChange={e => updTheme(i, 'id', e.target.value)} placeholder="id" disabled={t.id === 'all'} title="Internal id" />
            <button className="admin-image-action-btn danger" onClick={() => delTheme(i)} disabled={t.id === 'all'} title="Remove"><i className="fas fa-trash" /></button>
          </div>
        ))}
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addTheme}><i className="fas fa-plus" /> Add theme</button>
      </div>

      <div className="siteimg-savebar">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!dirty}><i className="fas fa-save" /> Save changes</button>
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ onToast, onLogout }) {
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
          <p>Admin password and data management</p>
        </div>
      </div>

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

        {/* Logout */}
        <div className="admin-settings-card">
          <h3><i className="fas fa-sign-out-alt" /> Session</h3>
          <p>You are currently logged in as admin. Your session lasts until you close the browser tab.</p>
          <button className="admin-btn admin-btn-ghost" onClick={onLogout}>
            <i className="fas fa-sign-out-alt" /> Log Out
          </button>
        </div>
      </div>
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
            <a href="https://wa.me/918511341910" target="_blank" rel="noreferrer" className="admin-btn admin-btn-whatsapp">
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
          {activeTab === 'profile' && (
            <ProfileTab onToast={showToast} />
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
          {activeTab === 'blog' && (
            <BlogTab onToast={showToast} />
          )}
          {activeTab === 'customOrders' && (
            <CustomOrdersTab onToast={showToast} />
          )}
          {activeTab === 'shopSetup' && (
            <ShopSetupTab onToast={showToast} />
          )}
          {activeTab === 'siteImages' && (
            <SiteImagesTab onToast={showToast} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab onToast={showToast} onLogout={handleLogout} />
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
