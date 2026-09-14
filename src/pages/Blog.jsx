import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBlog, getSiteText } from '../data/adminData'
import { useSeo } from '../hooks/useSeo'
import { subscribeNewsletter } from '../data/leads'
import './Blog.css'

const blogCategories = [
  { id: "all",     label: "All Posts" },
  { id: "travel",  label: "✈️ Travel & Inspiration" },
  { id: "tips",    label: "🛠️ DIY Tips" },
  { id: "story",   label: "🌿 Behind the Scenes" },
]

export default function Blog() {
  useSeo({
    title: 'Journal | Sapna\'s Art Studio',
    description: 'Stories, tips and travel diaries from Sapna\'s Art Studio. Behind the art, inside the studio, across India and beyond.',
    path: '/blog',
  })
  const navigate = useNavigate()
  const blogPosts = getBlog()
  const [activeFilter, setActiveFilter] = useState('all')
  const [isVisible, setIsVisible] = useState({})
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const filtered = activeFilter === 'all' ? blogPosts : blogPosts.filter(p => p.tag === activeFilter)
  const featured = blogPosts.find(p => p.featured)
  const openPost = (post) => navigate(`/blog/${post.slug}`)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    try { await subscribeNewsletter(email.trim(), 'journal') } catch (_) {}
    setEmail('')
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
    <div className="blog-page">
      {/* ── Hero ── */}
      <div className="page-hero blog-hero">
        <div className="page-hero-content">
          <span className="section-label">{getSiteText('blog_hero_label')}</span>
          <h1>{getSiteText('blog_hero_title')}</h1>
          <p>{getSiteText('blog_hero_sub')}</p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* ── Featured Post ── */}
          {featured && (
            <div className="blog-featured" data-id="blog-featured">
              <div className={`blog-featured-inner fade-up ${isVisible['blog-featured'] ? 'visible' : ''}`} onClick={() => openPost(featured)}>
                <div className="blog-featured-img img-overlay">
                  <img src={featured.image} alt={featured.title} loading="lazy" />
                  <span className="blog-featured-badge">✨ Featured Story</span>
                </div>
                <div className="blog-featured-content">
                  <span className="tag tag-terracotta">{featured.category}</span>
                  <h2 className="blog-featured-title">{featured.title}</h2>
                  <p className="blog-featured-excerpt">{featured.excerpt}</p>
                  <div className="blog-post-meta">
                    <span><i className="fas fa-calendar" /> {featured.date}</span>
                    <span><i className="fas fa-clock" /> {featured.readTime}</span>
                  </div>
                  <button className="btn btn-primary">
                    Read Story <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Filter ── */}
          <div className="blog-filters" data-id="blog-filters">
            <div className={`blog-filter-inner fade-up ${isVisible['blog-filters'] ? 'visible' : ''}`}>
              {blogCategories.map(c => (
                <button
                  key={c.id}
                  className={`filter-chip ${activeFilter === c.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Posts Grid ── */}
          <div className="blog-grid" data-id="blog-grid">
            {filtered.filter(p => !p.featured || activeFilter !== 'all').map((post, i) => (
              <div
                key={post.id}
                className={`blog-card fade-up ${isVisible['blog-grid'] ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * .08}s` }}
                onClick={() => openPost(post)}
              >
                <div className="blog-card-img img-overlay">
                  <img src={post.image} alt={post.title} loading="lazy" />
                  <div className="blog-card-img-overlay" />
                </div>
                <div className="blog-card-body">
                  <span className="tag tag-terracotta">{post.category}</span>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <div className="blog-post-meta">
                      <span><i className="fas fa-calendar" /> {post.date}</span>
                      <span><i className="fas fa-clock" /> {post.readTime}</span>
                    </div>
                    <span className="blog-read-more">Read More <i className="fas fa-arrow-right" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Newsletter CTA ── */}
          <div className="blog-newsletter" data-id="blog-nl">
            <div className={`blog-nl-inner fade-up ${isVisible['blog-nl'] ? 'visible' : ''}`}>
              <span className="section-label">Never Miss a Story</span>
              <h2>Join Sapna's Inner Circle 🌸</h2>
              <p>Get new blog posts, travel diaries, workshop announcements, and exclusive art drops, straight to your inbox.</p>
              {subscribed ? (
                <p className="blog-nl-thanks"><i className="fas fa-check-circle" /> Thank you! You're on the list. 🌸</p>
              ) : (
                <form className="blog-nl-form" onSubmit={handleSubscribe}>
                  <input type="email" required placeholder="your@email.com" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
