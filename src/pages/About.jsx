import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArtImage from '../components/ArtImage'
import { getSiteImage, getSiteText, waLink } from '../data/adminData'
import { useSeo } from '../hooks/useSeo'
import './About.css'

const timeline = [
  { year: "2019", icon: "🧶", title: "The First Knot", desc: "Discovered macrame on a rainy Ahmedabad weekend, bought ₹200 of cotton rope and never looked back." },
  { year: "2020", icon: "📸", title: "First Instagram Post", desc: "Shared my first macrame piece online. 12 likes. One of them was a stranger in Mumbai who later became my first customer." },
  { year: "2021", icon: "✈️", title: "Rajasthan Journey", desc: "A solo trip to Rajasthan transformed my colour palette and gave birth to the Wanderlust Collection." },
  { year: "2022", icon: "🖌️", title: "Painting & Stitching", desc: "Expanded into watercolour painting and embroidery, creating a full handmade art practice." },
  { year: "2023", icon: "🎓", title: "First Workshops", desc: "Started teaching macrame and watercolour workshops in Ahmedabad. Sold out every single session." },
  { year: "2024", icon: "🌟", title: "Gujarat Craft Fair", desc: "Won honourable mention at the Gujarat Craft Fair for the Rajasthan Blue City watercolour series." },
  { year: "2025", icon: "🚀", title: "Sapna's Art Studio", desc: "Launched the full studio, shop, workshops, DIY kits, and custom commissions, all in one beautiful place." },
]

const values = [
  { icon: "🌱", title: "Sustainably Made", desc: "Natural cotton ropes, plant-based dyes, recycled packaging. The earth deserves our care." },
  { icon: "✋", title: "100% Handmade", desc: "Every knot, stroke, and stitch by hand. No mass production, ever." },
  { icon: "🗺️", title: "Travel-Inspired", desc: "Each piece carries a story from a place I've loved, the colours, the textures, the feeling." },
  { icon: "🤝", title: "Community First", desc: "My workshops are spaces of joy, not performance. Everyone is an artist here." },
]

export default function About() {
  useSeo({
    title: 'About Sapna | Artist in Ahmedabad, India',
    description: 'Meet Sapna, an independent contemporary artist in Ahmedabad creating macrame, paintings and art-led projects. Available for commissions, installations, murals and creative collaborations.',
    path: '/about',
  })
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
    <div className="about-page">
      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img src={getSiteImage('about_hero')} alt="Sapna at work" />
          <div className="about-hero-overlay" />
        </div>
        <div className="about-hero-content container">
          <span className="section-label" style={{ color: 'rgba(255,255,255,.7)' }}>The Artist</span>
          <h1>Hello, I'm <span className="script" style={{ color: 'var(--terracotta-light)' }}>Sapna</span> 🌿</h1>
          <p>Artist · Traveller · Maker of Beautiful Things<br />Based in Ahmedabad, Gujarat, India</p>
          <div className="about-hero-chips">
            <span>🪢 Macrame</span>
            <span>🖌️ Paintings</span>
            <span>🧵 Embroidery</span>
            <span>✈️ Traveller</span>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="section about-story" data-id="story">
        <div className="container">
          <div className={`about-story-inner fade-up ${isVisible['story'] ? 'visible' : ''}`}>
            <div className="story-images">
              <div className="story-img-wrap img-overlay">
                <img src={getSiteImage('about_story_main')} alt="Sapna crafting" loading="lazy" />
              </div>
              <div className="story-img-small img-overlay">
                <img src={getSiteImage('about_story_small')} alt="Embroidery work" loading="lazy" />
              </div>
            </div>
            <div className="story-text">
              <span className="section-label">{getSiteText('about_story_label')}</span>
              <h2 className="section-title">{getSiteText('about_story_title')}</h2>
              <div className="divider"><i className="fas fa-heart" /></div>
              <p>
                Five years ago, I was working a desk job in Ahmedabad, spending my lunch breaks watching craft tutorials on my phone and my evenings dreaming about making art. One monsoon weekend in 2019, I finally did something about it, I bought a YouTube tutorial book, two hundred rupees worth of cotton rope from Manek Chowk, and started learning macrame.
              </p>
              <p>
                The first piece was terrible. The knots were uneven, the tension was wrong, and it sagged sideways. I kept it anyway, it hangs in my studio today as a reminder that every master was once a beginner.
              </p>
              <p>
                I spent a year practising quietly, gifting pieces to friends, and slowly building an Instagram account. When I got my first real order from a stranger in Mumbai, for a custom piece for her bedroom, I cried actual happy tears.
              </p>
              <p>
                Today, Sapna's Art Studio is my full-time life. I make macrame wall hangings, travel-inspired watercolour paintings, and botanical embroidery hoops. I run sold-out workshops every week, ship pieces across India, and wake up every morning grateful that I finally let myself be an artist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Practice & Collaborations (SEO / professional positioning) ── */}
      <section className="section about-practice" data-id="practice">
        <div className="container container-narrow">
          <div className={`section-header fade-up ${isVisible['practice'] ? 'visible' : ''}`}>
            <span className="section-label">{getSiteText('about_practice_label')}</span>
            <h2 className="section-title">{getSiteText('about_practice_title')}</h2>
          </div>
          <div className={`about-practice-body fade-up ${isVisible['practice'] ? 'visible' : ''}`}>
            <p>
              Sapna is an independent artist based in Ahmedabad, India, creating contemporary artwork,
              visual experiences and art-led projects. Her practice explores ideas, spaces, materials and
              visual storytelling through original artworks and creative collaborations.
            </p>
            <p>
              Based in Ahmedabad and open to working across India and internationally, she collaborates with
              individuals, brands, architects, designers, cultural spaces, hospitality projects and organisations
              looking for distinctive art and creative direction.
            </p>
            <p className="about-practice-lead">She is available for:</p>
            <ul className="about-practice-list">
              <li><i className="fas fa-palette" /> Art commissions</li>
              <li><i className="fas fa-map-pin" /> Site-specific artwork</li>
              <li><i className="fas fa-cubes" /> Installations</li>
              <li><i className="fas fa-paint-roller" /> Murals</li>
              <li><i className="fas fa-users" /> Collaborations &amp; special creative projects</li>
            </ul>
            <p>
              If you have an interesting space, idea or project that could benefit from an original artistic
              perspective, she is open to travelling and exploring the possibility of working together.
            </p>
            <a
              href={waLink("Hi Sapna! I'd love to discuss an art project / collaboration with you. 🙏")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ marginTop: '1.25rem' }}
            >
              <i className="fab fa-whatsapp" /> Discuss a Project
            </a>
          </div>
        </div>
      </section>

      {/* ── Travel & Inspiration ── */}
      <section className="section about-travel" style={{ background: 'var(--beige-light)' }} data-id="travel">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['travel'] ? 'visible' : ''}`}>
            <span className="section-label">{getSiteText('about_travel_label')}</span>
            <h2 className="section-title">{getSiteText('about_travel_title')}</h2>
            <p className="section-subtitle">{getSiteText('about_travel_sub')}</p>
          </div>
          <div className={`travel-grid fade-up ${isVisible['travel'] ? 'visible' : ''}`}>
            <div className="travel-card">
              <div className="travel-img img-overlay">
                <ArtImage src={getSiteImage('about_travel_rajasthan')} alt="Rajasthan" />
                <div className="travel-label">Rajasthan</div>
              </div>
              <div className="travel-info">
                <h3>The Desert Collection</h3>
                <p>Golden Jaisalmer, cobalt Jodhpur, pink Jaipur, the colours of Rajasthan live in my macrame and paintings. The desert sand became my favourite colour palette.</p>
              </div>
            </div>
            <div className="travel-card">
              <div className="travel-img img-overlay">
                <ArtImage src={getSiteImage('about_travel_kerala')} alt="Kerala" />
                <div className="travel-label">Kerala</div>
              </div>
              <div className="travel-info">
                <h3>Backwaters & Emerald Green</h3>
                <p>Painting from a houseboat on the Alleppey backwaters at dawn, the deep emerald, the mist, the absolute silence. The Kerala series is my most meditative work.</p>
              </div>
            </div>
            <div className="travel-card">
              <div className="travel-img img-overlay">
                <ArtImage src={getSiteImage('about_travel_himalayas')} alt="Himalayas" />
                <div className="travel-label">Himalayas</div>
              </div>
              <div className="travel-info">
                <h3>Mountain Mist Paintings</h3>
                <p>Trekking in Himachal Pradesh with a sketchbook instead of a camera. The misty ridges, the pine forests, the cold blue mornings that taste like the edge of the world.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section about-values" data-id="values">
        <div className="container">
          <div className={`section-header fade-up ${isVisible['values'] ? 'visible' : ''}`}>
            <span className="section-label">{getSiteText('about_values_label')}</span>
            <h2 className="section-title">{getSiteText('about_values_title')}</h2>
          </div>
          <div className={`values-grid fade-up ${isVisible['values'] ? 'visible' : ''}`}>
            {values.map((v, i) => (
              <div key={i} className="value-card" style={{ transitionDelay: `${i * .1}s` }}>
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="section about-timeline" style={{ background: 'var(--cream)' }} data-id="timeline">
        <div className="container container-narrow">
          <div className={`section-header fade-up ${isVisible['timeline'] ? 'visible' : ''}`}>
            <span className="section-label">The Journey</span>
            <h2 className="section-title">How It All Began</h2>
          </div>
          <div className={`timeline fade-up ${isVisible['timeline'] ? 'visible' : ''}`}>
            {timeline.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`} style={{ transitionDelay: `${i * .1}s` }}>
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-dot">
                  <span>{item.icon}</span>
                </div>
                <div className="timeline-content">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats" data-id="stats">
        <div className={`stats-inner container fade-up ${isVisible['stats'] ? 'visible' : ''}`}>
          {[
            { num: "500+", label: "Artworks Sold" },
            { num: "1,200+", label: "Workshop Participants" },
            { num: "15+", label: "Cities Reached" },
            { num: "5★", label: "Average Rating" },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section about-cta" data-id="about-cta">
        <div className={`container container-narrow text-center fade-up ${isVisible['about-cta'] ? 'visible' : ''}`}>
          <span className="section-label">{getSiteText('about_cta_label')}</span>
          <h2 className="section-title">{getSiteText('about_cta_title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2.5rem' }}>
            Browse the shop, book a workshop, or reach out for a custom commission, I'd love to create something beautiful just for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">Explore the Shop</Link>
            <Link to="/workshops" className="btn btn-sage btn-lg">Book a Workshop</Link>
            <a href={waLink()} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
              <i className="fab fa-whatsapp" /> Say Hello
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
