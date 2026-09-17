import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getSiteImage, getSiteText, getVideos, getProductWhatsAppLink, waLink, getSocialLinks, getInstagramHandle } from '../data/adminData'
import { youtubeId } from '../data/videos'
import VideoGrid from '../components/VideoGrid'
import { useSeo } from '../hooks/useSeo'
import './Home.css'

// ── Hero slides ────────────────────────────────────────────
// Images come from the "Website Photos" admin tab via getSiteImage(imgKey).
const heroSlides = [
  {
    imgKey: "home_hero_1",
    label: "Macrame Art",
    heading: "Threads of a\nWanderer's Soul",
    sub: "Handcrafted macrame wall hangings, paintings & stitching, each piece a journey",
    cta: { label: "Explore Shop", to: "/shop" },
  },
  {
    imgKey: "home_hero_2",
    label: "Watercolour Paintings",
    heading: "Colours Collected\nAcross India",
    sub: "Travel-inspired watercolours & acrylics that bring the world's beauty into your home",
    cta: { label: "View Paintings", to: "/shop?cat=painting" },
  },
  {
    imgKey: "home_hero_3",
    label: "Embroidery & Stitching",
    heading: "Stories Stitched\nStitch by Stitch",
    sub: "Botanical embroidery hoops and stitching art, handmade with love in Ahmedabad",
    cta: { label: "Shop Stitching", to: "/shop?cat=stitching" },
  },
]

// ── Hero craft chips ──────────────────────────────────────
// Each craft gets its own frosted chip. The hero photos are busy, and plain
// text over them was barely readable; a tinted glass pill per craft keeps the
// words legible on any slide and gives each craft its own colour.
const heroCrafts = [
  { label: 'Macrame',   tone: 'terracotta' },
  { label: 'Paintings', tone: 'sage' },
  { label: 'Stitching', tone: 'gold' },
  { label: 'DIY Kits',  tone: 'blush' },
]

// ── Categories ────────────────────────────────────────────
const cats = [
  {
    id: "macrame", label: "Macrame", nameKey: "home_cat_macrame_name", icon: "🪢",
    desc: "Handknotted wall hangings in natural cotton",
    imgKey: "home_cat_macrame",
    color: "#C4714A",
  },
  {
    id: "painting", label: "Paintings", nameKey: "home_cat_painting_name", icon: "🖌️",
    desc: "Travel watercolours & textured acrylics",
    imgKey: "home_cat_painting",
    color: "#8A9E7B",
  },
  {
    id: "stitching", label: "Stitching", nameKey: "home_cat_stitching_name", icon: "🧵",
    desc: "Botanical embroidery & stitched hoop art",
    imgKey: "home_cat_stitching",
    color: "#D4A843",
  },
  {
    id: "diy", label: "DIY Kits", nameKey: "home_cat_diy_name", icon: "🎁",
    desc: "Make your own, complete craft kits",
    imgKey: "home_cat_diy",
    color: "#D4845A",
  },
]

// The category card name is editable from the Website Photos tab (and the
// Website Text tab), so read the override and fall back to the built-in label.
const catName = (cat) => getSiteText(cat.nameKey) || cat.label

// ── Testimonials ───────────────────────────────────────────
const testimonials = [
  {
    name: "Priya M.",
    city: "Mumbai",
    avatar: "P",
    text: "Sapna's macrame piece is the centrepiece of my living room now. The quality, the detail, the love in every knot, absolutely worth every rupee. She even helped me pick the perfect size over WhatsApp!",
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
    text: "Ordered a custom wedding gift, a macrame arch backdrop for our reception. Sapna delivered beyond our dreams. Every guest asked about it. She's incredibly talented and so easy to work with.",
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
  useSeo({
    title: "Sapna's Art Studio | Artist in Ahmedabad, India",
    description: 'Contemporary artist in Ahmedabad. Original artworks, macrame, paintings and DIY kits, plus art commissions, installations, murals and creative collaborations across India and worldwide.',
    path: '/',
  })
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const slideTimerRef = useRef(null)
  const featuredProducts = getProducts()
    .filter(p => p.available && (p.isBestseller || p.isNew))
    .slice(0, 6)
  // Only videos with a readable YouTube link count, so a half-filled row in
  // the admin never leaves an empty section on the home page.
  const homeVideos = getVideos().filter(v => youtubeId(v.video))
  const instagramUrl = getSocialLinks().find(s => s.key === 'instagram')?.url || ''

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
  const hk = 'home_hero' + (activeSlide + 1)
  const slideLabel = getSiteText(hk + '_label')
  const slideHeading = getSiteText(hk + '_heading')
  const slideSub = getSiteText(hk + '_sub')

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="hero" aria-label="Hero">
        {heroSlides.map((s, i) => (
          <div key={i} className={`hero-slide ${i === activeSlide ? 'active' : ''}`}>
            <img src={getSiteImage(s.imgKey)} alt={s.label} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="hero-overlay" />

        {/* Decorative texture overlay */}
        <div className="hero-texture" />

        <div className="hero-content container">
          <div className="hero-badge fade-in-up">
            <span className="hero-category">{slideLabel}</span>
          </div>
          <h1 className="hero-title fade-in-up" style={{ animationDelay: '.1s' }}>
            {slideHeading.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
            ))}
          </h1>
          <p className="hero-sub fade-in-up" style={{ animationDelay: '.2s' }}>
            {slideSub}
          </p>
          <div className="hero-tagline fade-in-up" style={{ animationDelay: '.3s' }}>
            {heroCrafts.map(c => (
              <span key={c.label} className={`hero-craft hero-craft-${c.tone}`}>
                <i aria-hidden="true" />{c.label}
              </span>
            ))}
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
            <span className="section-label">{getSiteText('home_cats_label')}</span>
            <h2 className="section-title">{getSiteText('home_cats_title')}</h2>
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
                  <img src={getSiteImage(cat.imgKey)} alt={catName(cat)} loading="lazy" />
                  <div className="cat-overlay" style={{ background: cat.color + '33' }} />
                </div>
                <div className="cat-body">
                  <span className="cat-icon">{cat.icon}</span>
                  <h3 className="cat-name">{catName(cat)}</h3>
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
            <span className="section-label">{getSiteText('home_featured_label')}</span>
            <h2 className="section-title">{getSiteText('home_featured_title')}</h2>
            <p className="section-subtitle">{getSiteText('home_featured_sub')}</p>
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
                      href={getProductWhatsAppLink(p)}
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
                <img src={getSiteImage('home_about_main')} alt="Sapna at work" loading="lazy" />
              </div>
              <div className="about-badge-float">
                <span className="about-badge-num">5+</span>
                <span className="about-badge-text">Years of<br />Handcraft</span>
              </div>
            </div>
            <div className="home-about-text">
              <span className="section-label">{getSiteText('home_about_label')}</span>
              <h2 className="section-title">{getSiteText('home_about_title')}</h2>
              <div className="divider"><i className="fas fa-leaf" /></div>
              <p className="about-lead">
                An artist focused on macrame, paintings, and DIY, based in Ahmedabad, Gujarat.
                I create handmade art inspired by my travels across India, from the golden dunes of Rajasthan to the emerald backwaters of Kerala.
              </p>
              <p className="about-para">
                Every macrame knot, every watercolour wash, every embroidery stitch carries a memory of a place, a feeling, a moment of quiet beauty. My art is my travel journal, and I invite you to bring a piece of that journey into your home.
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
            <span className="section-label">{getSiteText('home_services_label')}</span>
            <h2 className="section-title">{getSiteText('home_services_title')}</h2>
          </div>
          <div className={`services-grid fade-up ${isVisible['services'] ? 'visible' : ''}`}>
            <div className="service-card">
              <div className="service-icon" style={{ background: 'var(--terracotta-pale)', color: 'var(--terracotta)' }}>
                <i className="fas fa-calendar-alt" />
              </div>
              <h3>Workshops</h3>
              <p>Join a live macrame, painting, or embroidery workshop, online or in Ahmedabad. All skill levels welcome!</p>
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
              <p>Curated craft kits with everything you need, perfect gifts and creative weekends at home.</p>
              <Link to="/shop?cat=diy" className="service-link">Shop DIY Kits <i className="fas fa-arrow-right" /></Link>
            </div>
            <div className="service-card">
              <div className="service-icon" style={{ background: 'var(--sage-pale)', color: 'var(--sage-dark)' }}>
                <i className="fas fa-images" />
              </div>
              <h3>Gallery</h3>
              <p>Browse Sapna's best work, commissions, collections, and behind-the-scenes process photography.</p>
              <Link to="/gallery" className="service-link">View Gallery <i className="fas fa-arrow-right" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEOS ── (hidden entirely until a video is added in the admin) */}
      {homeVideos.length > 0 && (
        <section className="section home-videos" data-id="videos">
          <div className="container">
            <div className={`section-header fade-up ${isVisible['videos'] ? 'visible' : ''}`}>
              <span className="section-label">{getSiteText('home_videos_label')}</span>
              <h2 className="section-title">{getSiteText('home_videos_title')}</h2>
              <p className="section-subtitle">{getSiteText('home_videos_sub')}</p>
            </div>
            <div className={`fade-up ${isVisible['videos'] ? 'visible' : ''}`}>
              <VideoGrid items={homeVideos} />
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="section home-testimonials" data-id="reviews">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['reviews'] ? 'visible' : ''}`}>
            <span className="section-label">{getSiteText('home_reviews_label')}</span>
            <h2 className="section-title">{getSiteText('home_reviews_title')}</h2>
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
          <h2 className="section-title">{getInstagramHandle()}</h2>
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
              <i className="fab fa-instagram" /> Follow on Instagram
            </a>
          )}
        </div>
        <div className="insta-grid">
          {[
            'home_insta_1', 'home_insta_2', 'home_insta_3',
            'home_insta_4', 'home_insta_5', 'home_insta_6',
          ].map((imgKey, i) => (
            <a key={i} href={instagramUrl} target="_blank" rel="noreferrer" className="insta-item img-overlay">
              <img src={getSiteImage(imgKey)} alt={`Instagram ${i + 1}`} loading="lazy" />
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
              <span className="section-label" style={{ color: 'rgba(255,255,255,.7)' }}>{getSiteText('home_cta_label')}</span>
              <h2>{getSiteText('home_cta_title')}</h2>
              <p>{getSiteText('home_cta_sub')}</p>
            </div>
            <div className="cta-banner-actions">
              <a href={waLink()} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
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
