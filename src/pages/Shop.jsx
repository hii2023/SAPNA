import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, themes, getWhatsAppLink } from '../data/products'
import { getProducts } from '../data/adminData'
import './Shop.css'

function ProductModal({ product, onClose }) {
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.size)

  if (!product) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        <div className="modal-inner">
          <div className="modal-gallery">
            <div className="modal-main-img img-overlay">
              <img src={product.images[selectedImg]} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div className="modal-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`modal-thumb ${i === selectedImg ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-details">
            <div className="modal-tags">
              <span className="tag tag-terracotta">{product.category}</span>
              <span className="tag tag-sage">{product.theme}</span>
              {product.isNew && <span className="tag tag-gold">New</span>}
              {product.isBestseller && <span className="tag" style={{ background: '#fff3cd', color: '#856404' }}>Bestseller ⭐</span>}
            </div>
            <h2 className="modal-title">{product.name}</h2>
            <div className="modal-price-row">
              <span className="modal-price">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="modal-orig">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {product.originalPrice && (
                <span className="modal-save">
                  Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="modal-desc">{product.description}</p>
            <div className="modal-section">
              <label className="form-label">Size / Option</label>
              <div className="size-options">
                {product.sizes.map((s, i) => (
                  <button
                    key={i}
                    className={`size-btn ${selectedSize === s.split(' — ')[0] || (i === 0 && selectedSize === product.size) ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <div className="modal-meta">
                <div><i className="fas fa-palette" /> <strong>Materials:</strong> {product.materials}</div>
                <div><i className="fas fa-info-circle" /> <strong>Care:</strong> {product.careInstructions}</div>
              </div>
            </div>
            {!product.available ? (
              <div className="modal-sold-out">
                <i className="fas fa-clock" /> Currently Sold Out
                <p>Want to be notified when it's back? Message Sapna on WhatsApp!</p>
                <a href={`https://wa.me/918511341910?text=${encodeURIComponent(`Hi Sapna! I'm interested in "${product.name}" but it shows sold out. Please notify me when it's available again! 🙏`)}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <i className="fab fa-whatsapp" /> Notify Me
                </a>
              </div>
            ) : (
              <a
                href={getWhatsAppLink(product, selectedSize)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg modal-buy-btn"
              >
                <i className="fab fa-whatsapp" /> Buy via WhatsApp
              </a>
            )}
            <p className="modal-note">
              <i className="fas fa-shield-alt" /> Handmade with love · Ships within 5–7 days · Secure packaging
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const [products] = useState(() => getProducts())
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || 'all')
  const [activeTheme, setActiveTheme] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat) setActiveCat(cat)
  }, [searchParams])

  const handleCatChange = (id) => {
    setActiveCat(id)
    if (id !== 'all') setSearchParams({ cat: id })
    else setSearchParams({})
  }

  let filtered = products.filter(p => {
    const matchCat   = activeCat === 'all'   || p.category === activeCat
    const matchTheme = activeTheme === 'all' || p.theme === activeTheme
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchAvail  = !showAvailableOnly || p.available
    return matchCat && matchTheme && matchSearch && matchAvail
  })

  if (sortBy === 'price-asc')  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sortBy === 'newest')     filtered = [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))

  return (
    <div className="shop-page">
      {/* ── Hero ── */}
      <div className="page-hero shop-hero">
        <div className="page-hero-content">
          <span className="section-label">Every Piece, Made by Hand</span>
          <h1>The Shop</h1>
          <p>Macrame · Paintings · Stitching · DIY Kits — handcrafted in Ahmedabad with love & wanderlust</p>
        </div>
      </div>

      <section className="section shop-section">
        <div className="container-wide">
          {/* ── Filter Bar ── */}
          <div className="shop-filters">
            <div className="filter-search-wrap">
              <i className="fas fa-search filter-search-icon" />
              <input
                type="search"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="filter-search"
              />
            </div>
            <div className="filter-cats">
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`filter-chip ${activeCat === c.id ? 'active' : ''}`}
                  onClick={() => handleCatChange(c.id)}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            <div className="filter-right">
              <select className="form-control filter-theme" value={activeTheme} onChange={e => setActiveTheme(e.target.value)}>
                {themes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select className="form-control filter-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Sort: Default</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
              <label className="filter-avail-label">
                <input type="checkbox" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)} />
                Available Only
              </label>
            </div>
          </div>

          {/* ── Results info ── */}
          <div className="shop-results-info">
            <span>{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} found</span>
            {(activeCat !== 'all' || activeTheme !== 'all' || searchQuery) && (
              <button className="clear-filters" onClick={() => { setActiveCat('all'); setActiveTheme('all'); setSearchQuery(''); setSearchParams({}) }}>
                <i className="fas fa-times" /> Clear Filters
              </button>
            )}
          </div>

          {/* ── Products Grid ── */}
          {filtered.length === 0 ? (
            <div className="shop-empty">
              <span>🔍</span>
              <h3>No pieces found</h3>
              <p>Try a different filter or search term.</p>
              <button className="btn btn-outline" onClick={() => { setActiveCat('all'); setActiveTheme('all'); setSearchQuery('') }}>
                Show All Art
              </button>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map(product => (
                <div key={product.id} className="shop-product-card">
                  <div className="shop-img-wrap img-overlay" onClick={() => setSelectedProduct(product)}>
                    <img src={product.images[0]} alt={product.name} loading="lazy" />
                    {product.isNew      && <span className="product-badge new">New ✨</span>}
                    {product.isBestseller && !product.isNew && <span className="product-badge best">⭐ Best</span>}
                    {!product.available && <div className="product-sold-out">Sold Out</div>}
                    <div className="shop-img-hover">
                      <button className="btn btn-outline btn-sm" style={{ borderColor: '#fff', color: '#fff', background: 'rgba(0,0,0,.15)' }}>
                        Quick View
                      </button>
                    </div>
                    {product.images.length > 1 && (
                      <div className="img-count"><i className="fas fa-images" /> {product.images.length}</div>
                    )}
                  </div>
                  <div className="shop-card-info">
                    <span className="tag tag-terracotta">{product.category}</span>
                    <h3 className="shop-card-name" onClick={() => setSelectedProduct(product)}>{product.name}</h3>
                    <p className="shop-card-size">{product.size}</p>
                    <div className="shop-card-footer">
                      <div className="shop-price-row">
                        <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && <span className="product-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
                      </div>
                      {product.available ? (
                        <a
                          href={getWhatsAppLink(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp btn-sm"
                        >
                          <i className="fab fa-whatsapp" /> Buy
                        </a>
                      ) : (
                        <span className="shop-unavail">Sold Out</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Shipping Banner ── */}
      <div className="shop-shipping-banner">
        <div className="container">
          <div className="shipping-items">
            <div className="shipping-item"><i className="fas fa-shipping-fast" /> Free shipping on orders above ₹2,000</div>
            <div className="shipping-item"><i className="fas fa-box-open" /> Shipped in 5–7 business days</div>
            <div className="shipping-item"><i className="fas fa-leaf" /> Eco-friendly packaging</div>
            <div className="shipping-item"><i className="fab fa-whatsapp" /> Buy securely via WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  )
}
