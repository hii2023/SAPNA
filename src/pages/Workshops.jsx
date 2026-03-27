import React, { useState, useEffect } from 'react'
import { workshops, CALENDLY_URL } from '../data/workshops'
import './Workshops.css'

const faqs = [
  { q: "Do I need any prior experience?", a: "Absolutely not! All workshops are designed to be welcoming for complete beginners. The only requirement is curiosity and a love for making things by hand." },
  { q: "What's included in the workshop fee?", a: "All materials are provided and you take home your finished piece! In-person workshops also include refreshments. Online workshops include a materials list to arrange beforehand (or request a kit delivery)." },
  { q: "Can I gift a workshop to someone?", a: "Yes! Workshop gift vouchers are available. Just message Sapna on WhatsApp and she'll arrange a beautiful digital gift card." },
  { q: "How do I book?", a: "Click 'Book via Calendly' on any workshop to reserve your spot instantly. You can also message Sapna on WhatsApp if you prefer a personal booking." },
  { q: "Are private / group workshops available?", a: "Yes! Private sessions and corporate/group events are available for groups of 5 or more. Perfect for birthday parties, bachelorettes, corporate team-building, and kitty parties." },
  { q: "What if I need to cancel or reschedule?", a: "Cancellations up to 48 hours before the workshop can be rescheduled free of charge. Cancellations within 48 hours are non-refundable but can be credited toward a future session." },
]

export default function Workshops() {
  const [openFaq, setOpenFaq] = useState(null)
  const [activeWorkshop, setActiveWorkshop] = useState(null)
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

  return (
    <div className="workshops-page">
      {/* ── Hero ── */}
      <div className="page-hero workshops-hero">
        <div className="page-hero-content">
          <span className="section-label">Learn, Create, Take Home</span>
          <h1>Workshops & Classes</h1>
          <p>In-person in Ahmedabad & online worldwide — all skill levels welcome 🎨</p>
          <a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
            <i className="fas fa-calendar-alt" /> Book Your Spot Now
          </a>
        </div>
      </div>

      {/* ── Calendly Embed ── */}
      <section className="section workshops-calendly-section" data-id="calendly">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['calendly'] ? 'visible' : ''}`}>
            <span className="section-label">Reserve Your Spot</span>
            <h2 className="section-title">Book a Workshop</h2>
            <p className="section-subtitle">Choose your preferred date, time, and format — it takes just 2 minutes. Pick a slot below or message Sapna on WhatsApp!</p>
          </div>
          <div className={`calendly-container fade-up ${isVisible['calendly'] ? 'visible' : ''}`}>
            <div className="calendly-placeholder">
              <div className="calendly-placeholder-inner">
                <div className="calendly-icon">
                  <i className="fas fa-calendar-alt" />
                </div>
                <h3>Calendly Booking Calendar</h3>
                <p>Replace the URL below with your actual Calendly link to show live booking availability here.</p>
                <div className="calendly-url-box">
                  <code>{CALENDLY_URL}</code>
                </div>
                <a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                  <i className="fas fa-calendar-check" /> Open Booking Calendar
                </a>
                <p className="calendly-note">Or message Sapna directly on WhatsApp to book:</p>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent("Hi Sapna! I'd like to book a workshop. Could you share the available dates? 🙏")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-whatsapp"
                >
                  <i className="fab fa-whatsapp" /> Book via WhatsApp
                </a>
              </div>
            </div>
            {/* ACTUAL CALENDLY IFRAME — uncomment after adding real URL:
            <iframe
              src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=fdfaf6&text_color=3d2b1f&primary_color=c4714a`}
              width="100%"
              height="700"
              frameBorder="0"
              title="Book a Workshop with Sapna"
              style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--beige)' }}
            />
            */}
          </div>
        </div>
      </section>

      {/* ── Workshop Cards ── */}
      <section className="section" style={{ background: 'var(--beige-light)' }} data-id="workshop-cards">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['workshop-cards'] ? 'visible' : ''}`}>
            <span className="section-label">What's On Offer</span>
            <h2 className="section-title">Choose Your Creative Adventure</h2>
          </div>
          <div className="workshops-grid">
            {workshops.map((w, i) => (
              <div
                key={w.id}
                className={`workshop-card fade-up ${isVisible['workshop-cards'] ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * .1}s` }}
              >
                <div className="workshop-img img-overlay">
                  <img src={w.image} alt={w.title} loading="lazy" />
                  {w.tag && <span className="workshop-tag">{w.tag}</span>}
                </div>
                <div className="workshop-body">
                  <div className="workshop-header">
                    <span className="workshop-icon">{w.icon}</span>
                    <div>
                      <span className="workshop-level" style={{ background: w.color + '22', color: w.color }}>{w.level}</span>
                    </div>
                  </div>
                  <h3 className="workshop-title">{w.title}</h3>
                  <p className="workshop-subtitle">{w.subtitle}</p>
                  <div className="workshop-meta">
                    <span><i className="fas fa-clock" /> {w.duration}</span>
                    <span><i className="fas fa-users" /> {w.groupSize}</span>
                    <span><i className="fas fa-laptop" /> {w.mode.length > 1 ? 'Online & In-person' : w.mode[0]}</span>
                  </div>
                  <div className="workshop-price-row">
                    <span className="workshop-price">₹{w.price.toLocaleString('en-IN')}</span>
                    <span className="workshop-price-note">per person</span>
                  </div>
                  <div className="workshop-upcoming">
                    <strong>Upcoming Dates:</strong>
                    {w.upcoming.slice(0, 2).map((u, j) => (
                      <div key={j} className="upcoming-date">
                        <i className="fas fa-calendar-day" />
                        <span>{u.date} · {u.time}</span>
                        <span className={`seats-badge ${u.seats <= 3 ? 'low' : ''}`}>{u.seats} seats left</span>
                        <span className="mode-badge">{u.mode}</span>
                      </div>
                    ))}
                  </div>
                  <button className="workshop-expand-btn" onClick={() => setActiveWorkshop(activeWorkshop === w.id ? null : w.id)}>
                    {activeWorkshop === w.id ? 'Hide Details ▲' : 'What You\'ll Learn ▼'}
                  </button>
                  {activeWorkshop === w.id && (
                    <div className="workshop-details">
                      <div className="workshop-learn">
                        <strong>You'll Learn:</strong>
                        <ul>
                          {w.whatYouLearn.map((item, k) => (
                            <li key={k}><i className="fas fa-check" /> {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="workshop-includes">
                        <strong>Includes:</strong>
                        <ul>
                          {w.includes.map((item, k) => (
                            <li key={k}><i className="fas fa-gift" /> {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="workshop-actions">
                    <a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
                      <i className="fas fa-calendar-alt" /> Book via Calendly
                    </a>
                    <a
                      href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Sapna! I'd like to book the "${w.title}" workshop. Can you share available dates? 🙏`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-whatsapp"
                    >
                      <i className="fab fa-whatsapp" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Private Events ── */}
      <section className="section workshops-private" data-id="private">
        <div className="container">
          <div className={`private-inner fade-up ${isVisible['private'] ? 'visible' : ''}`}>
            <div className="private-text">
              <span className="section-label">Private Events</span>
              <h2 className="section-title">Want the Whole Experience<br />Just for Your Group?</h2>
              <p>Sapna offers private workshops for birthdays, bachelorettes, corporate team-building, kitty parties, and more. She'll come to your venue in Ahmedabad or host your group in her studio.</p>
              <ul className="private-list">
                <li><i className="fas fa-check" /> Minimum 5 participants</li>
                <li><i className="fas fa-check" /> Custom date & time to suit you</li>
                <li><i className="fas fa-check" /> All materials + refreshments provided</li>
                <li><i className="fas fa-check" /> Customised theme & souvenirs available</li>
                <li><i className="fas fa-check" /> Corporate invoice available</li>
              </ul>
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent("Hi Sapna! I'm interested in booking a private workshop for a group. Can we chat about the details? 🙏")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <i className="fab fa-whatsapp" /> Enquire for Private Workshop
              </a>
            </div>
            <div className="private-image img-overlay">
              <img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=700&q=80" alt="Group workshop" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section workshops-faq" style={{ background: 'var(--beige-light)' }} data-id="faq">
        <div className="container container-narrow">
          <div className={`section-header fade-up ${isVisible['faq'] ? 'visible' : ''}`}>
            <span className="section-label">Got Questions?</span>
            <h2 className="section-title">Frequently Asked</h2>
          </div>
          <div className={`faq-list fade-up ${isVisible['faq'] ? 'visible' : ''}`}>
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <i className={`fas fa-${openFaq === i ? 'minus' : 'plus'}`} />
                </button>
                {openFaq === i && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            ))}
          </div>
          <div className="faq-cta">
            <p>Still have a question? Just ask Sapna directly!</p>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn btn-whatsapp">
              <i className="fab fa-whatsapp" /> Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
