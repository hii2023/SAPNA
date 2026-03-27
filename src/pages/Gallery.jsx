import React, { useState, useEffect } from 'react'
import { galleryItems, galleryCategories } from '../data/gallery'
import './Gallery.css'

function Lightbox({ item, items, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><i className="fas fa-times" /></button>
      <button className="lightbox-prev" onClick={e => { e.stopPropagation(); onPrev() }}><i className="fas fa-chevron-left" /></button>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <img src={item.image} alt={item.title} />
        <div className="lightbox-info">
          <div>
            <span className="tag tag-terracotta">{item.category}</span>
            <h3>{item.title}</h3>
            <p className="lightbox-project">{item.project} · {item.year}</p>
            <p className="lightbox-desc">{item.description}</p>
            <p className="lightbox-size"><i className="fas fa-ruler-combined" /> {item.size}</p>
          </div>
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Sapna! I love the piece "${item.title}" in your gallery. Is it available or can I commission something similar? 🌸`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-whatsapp"
          >
            <i className="fab fa-whatsapp" /> Enquire About This Piece
          </a>
        </div>
      </div>
      <button className="lightbox-next" onClick={e => { e.stopPropagation(); onNext() }}><i className="fas fa-chevron-right" /></button>
    </div>
  )
}

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [isVisible, setIsVisible] = useState({})

  const filtered = activeFilter === 'all' ? galleryItems : galleryItems.filter(item => item.category === activeFilter)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setIsVisible(v => ({ ...v, [e.target.dataset.id]: true }))
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-id]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const openLightbox = (i) => { setLightboxIndex(i); document.body.style.overflow = 'hidden' }
  const closeLightbox = () => { setLightboxIndex(null); document.body.style.overflow = '' }
  const prevItem = () => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length)
  const nextItem = () => setLightboxIndex(i => (i + 1) % filtered.length)

  return (
    <div className="gallery-page">
      {/* ── Hero ── */}
      <div className="page-hero gallery-hero">
        <div className="page-hero-content">
          <span className="section-label">A Visual Journey</span>
          <h1>Gallery & Projects</h1>
          <p>Macrame · Paintings · Stitching · Commissions · Behind the Scenes</p>
        </div>
      </div>

      <section className="section gallery-section">
        <div className="container-wide">
          {/* Filter */}
          <div className="gallery-filters" data-id="gallery-filters">
            <div className={`gallery-filter-inner fade-up ${isVisible['gallery-filters'] ? 'visible' : ''}`}>
              {galleryCategories.map(c => (
                <button
                  key={c.id}
                  className={`filter-chip ${activeFilter === c.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
              <span className="gallery-count">{filtered.length} pieces</span>
            </div>
          </div>

          {/* Masonry Grid */}
          <div className="gallery-masonry" data-id="gallery-grid">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className={`gallery-item ${item.cols === 2 ? 'col-2' : ''} fade-up ${isVisible['gallery-grid'] ? 'visible' : ''}`}
                style={{ transitionDelay: `${(i % 4) * .08}s` }}
                onClick={() => openLightbox(i)}
              >
                <div className="gallery-img-wrap">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  {item.featured && <span className="gallery-featured-badge">⭐ Featured</span>}
                  <div className="gallery-hover">
                    <div className="gallery-hover-content">
                      <span className="tag tag-terracotta">{item.category}</span>
                      <h4>{item.title}</h4>
                      <p>{item.project}</p>
                      <span className="gallery-view-btn"><i className="fas fa-expand-alt" /> View</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
              <p>No items found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Commission CTA ── */}
      <section className="gallery-commission" data-id="comm">
        <div className={`container fade-up ${isVisible['comm'] ? 'visible' : ''}`}>
          <div className="commission-inner">
            <div className="commission-text">
              <span className="section-label" style={{ color: 'rgba(255,255,255,.7)' }}>Custom Commissions</span>
              <h2>Love What You See?<br />Let's Create Something Just for You</h2>
              <p>Every piece in this gallery started as a conversation. Tell Sapna what you have in mind — she'd love to bring your vision to life.</p>
            </div>
            <div className="commission-actions">
              <a href="/custom-orders" className="btn btn-primary btn-lg">Request Custom Order</a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <i className="fab fa-whatsapp" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          item={filtered[lightboxIndex]}
          items={filtered}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </div>
  )
}
