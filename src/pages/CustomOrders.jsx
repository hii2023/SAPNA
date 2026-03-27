import React, { useState, useEffect } from 'react'
import './CustomOrders.css'

const orderTypes = [
  { id: "macrame", label: "Macrame Wall Hanging", icon: "🪢", from: "₹1,500" },
  { id: "painting", label: "Commissioned Painting", icon: "🖌️", from: "₹2,500" },
  { id: "stitching", label: "Embroidery / Stitching", icon: "🧵", from: "₹1,200" },
  { id: "diy-kit", label: "Custom DIY Kit", icon: "🎁", from: "₹800" },
  { id: "installation", label: "Event / Home Installation", icon: "🏠", from: "₹8,000" },
  { id: "other", label: "Something Else ✨", icon: "💫", from: "Custom" },
]

const pricingGuide = [
  {
    category: "Macrame Wall Hangings",
    icon: "🪢",
    tiers: [
      { size: "Small (up to 40cm × 60cm)", price: "₹1,500 – ₹2,200" },
      { size: "Medium (40–70cm × 60–100cm)", price: "₹2,200 – ₹4,000" },
      { size: "Large (70cm+ × 100cm+)", price: "₹4,000 – ₹7,000" },
      { size: "Event / Wedding Installations", price: "₹8,000 – ₹30,000+" },
    ],
  },
  {
    category: "Paintings",
    icon: "🖌️",
    tiers: [
      { size: "Small (up to 8\" × 10\")", price: "₹2,500 – ₹3,500" },
      { size: "Medium (12\" × 16\")", price: "₹4,500 – ₹6,000" },
      { size: "Large (18\" × 24\" and above)", price: "₹7,000 – ₹15,000" },
      { size: "Travel Memory / Portrait Painting", price: "₹5,000 – ₹12,000" },
    ],
  },
  {
    category: "Embroidery & Stitching",
    icon: "🧵",
    tiers: [
      { size: "Small hoop (up to 15cm)", price: "₹900 – ₹1,500" },
      { size: "Medium hoop (20–25cm)", price: "₹1,500 – ₹2,500" },
      { size: "Large hoop / framed piece (30cm+)", price: "₹2,500 – ₹4,500" },
      { size: "Portrait / Custom design", price: "₹3,000 – ₹6,000" },
    ],
  },
]

const examples = [
  {
    title: "Wedding Macrame Arch",
    desc: "A 3-metre wide macrame arch for a boho wedding reception in Udaipur. Completed in 3 weeks.",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&q=80",
    price: "₹18,000",
    time: "3 weeks",
  },
  {
    title: "Rajasthan Travel Painting",
    desc: "A commissioned watercolour of a couple's favourite memory from their Rajasthan honeymoon.",
    image: "https://images.unsplash.com/photo-1532664189809-02133fee698d?w=500&q=80",
    price: "₹5,500",
    time: "10 days",
  },
  {
    title: "Ganesha Embroidery Diptych",
    desc: "Twin 25cm embroidery hoops for a pooja room in Pune — gold, saffron, and ivory on brown linen.",
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=500&q=80",
    price: "₹4,200",
    time: "2 weeks",
  },
]

export default function CustomOrders() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', type: '', size: '', budget: '', timeline: '', description: '', reference: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setIsVisible(v => ({ ...v, [e.target.dataset.id]: true }))
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-id]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Hi Sapna! 🌸 I'd like to place a custom order.\n\n` +
      `*Name:* ${form.name}\n` +
      `*Type:* ${form.type}\n` +
      `*Budget:* ${form.budget}\n` +
      `*Timeline:* ${form.timeline}\n` +
      `*Details:* ${form.description}\n\n` +
      `Please let me know the next steps! 🙏`
    )
    window.open(`https://wa.me/918511341910?text=${msg}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="custom-orders-page">
      {/* ── Hero ── */}
      <div className="page-hero custom-orders-hero">
        <div className="page-hero-content">
          <span className="section-label">Something Just for You</span>
          <h1>Custom Orders</h1>
          <p>Commission a one-of-a-kind piece — macrame, painting, embroidery, or a full installation — made with your story in mind</p>
        </div>
      </div>

      {/* ── Process Steps ── */}
      <section className="section" data-id="process">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['process'] ? 'visible' : ''}`}>
            <span className="section-label">How It Works</span>
            <h2 className="section-title">From Idea to Artwork in 4 Steps</h2>
          </div>
          <div className={`process-steps fade-up ${isVisible['process'] ? 'visible' : ''}`}>
            {[
              { n: "01", icon: "💬", title: "Share Your Vision", desc: "Fill the form below or message Sapna on WhatsApp. Share your ideas, references, size requirements, and budget." },
              { n: "02", icon: "✏️", title: "Design Consultation", desc: "Sapna will chat with you to understand your vision, suggest materials and sizes, and send a detailed quote within 24 hours." },
              { n: "03", icon: "🎨", title: "Creation with Updates", desc: "Once confirmed and advance paid, Sapna begins creating. You receive progress photos throughout the process." },
              { n: "04", icon: "📦", title: "Shipped with Love", desc: "Your finished piece is carefully packaged and shipped across India, arriving safely at your door." },
            ].map((step, i) => (
              <div key={i} className="process-step" style={{ transitionDelay: `${i * .1}s` }}>
                <div className="process-num">{step.n}</div>
                <div className="process-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Examples ── */}
      <section className="section" style={{ background: 'var(--beige-light)' }} data-id="examples">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['examples'] ? 'visible' : ''}`}>
            <span className="section-label">Past Commissions</span>
            <h2 className="section-title">What Others Have Created</h2>
          </div>
          <div className={`custom-examples-grid fade-up ${isVisible['examples'] ? 'visible' : ''}`}>
            {examples.map((ex, i) => (
              <div key={i} className="example-card">
                <div className="example-img img-overlay">
                  <img src={ex.image} alt={ex.title} loading="lazy" />
                </div>
                <div className="example-info">
                  <h3>{ex.title}</h3>
                  <p>{ex.desc}</p>
                  <div className="example-meta">
                    <span><i className="fas fa-tag" /> {ex.price}</span>
                    <span><i className="fas fa-clock" /> {ex.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Guide ── */}
      <section className="section" data-id="pricing">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['pricing'] ? 'visible' : ''}`}>
            <span className="section-label">Transparent Pricing</span>
            <h2 className="section-title">Pricing Guide</h2>
            <p className="section-subtitle">All prices are starting points — final quote depends on size, complexity, materials, and timeline. Custom requests are always welcome!</p>
          </div>
          <div className={`pricing-grid fade-up ${isVisible['pricing'] ? 'visible' : ''}`}>
            {pricingGuide.map((cat, i) => (
              <div key={i} className="pricing-card">
                <div className="pricing-header">
                  <span>{cat.icon}</span>
                  <h3>{cat.category}</h3>
                </div>
                <div className="pricing-tiers">
                  {cat.tiers.map((tier, j) => (
                    <div key={j} className="pricing-row">
                      <span className="tier-size">{tier.size}</span>
                      <span className="tier-price">{tier.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pricing-note">
            <i className="fas fa-info-circle" />
            <p>Prices include materials. Framing, delivery, and bulk discounts are negotiated separately. Payment: 50% advance, 50% before shipping. Refunds are not available for custom orders once creation has begun.</p>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="section" style={{ background: 'var(--beige-light)' }} data-id="form">
        <div className="container">
          <div className="custom-form-wrap">
            <div className={`custom-form-info fade-up ${isVisible['form'] ? 'visible' : ''}`}>
              <span className="section-label">Start Your Commission</span>
              <h2 className="section-title">Tell Me What You Dream Of 🌸</h2>
              <p>Fill in as many details as you can — the more you share, the better I can bring your vision to life. Don't worry if you're not sure about every detail; we'll figure it out together.</p>
              <div className="form-info-items">
                <div className="form-info-item">
                  <i className="fas fa-clock" />
                  <div>
                    <strong>Response Time</strong>
                    <span>Within 24 hours on WhatsApp</span>
                  </div>
                </div>
                <div className="form-info-item">
                  <i className="fas fa-palette" />
                  <div>
                    <strong>Lead Time</strong>
                    <span>7–21 days depending on complexity</span>
                  </div>
                </div>
                <div className="form-info-item">
                  <i className="fas fa-shipping-fast" />
                  <div>
                    <strong>Shipping</strong>
                    <span>Pan-India, safe & secure packaging</span>
                  </div>
                </div>
                <div className="form-info-item">
                  <i className="fab fa-whatsapp" />
                  <div>
                    <strong>Prefer WhatsApp?</strong>
                    <a href="https://wa.me/918511341910" target="_blank" rel="noreferrer">Message Sapna directly →</a>
                  </div>
                </div>
              </div>

              <div className="order-types-grid">
                {orderTypes.map(t => (
                  <div key={t.id} className={`order-type-chip ${form.type === t.label ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: t.label }))}>
                    <span>{t.icon}</span>
                    <div>
                      <strong>{t.label}</strong>
                      <span>From {t.from}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {submitted ? (
              <div className={`custom-form-success fade-up ${isVisible['form'] ? 'visible' : ''}`}>
                <div className="success-art">🌸</div>
                <h3>Your request has been sent to WhatsApp!</h3>
                <p>Sapna will review your details and reply within 24 hours. She's excited to create something beautiful for you!</p>
                <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Submit Another Request</button>
              </div>
            ) : (
              <form className={`custom-form fade-up ${isVisible['form'] ? 'visible' : ''}`} onSubmit={handleSubmit} style={{ transitionDelay: '.1s' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Priya Sharma" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="priya@email.com" type="email" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="+91 98765 43210" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" value={form.city} onChange={handleChange} className="form-control" placeholder="Mumbai" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Type of Art *</label>
                  <select name="type" value={form.type} onChange={handleChange} className="form-control" required>
                    <option value="">Select a type...</option>
                    {orderTypes.map(t => <option key={t.id} value={t.label}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Size / Dimensions</label>
                    <input name="size" value={form.size} onChange={handleChange} className="form-control" placeholder="e.g., 60cm × 90cm or A3 canvas" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Range *</label>
                    <select name="budget" value={form.budget} onChange={handleChange} className="form-control" required>
                      <option value="">Select budget...</option>
                      <option>Below ₹1,500</option>
                      <option>₹1,500 – ₹3,000</option>
                      <option>₹3,000 – ₹6,000</option>
                      <option>₹6,000 – ₹12,000</option>
                      <option>₹12,000 – ₹25,000</option>
                      <option>Above ₹25,000</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Required By (Timeline)</label>
                  <input name="timeline" value={form.timeline} onChange={handleChange} className="form-control" placeholder="e.g., By April 20 for a gift / No rush" />
                </div>
                <div className="form-group">
                  <label className="form-label">Describe Your Vision *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control"
                    rows={5}
                    placeholder="Tell me everything! Colours, themes, room it's for, mood you want, travel memories to capture, any reference images you have. The more detail, the better! ✨"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reference Images / Links</label>
                  <input name="reference" value={form.reference} onChange={handleChange} className="form-control" placeholder="Pinterest links, Instagram posts, or any visual reference" />
                </div>
                <button type="submit" className="btn btn-whatsapp btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fab fa-whatsapp" /> Send Request via WhatsApp
                </button>
                <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '.75rem' }}>
                  This will open WhatsApp with your details pre-filled. Sapna replies within 24 hours. 🌸
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
