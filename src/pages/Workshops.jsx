import React, { useState, useEffect } from 'react'
import { getSiteImage, getWorkshops, getSiteText } from '../data/adminData'
import { submitBooking } from '../data/leads'
import { useSeo } from '../hooks/useSeo'
import './Workshops.css'

// The booking details as a WhatsApp message, so one tap after booking sends
// Sapna everything she needs instead of a bare "hi".
function bookingMessage(b) {
  const lines = [
    "Hi Sapna! 🌸 I'd like to book a workshop.",
    '',
    `*Name:* ${b.name}`,
    b.phone ? `*Phone:* ${b.phone}` : '',
    b.email ? `*Email:* ${b.email}` : '',
    b.workshop ? `*Workshop:* ${b.workshop}` : '',
    b.date ? `*Preferred date:* ${b.date}` : '',
    b.mode ? `*Format:* ${b.mode}` : '',
    b.people ? `*People:* ${b.people}` : '',
    b.notes ? `*Notes:* ${b.notes}` : '',
    '',
    'Could you confirm availability? 🙏',
  ].filter(Boolean)
  return encodeURIComponent(lines.join('\n'))
}

const faqs = [
  { q: "Do I need any prior experience?", a: "Absolutely not! All workshops are designed to be welcoming for complete beginners. The only requirement is curiosity and a love for making things by hand." },
  { q: "What's included in the workshop fee?", a: "All materials are provided and you take home your finished piece! In-person workshops also include refreshments. Online workshops include a materials list to arrange beforehand (or request a kit delivery)." },
  { q: "Can I gift a workshop to someone?", a: "Yes! Workshop gift vouchers are available. Just message Sapna on WhatsApp and she'll arrange a beautiful digital gift card." },
  { q: "How do I book?", a: "Fill in the booking form at the top of this page. Sapna will confirm your slot and share available dates. You can also send the same details to her on WhatsApp in one click straight after booking." },
  { q: "Are private / group workshops available?", a: "Yes! Private sessions and corporate/group events are available for groups of 5 or more. Perfect for birthday parties, bachelorettes, corporate team-building, and kitty parties." },
  { q: "What if I need to cancel or reschedule?", a: "Cancellations up to 48 hours before the workshop can be rescheduled free of charge. Cancellations within 48 hours are non-refundable but can be credited toward a future session." },
]

export default function Workshops() {
  useSeo({
    title: 'Art Workshops in Ahmedabad | Sapna\'s Art Studio',
    description: 'Join macrame, watercolour painting and embroidery workshops with Sapna in Ahmedabad or online. Beginner-friendly, all materials included. Private and group sessions available.',
    path: '/workshops',
  })
  const workshops = getWorkshops()
  const [openFaq, setOpenFaq] = useState(null)
  const [activeWorkshop, setActiveWorkshop] = useState(null)
  const [isVisible, setIsVisible] = useState({})
  const [form, setForm] = useState({
    name: '', phone: '', email: '', workshop: '', date: '',
    mode: 'In-person (Ahmedabad)', people: '1', notes: '',
  })
  const [sending, setSending] = useState(false)
  // Holds the submitted booking so the success panel can offer a WhatsApp
  // message prefilled with exactly what was booked.
  const [booked, setBooked] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleBooking = async (e) => {
    e.preventDefault()
    setSending(true)
    // Save first, so the booking is recorded even if they never open WhatsApp.
    // submitBooking never throws, so the visitor always reaches the success panel.
    await submitBooking({
      name: form.name, phone: form.phone, email: form.email,
      message: form.notes,
      meta: {
        workshop: form.workshop, preferredDate: form.date,
        mode: form.mode, people: form.people,
      },
    })
    setSending(false)
    setBooked({ ...form })
    setForm({
      name: '', phone: '', email: '', workshop: '', date: '',
      mode: 'In-person (Ahmedabad)', people: '1', notes: '',
    })
  }

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
          <span className="section-label">{getSiteText('workshops_hero_label')}</span>
          <h1>{getSiteText('workshops_hero_title')}</h1>
          <p>{getSiteText('workshops_hero_sub')}</p>
          <a href="#booking" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
            Book Your Spot <i className="fas fa-arrow-down" />
          </a>
        </div>
      </div>

      {/* ── Workshop Cards ── */}
      <section className="section" style={{ background: 'var(--beige-light)' }} data-id="workshop-cards">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['workshop-cards'] ? 'visible' : ''}`}>
            <span className="section-label">{getSiteText('workshops_cards_label')}</span>
            <h2 className="section-title">{getSiteText('workshops_cards_title')}</h2>
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
                    <a
                      href={`https://wa.me/918511341910?text=${encodeURIComponent(`Hi Sapna! I'd like to book the "${w.title}" workshop. Can you share available dates? 🙏`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-whatsapp"
                    >
                      <i className="fab fa-whatsapp" /> Book Your Spot on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking ── */}
      <section id="booking" className="section workshops-booking-section" data-id="booking">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['booking'] ? 'visible' : ''}`}>
            <span className="section-label">Reserve Your Spot</span>
            <h2 className="section-title">Book a Workshop</h2>
            <p className="section-subtitle">Fill in a few details and Sapna will confirm your slot. You can send the same details on WhatsApp straight after.</p>
          </div>
          <div className={`workshops-booking-container fade-up ${isVisible['booking'] ? 'visible' : ''}`}>
            {booked ? (
              <div className="booking-success">
                <div className="booking-success-art">🌸</div>
                <h3>Booking request received</h3>
                <p>
                  Thank you {booked.name || 'so much'}! Your request for{' '}
                  <strong>{booked.workshop || 'a workshop'}</strong> has been saved and Sapna
                  will confirm your slot shortly.
                </p>
                <p className="booking-success-hint">
                  Want it confirmed faster? Send the same details straight to her WhatsApp.
                </p>
                <div className="booking-success-actions">
                  <a
                    href={`https://wa.me/918511341910?text=${bookingMessage(booked)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp btn-lg"
                  >
                    <i className="fab fa-whatsapp" /> Send details on WhatsApp
                  </a>
                  <button type="button" className="btn btn-ghost" onClick={() => setBooked(null)}>
                    Book another workshop
                  </button>
                </div>
              </div>
            ) : (
              <form className="booking-form" onSubmit={handleBooking}>
                <div className="booking-grid">
                  <label className="booking-field">
                    <span>Your name <em>*</em></span>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Priya Mehta" />
                  </label>
                  <label className="booking-field">
                    <span>WhatsApp number <em>*</em></span>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                  </label>
                  <label className="booking-field">
                    <span>Email <small>(optional)</small></span>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                  </label>
                  <label className="booking-field">
                    <span>Which workshop? <em>*</em></span>
                    <select name="workshop" value={form.workshop} onChange={handleChange} required>
                      <option value="">Choose a workshop…</option>
                      {workshops.map(w => (
                        <option key={w.id} value={w.title}>{w.title}</option>
                      ))}
                      <option value="Private / group session">Private / group session</option>
                      <option value="Not sure yet">Not sure yet, please advise</option>
                    </select>
                  </label>
                  <label className="booking-field">
                    <span>Preferred date</span>
                    <input type="date" name="date" value={form.date} onChange={handleChange} />
                  </label>
                  <label className="booking-field">
                    <span>Format</span>
                    <select name="mode" value={form.mode} onChange={handleChange}>
                      <option value="In-person (Ahmedabad)">In-person (Ahmedabad)</option>
                      <option value="Online via Zoom">Online via Zoom</option>
                      <option value="Either works">Either works</option>
                    </select>
                  </label>
                  <label className="booking-field">
                    <span>How many people?</span>
                    <input type="number" name="people" min="1" value={form.people} onChange={handleChange} />
                  </label>
                  <label className="booking-field booking-span2">
                    <span>Anything else? <small>(optional)</small></span>
                    <textarea rows="3" name="notes" value={form.notes} onChange={handleChange} placeholder="Occasion, experience level, questions…" />
                  </label>
                </div>

                <div className="booking-actions">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
                    {sending ? 'Sending…' : <>Request Booking <i className="fas fa-arrow-right" /></>}
                  </button>
                  <span className="booking-note">
                    You can send the details on WhatsApp right after, in one click.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Private Events ── */}
      <section className="section workshops-private" data-id="private">
        <div className="container">
          <div className={`private-inner fade-up ${isVisible['private'] ? 'visible' : ''}`}>
            <div className="private-text">
              <span className="section-label">{getSiteText('workshops_private_label')}</span>
              <h2 className="section-title">{getSiteText('workshops_private_title')}</h2>
              <p>Sapna offers private workshops for birthdays, bachelorettes, corporate team-building, kitty parties, and more. She'll come to your venue in Ahmedabad or host your group in her studio.</p>
              <ul className="private-list">
                <li><i className="fas fa-check" /> Minimum 5 participants</li>
                <li><i className="fas fa-check" /> Custom date & time to suit you</li>
                <li><i className="fas fa-check" /> All materials + refreshments provided</li>
                <li><i className="fas fa-check" /> Customised theme & souvenirs available</li>
                <li><i className="fas fa-check" /> Corporate invoice available</li>
              </ul>
              <a
                href={`https://wa.me/918511341910?text=${encodeURIComponent("Hi Sapna! I'm interested in booking a private workshop for a group. Can we chat about the details? 🙏")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <i className="fab fa-whatsapp" /> Enquire for Private Workshop
              </a>
            </div>
            <div className="private-image img-overlay">
              <img src={getSiteImage('workshops_private')} alt="Group workshop" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section workshops-faq" style={{ background: 'var(--beige-light)' }} data-id="faq">
        <div className="container container-narrow">
          <div className={`section-header fade-up ${isVisible['faq'] ? 'visible' : ''}`}>
            <span className="section-label">{getSiteText('workshops_faq_label')}</span>
            <h2 className="section-title">{getSiteText('workshops_faq_title')}</h2>
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
            <a href="https://wa.me/918511341910" target="_blank" rel="noreferrer" className="btn btn-whatsapp">
              <i className="fab fa-whatsapp" /> Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
