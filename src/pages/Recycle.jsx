import React, { useState, useEffect } from 'react'
import { getWhatsAppLink } from '../data/products'
import { getRecycle } from '../data/adminData'
import './Shop.css'
import './Recycle.css'

// Fullscreen photo viewer — tap a photo to see it full-size.
function PhotoLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="photo-lightbox" onClick={onClose}>
      <button className="photo-lightbox-close" onClick={onClose} aria-label="Close">
        <i className="fas fa-times" />
      </button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} />
    </div>
  )
}

function RecycleModal({ product, onClose }) {
  const [selectedImg, setSelectedImg] = useState(0)
  const [zoom, setZoom] = useState(false)
  const images = product.images && product.images.length ? product.images : ['']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        <div className="modal-inner">
          <div className="modal-gallery">
            <div className="modal-main-img img-overlay is-zoomable" onClick={() => setZoom(true)} title="Click to view full photo">
              <img src={images[selectedImg]} alt={product.name} />
              <span className="modal-zoom-hint"><i className="fas fa-expand" /> Click to enlarge</span>
            </div>
            {images.length > 1 && (
              <div className="modal-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`modal-thumb ${i === selectedImg ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal-details">
            <div className="modal-tags">
              {product.condition && <span className="tag tag-sage">{product.condition}</span>}
            </div>
            <h2 className="modal-title">{product.name}</h2>
            <div className="modal-price-row">
              <span className="modal-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="modal-orig">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
              )}
            </div>
            {product.description && <p className="modal-desc">{product.description}</p>}
            <div className="modal-section">
              <div className="modal-meta">
                {product.size && <div><i className="fas fa-ruler-combined" /> <strong>Size:</strong> {product.size}</div>}
                {product.material && <div><i className="fas fa-recycle" /> <strong>Made from:</strong> {product.material}</div>}
              </div>
            </div>
            {product.available === false ? (
              <div className="modal-sold-out">
                <i className="fas fa-clock" /> Currently Unavailable
                <p>This is a one-of-a-kind piece and may be gone. Message Sapna to check!</p>
                <a href={`https://wa.me/918511341910?text=${encodeURIComponent(`Hi Sapna! Is "${product.name}" from the Second Life collection still available? 🙏`)}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <i className="fab fa-whatsapp" /> Ask Sapna
                </a>
              </div>
            ) : (
              <a href={getWhatsAppLink(product)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg modal-buy-btn">
                <i className="fab fa-whatsapp" /> Buy via WhatsApp
              </a>
            )}
            <p className="modal-note">
              <i className="fas fa-recycle" /> Made from recycled & upcycled materials · One-of-a-kind
            </p>
          </div>
        </div>
        {zoom && (
          <PhotoLightbox src={images[selectedImg]} alt={product.name} onClose={() => setZoom(false)} />
        )}
      </div>
    </div>
  )
}

export default function Recycle() {
  const [items] = useState(() => getRecycle())
  const [selected, setSelected] = useState(null)

  return (
    <div className="recycle-page">
      <section className="recycle-hero">
        <div className="container">
          <span className="section-label">Recycled &amp; Upcycled</span>
          <h1>Second Life</h1>
          <p>Beautiful pieces given a new beginning — handcrafted from reclaimed, recycled, and upcycled materials. Kind to the planet, one-of-a-kind for your home.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="recycle-empty">
              <i className="fas fa-recycle" />
              <p>New Second Life pieces are coming soon. Check back shortly!</p>
            </div>
          ) : (
            <div className="recycle-grid">
              {items.map(product => (
                <div key={product.id} className="recycle-card">
                  <div className="recycle-img-wrap img-overlay" onClick={() => setSelected(product)}>
                    <img src={(product.images && product.images[0]) || ''} alt={product.name} loading="lazy" />
                    {product.condition && <span className="recycle-badge">{product.condition}</span>}
                    {product.available === false && <div className="product-sold-out">Unavailable</div>}
                  </div>
                  <div className="recycle-info">
                    <h3 className="recycle-name" onClick={() => setSelected(product)}>{product.name}</h3>
                    {product.material && <p className="recycle-material">{product.material}</p>}
                    <div className="recycle-price-row">
                      <span className="recycle-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                      {product.originalPrice && (
                        <span className="recycle-orig">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(product)}>View details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && <RecycleModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
