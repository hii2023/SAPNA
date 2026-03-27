import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  isAdminLoggedIn, adminLogin, adminLogout,
  getProducts, saveProducts, resetProducts,
  getProfile, saveProfile, resetProfile, DEFAULT_PROFILE,
  getGallery, saveGallery, resetGallery,
  getAdminPassword, setAdminPassword,
} from '../data/adminData'
import { categories, themes, products as defaultProducts } from '../data/products'
import { galleryCategories, galleryItems as defaultGallery } from '../data/gallery'
import './Admin.css'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: 'fas fa-tachometer-alt' },
  { id: 'products',  label: 'Products',   icon: 'fas fa-store' },
  { id: 'profile',   label: 'Profile',    icon: 'fas fa-user-circle' },
  { id: 'gallery',   label: 'Gallery',    icon: 'fas fa-images' },
  { id: 'settings',  label: 'Settings',   icon: 'fas fa-cog' },
]

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

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [show, setShow] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (adminLogin(pw)) {
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
        <p className="admin-login-hint">Default password: <code>sapna2024</code></p>
        <Link to="/" className="admin-back-link"><i className="fas fa-arrow-left" /> Back to website</Link>
      </div>
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ products, profile, gallery, onTabChange }) {
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

  const updateImages = (id, val) => {
    const imgs = val.split('\n').map(s => s.trim()).filter(Boolean)
    update(id, 'images', imgs)
  }

  const updateSizes = (id, val) => {
    const sz = val.split('\n').map(s => s.trim()).filter(Boolean)
    update(id, 'sizes', sz)
  }

  const handleSave = () => {
    saveProducts(items)
    onSave(items)
    setDirty(false)
    onToast('Products saved successfully!', 'success')
  }

  const handleReset = () => { setConfirm(true) }
  const doReset = () => {
    resetProducts()
    const fresh = JSON.parse(JSON.stringify(defaultProducts))
    setItems(fresh)
    onSave(fresh)
    setConfirm(false)
    setDirty(false)
    onToast('Products reset to defaults.', 'success')
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
      sizes: ['Standard — ₹1,000'],
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
    onToast('New product added — fill in the details and save.', 'success')
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
              <img src={product.images[0]} alt={product.name} className="admin-product-thumb" />
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
                  <label>Size Options <small>(one per line, format: "Label — ₹Price")</small></label>
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
                  <label>Image URLs <small>(one per line — first image is the main display image)</small></label>
                  <textarea
                    rows={Math.max(3, product.images.length + 1)}
                    value={product.images.join('\n')}
                    onChange={e => updateImages(product.id, e.target.value)}
                  />
                  <div className="admin-image-previews">
                    {product.images.map((img, i) => (
                      <img key={i} src={img} alt={`Preview ${i + 1}`} title={`Image ${i + 1}`} />
                    ))}
                  </div>
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

  const handleSave = () => {
    saveProfile(form)
    setDirty(false)
    onToast('Profile saved! Reload the site to see changes.', 'success')
  }

  const handleReset = () => setConfirm(true)
  const doReset = () => {
    resetProfile()
    setForm({ ...DEFAULT_PROFILE })
    setDirty(false)
    setConfirm(false)
    onToast('Profile reset to defaults.', 'success')
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
            <img src={form.photo} alt="Profile" onError={e => { e.target.src = 'https://via.placeholder.com/200x200?text=Photo' }} />
          </div>
          <p className="admin-photo-hint">Update the URL below to change your photo</p>
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
            <label>Profile Photo URL</label>
            <input type="url" value={form.photo} onChange={e => handleChange('photo', e.target.value)} placeholder="https://…" />
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

  const update = (id, field, val) => {
    setItems(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g))
    setDirty(true)
  }

  const handleSave = () => {
    saveGallery(items)
    setDirty(false)
    onToast('Gallery saved!', 'success')
  }

  const handleReset = () => setConfirm(true)
  const doReset = () => {
    resetGallery()
    setItems(JSON.parse(JSON.stringify(defaultGallery)))
    setDirty(false)
    setConfirm(false)
    onToast('Gallery reset to defaults.', 'success')
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
          <div key={item.id} className="admin-gallery-card">
            <div className="admin-gallery-img-wrap" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <img src={item.image} alt={item.title} onError={e => { e.target.style.opacity = '0.3' }} />
              {item.featured && <span className="admin-featured-dot">⭐</span>}
              <div className="admin-gallery-overlay">
                <span><i className="fas fa-edit" /> Edit</span>
              </div>
            </div>
            <div className="admin-gallery-card-info">
              <span>{item.title}</span>
              <span className="admin-cat-chip">{item.category}</span>
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
                  <label>Image URL</label>
                  <input type="url" value={item.image} onChange={e => update(item.id, 'image', e.target.value)} />
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

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ onToast, onLogout }) {
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [pwErr, setPwErr]           = useState('')

  const handleChangePw = (e) => {
    e.preventDefault()
    const stored = getAdminPassword()
    if (currentPw !== stored) {
      setPwErr('Current password is incorrect.')
      return
    }
    if (newPw.length < 6) {
      setPwErr('New password must be at least 6 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setPwErr('Passwords do not match.')
      return
    }
    setAdminPassword(newPw)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setPwErr('')
    onToast('Password updated successfully!', 'success')
  }

  const handleClearAll = () => {
    if (!window.confirm('Clear ALL admin data (products, profile, gallery, password)? This cannot be undone.')) return
    localStorage.removeItem('sapna_admin_products')
    localStorage.removeItem('sapna_admin_profile')
    localStorage.removeItem('sapna_admin_gallery')
    localStorage.removeItem('sapna_admin_password')
    onToast('All admin data cleared. Reloading…', 'success')
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
          <p>All your changes (products, profile, gallery) are saved in your browser's <strong>localStorage</strong>. They persist across sessions on this device and browser.</p>
          <ul className="admin-info-list">
            <li><i className="fas fa-check" /> Changes are instant — no server needed</li>
            <li><i className="fas fa-check" /> Data stays when you close the browser</li>
            <li><i className="fas fa-exclamation" /> Clearing browser data will reset everything</li>
            <li><i className="fas fa-exclamation" /> Changes are per-device (not synced)</li>
          </ul>
          <div className="admin-storage-info">
            <strong>LocalStorage used:</strong>
            <span>{Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="admin-settings-card danger-zone">
          <h3><i className="fas fa-exclamation-triangle" /> Danger Zone</h3>
          <p>Clear all admin data and reset the site to its original default state. This cannot be undone.</p>
          <button className="admin-btn admin-btn-danger" onClick={handleClearAll}>
            <i className="fas fa-trash-alt" /> Clear All Admin Data
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
