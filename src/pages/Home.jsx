import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { products, getWhatsAppLink } from '../data/products'
import './Home.css'

// ── Hero slides ────────────────────────────────────────────
const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85",
    label: "Macrame Art",
    heading: "Threads of a\nWanderer's Soul",
    sub: "Handcrafted macrame wall hangings, paintings & stitching — each piece a journey",
    cta: { label: "Explore Shop", to: "/shop" },
  },
  {
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&q=85",
    label: "Watercolour Paintings",
    heading: "Colours Collected\nAcross India",
    sub: "Travel-inspired watercolours & acrylics that bring the world's beauty into your home",
    cta: { label: "View Paintings", to: "/shop?cat=painting" },
  },
  {
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&q=85",
    label: "Embroidery & Stitching",
    heading: "Stories Stitched\nStitch by Stitch",
    sub: "Botanical embroidery hoops and stitching art — handmade with love in Ahmedabad",
    cta: { label: "Shop Stitching", to: "/shop?cat=stitching" },
  },
]

// ── Featured products (first 6 bestsellers/new) ─────────
const featuredProducts = products.filter(p => p.isBestseller || p.isNew).slice(0, 6)

// ── Categories ────────────────────────────────────────────
const cats = [
  {
    id: "macrame", label: "Macrame", icon: "🪢",
    desc: "Handknotted wall hangings in natural cotton",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    color: "#C4714A",
  },
  {
    id: "painting", label: "Paintings", icon: "🖌️",
    desc: "Travel watercolours & textured acrylics",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80",
    color: "#8A9E7B",
  },
  {
    id: "stitching", label: "Stitching", icon: "🧵",
    desc: "Botanical embroidery & stitched hoop art",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80",
    color: "#D4A843",
  },
  {
    id: "diy", label: "DIY Kits", icon: "🎁",
    desc: "Make your own — complete craft kits",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=500&q=80",
    color: "#D4845A",
  },
]

// ── Testimonials ───────────────────────────────────────────
const testimonials = [
  {
    name: "Priya M.",
    city: "Mumbai",
    avatar: "P",
    text: "Sapna's macrame piece is the centrepiece of my living room now. The quality, the detail, the love in every knot — absolutely worth every rupee. She even helped me pick the perfect size over WhatsApp!",
    rating: 5,
    product: "Desert Dunes Macrame",
  },
  {
    name: "Aarti S.",
    city: "Bengaluru",
    avatar: "A",
    text: "I attended the Watercolour Workshop online and it was magical. Sapna is an incredibly patient teacher who makes you feel like you can actually paint. Came out with a piece I'm genuinely proud of.",
    rating: 5,
    product: "Travel Watercolour Workshop",
  },
  {
    name: "Meghna P.",
    city: "Ahmedabad",
    avatar: "M",
    text: "Ordered a custom wedding gift — a macrame arch backdrop for our reception. Sapna delivered beyond our dreams. Every guest asked about it. She's incredibly talented and so easy to work with.",
    rating: 5,
    product: "Custom Wedding Installation",
  },
  {
    name: "Kavita R.",
    city: "Pune",
    avatar: "K",
    text: "The Embroidery Starter Kit is perfect! The instructions are so clear, the materials are high quality, and Sapna's video tutorial made it so easy. I finished my first hoop in one afternoon!",
    rating: 5,
    product: "Embroidery Starter Kit",
  },
]

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const slideTimerRef = useRef(null)

  // Auto-advance hero slides
  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setActiveSlide(s => (s + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(slideTimerRef.current)
  }, [])

  // Auto-advance testimonials
  useEffect(() => {
    const t = setInterval(() => {
      setActiveTestimonial(s => (s + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const goToSlide = (i) => {
    clearInterval(slideTimerRef.current)
    setActiveSlide(i)
    slideTimerRef.current = setInterval(() => {
      setActiveSlide(s => (s + 1) % heroSlides.length)
    }, 5000)
  }

  // Intersection observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setIsVisible(v => ({ ...v, [e.target.dataset.id]: true }))
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('[data-id]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const slide = heroSlides[activeSlide]

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero">
        {heroSlides.map((s, i) => (
          <div key={i} className={`hero-slide ${i === activeSlide ? 'active' : ''}`}>
            <img src={s.image} alt={s.label} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="hero-overlay" />

        {/* Decorative texture overlay */}
        <div className="hero-texture" />

        <div className="hero-content container">
          <div className="hero-badge fade-in-up">
            <span className="hero-category">{slide.label}</span>
          </div>
          <h1 className="hero-title fade-in-up" style={{ animationDelay: '.1s' }}>
            {slide.heading.split('\n').map((line, i) => (
              <React.Fragment key={i}>{line}{i < slide.heading.split('\n').length - 1 && <br />}</React.Fragment>
            ))}
          </h1>
          <p className="hero-sub fade-in-up" style={{ animationDelay: '.2s' }}>
            {slide.sub}
          </p>
          <div className="hero-tagline fade-in-up" style={{ animationDelay: '.3s' }}>
            <span>Macrame</span>
            <span className="dot">✦</span>
            <span>Paintings</span>
            <span className="dot">✦</span>
            <span>Stitching</span>
            <span className="dot">✦</span>
            <span>DIY Kits</span>
          </div>
          <div className="hero-actions fade-in-up" style={{ animationDelay: '.4s' }}>
            <Link to={slide.cta.to} className="btn btn-primary btn-lg">
              {slide.cta.label} <i className="fas fa-arrow-right" />
            </Link>
            <Link to="/custom-orders" className="btn hero-btn-ghost btn-lg">
              Custom Order ✨
            </Link>
          </div>
        </div>

        {/* Slide dots */}
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button key={i} className={`hero-dot ${i === activeSlide ? 'active' : ''}`} onClick={() => goToSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-hint">
          <div className="scroll-mouse"><div className="scroll-wheel" /></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section home-categories" data-id="cats">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['cats'] ? 'visible' : ''}`}>
            <span className="section-label">Find Your Art</span>
            <h2 className="section-title">Four Ways to Bring<br />Handmade Art Home</h2>
          </div>
          <div className="cats-grid">
            {cats.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/shop?cat=${cat.id}`}
                className={`cat-card fade-up ${isVisible['cats'] ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * .1}s` }}
              >
                <div className="cat-img-wrap">
                  <img src={cat.image} alt={cat.label} loading="lazy" />
                  <div className="cat-overlay" style={{ background: cat.color + '33' }} />
                </div>
                <div className="cat-body">
                  <span className="cat-icon">{cat.icon}</span>
                  <h3 className="cat-name">{cat.label}</h3>
                  <p className="cat-desc">{cat.desc}</p>
                  <span className="cat-link">Shop Now <i className="fas fa-arrow-right" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section home-featured" data-id="featured" style={{ background: 'var(--beige-light)' }}>
        <div className="container">
          <div className={`section-header fade-up ${isVisible['featured'] ? 'visible' : ''}`}>
            <span className="section-label">Fresh Arrivals & Bestsellers</span>
            <h2 className="section-title">Handpicked Just for You</h2>
            <p className="section-subtitle">Every piece is one-of-a-kind, made with care and shipped with love from Ahmedabad.</p>
          </div>
          <div className="products-grid">
            {featuredProducts.map((p, i) => (
              <div
                key={p.id}
                className={`product-card fade-up ${isVisible['featured'] ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * .08}s` }}
              >
                <div className="product-img-wrap img-overlay">
                  <img src={p.images[0]} alt={p.name} loading="lazy" />
                  {p.isNew && <span className="product-badge new">New</span>}
                  {p.isBestseller && !p.isNew && <span className="product-badge best">Bestseller</span>}
                  {!p.available && <div className="product-sold-out">Sold Out</div>}
                  <div className="product-hover-actions">
                    <a
                      href={getWhatsAppLink(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                    >
                      <i className="fab fa-whatsapp" /> Buy
                    </a>
                    <Link to="/shop" className="btn btn-outline btn-sm" style={{ borderColor: '#fff', color: '#fff' }}>
                      Details
                    </Link>
                  </div>
                </div>
                <div className="product-info">
                  <span className="product-category tag tag-terracotta">{p.category}</span>
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-size">{p.size}</p>
                  <div className="product-price-row">
                    <span className="product-price">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.originalPrice && (
                      <span className="product-original">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/shop" className="btn btn-primary btn-lg">
              View All Artworks <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT SNIPPET ── */}
      <section className="section home-about" data-id="about-snip">
        <div className="container">
          <div className={`home-about-inner fade-up ${isVisible['about-snip'] ? 'visible' : ''}`}>
            <div className="home-about-images">
              <div className="about-img-main img-overlay">
                <img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80" alt="Sapna at work" loading="lazy" />
              </div>
              <div className="about-img-secondary img-overlay">
                <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80" alt="Travel inspiration" loading="lazy" />
              </div>
              <div className="about-badge-float">
                <span className="about-badge-num">5+</span>
                <span className="about-badge-text">Years of<br />Handcraft</span>
              </div>
            </div>
            <div className="home-about-text">
              <span className="section-label">The Artist Behind the Art</span>
              <h2 className="section-title">Hello, I'm Sapna 🌿</h2>
              <div className="divider"><i className="fas fa-leaf" /></div>
              <p className="about-lead">
                A textile artist, painter, and passionate wanderer based in Ahmedabad, Gujarat.
                I create handmade art inspired by my travels across India — from the golden dunes of Rajasthan to the emerald backwaters of Kerala.
              </p>
              <p className="about-para">
                Every macrame knot, every watercolour wash, every embroidery stitch carries a memory of a place, a feeling, a moment of quiet beauty. My art is my travel journal — and I invite you to bring a piece of that journey into your home.
              </p>
              <div className="about-highlights">
                <div className="highlight-item">
                  <i className="fas fa-map-marker-alt" />
                  <span>Ahmedabad, Gujarat</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-heart" />
                  <span>Sustainable & Handmade</span>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-plane" />
                  <span>Travel-Inspired Art</span>
                </div>
              </div>
              <Link to="/about" className="btn btn-primary">
                Explore My Journey <i className="fas fa-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS / SERVICES ── */}
      <section className="section home-services" data-id="services" style={{ background: 'var(--sage-pale)' }}>
        <div className="container">
          <div className={`section-header fade-up ${isVisible['services'] ? 'visible' : ''}`}>
            <span className="section-label">What I Offer</span>
            <h2 className="section-title">More Ways to Create With Me</h2>
          </div>
          <div className={`services-grid fade-up ${isVisible['services'] ? 'visible' : ''}`}>
            <div className="service-card">
              <div className="service-icon" style={{ background: 'var(--terracotta-pale)', color: 'var(--terracotta)' }}>
                <i className="fas fa-calendar-alt" />
              </div>
              <h3>Workshops</h3>
              <p>Join a live macrame, painting, or embroidery workshop — online or in Ahmedabad. All skill levels welcome!</p>
              <Link to="/workshops" className="service-link">Book a Seat <i className="fas fa-arrow-right" /></Link>
            </div>
            <div className="service-card">
              <div className="service-icon" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>
                <i className="fas fa-pencil-alt" />
              </div>
              <h3>Custom Orders</h3>
              <p>Want something made just for you? Commission a custom macrame, travel painting, stitched portrait, and more.</p>
              <Link to="/custom-orders" className="service-link">Request a Quote <i className="fas fa-arrow-right" /></Link>
            </div>
            <div className="service-card">
              <div className="service-icon" style={{ background: 'var(--blush-pale)', color: '#9a4030' }}>
                <i className="fas fa-gift" />
              </div>
              <h3>DIY Kits</h3>
              <p>Curated craft kits with everything you need — perfect gifts and creative weekends at home.</p>
              <Link to="/shop?cat=diy" className="service-link">Shop DIY Kits <i className="fas fa-arrow-right" /></Link>
            </div>
            <div className="service-card">
              <div className="service-icon" style={{ background: 'var(--sage-pale)', color: 'var(--sage-dark)' }}>
                <i className="fas fa-images" />
              </div>
              <h3>Gallery</h3>
              <p>Browse Sapna's best work — commissions, collections, and behind-the-scenes process photography.</p>
              <Link to="/gallery" className="service-link">View Gallery <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section home-testimonials" data-id="reviews">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['reviews'] ? 'visible' : ''}`}>
            <span className="section-label">Happy Customers</span>
            <h2 className="section-title">Made with Love, Received with Joy</h2>
          </div>
          <div className={`testimonials-wrap fade-up ${isVisible['reviews'] ? 'visible' : ''}`}>
            <div className="testimonials-track" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-stars">
                    {'★'.repeat(t.rating)}
                  </div>
                  <blockquote className="testimonial-text">"{t.text}"</blockquote>
                  <div className="testimonial-footer">
                    <div className="testimonial-avatar">{t.avatar}</div>
                    <div>
                      <strong className="testimonial-name">{t.name}</strong>
                      <span className="testimonial-city">{t.city} · {t.product}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`testimonial-dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM FEED MOCKUP ── */}
      <section className="home-instagram" data-id="insta">
        <div className={`insta-header fade-up ${isVisible['insta'] ? 'visible' : ''}`}>
          <span className="section-label">Follow the Journey</span>
          <h2 className="section-title">@art_wt_sapna</h2>
          <a href="https://instagram.com/art_wt_sapna" target="_blank" rel="noreferrer" className="btn btn-outline">
            <i className="fab fa-instagram" /> Follow on Instagram
          </a>
        </div>
        <div className="insta-grid">
          {[
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
            "https://images.unsplash.com/photo-1579703822122-204b92e80d61?w=400&q=80",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80",
            "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
            "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80",
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
          ].map((src, i) => (
            <a key={i} href="https://instagram.com/art_wt_sapna" target="_blank" rel="noreferrer" className="insta-item img-overlay">
              <img src={src} alt={`Instagram ${i + 1}`} loading="lazy" />
              <div className="insta-overlay">
                <i className="fab fa-instagram" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="home-cta-banner" data-id="cta-banner">
        <div className={`container fade-up ${isVisible['cta-banner'] ? 'visible' : ''}`}>
          <div className="cta-banner-inner">
            <div className="cta-banner-text">
              <span className="section-label" style={{ color: 'rgba(255,255,255,.7)' }}>Let's Create Together</span>
              <h2>Have Something Special in Mind?</h2>
              <p>Custom commissions, bulk orders, event installations, or workshop bookings — just say hello!</p>
            </div>
            <div className="cta-banner-actions">
              <a href="https://wa.me/918511341910" target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
                <i className="fab fa-whatsapp" /> Chat on WhatsApp
              </a>
              <Link to="/custom-orders" className="btn btn-light btn-lg">
                Request Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
