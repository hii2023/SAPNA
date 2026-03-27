import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../data/blog'
import './Blog.css'

const blogCategories = [
  { id: "all",     label: "All Posts" },
  { id: "travel",  label: "✈️ Travel & Inspiration" },
  { id: "tips",    label: "🛠️ DIY Tips" },
  { id: "story",   label: "🌿 Behind the Scenes" },
]

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedPost, setSelectedPost] = useState(null)
  const [isVisible, setIsVisible] = useState({})

  const filtered = activeFilter === 'all' ? blogPosts : blogPosts.filter(p => p.tag === activeFilter)
  const featured = blogPosts.find(p => p.featured)

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

  if (selectedPost) {
    return (
      <div className="blog-page">
        <div className="blog-post-view">
          <div className="blog-post-hero">
            <img src={selectedPost.image} alt={selectedPost.title} />
            <div className="blog-post-hero-overlay" />
            <div className="blog-post-hero-content container">
              <span className="tag tag-terracotta">{selectedPost.category}</span>
              <h1>{selectedPost.title}</h1>
              <div className="blog-post-meta">
                <span><i className="fas fa-user" /> {selectedPost.author}</span>
                <span><i className="fas fa-calendar" /> {selectedPost.date}</span>
                <span><i className="fas fa-clock" /> {selectedPost.readTime}</span>
              </div>
            </div>
          </div>
          <div className="container container-narrow" style={{ padding: '3rem 2rem' }}>
            <button className="blog-back-btn" onClick={() => setSelectedPost(null)}>
              <i className="fas fa-arrow-left" /> Back to Journal
            </button>
            <div className="blog-post-body">
              {selectedPost.content.split('\n\n').map((para, i) => {
                if (para.startsWith('**') && para.endsWith('**')) {
                  return <h3 key={i}>{para.replace(/\*\*/g, '')}</h3>
                }
                if (para.includes('**')) {
                  const parts = para.split('**')
                  return (
                    <p key={i}>
                      {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                    </p>
                  )
                }
                return <p key={i}>{para}</p>
              })}
            </div>
            <div className="blog-post-footer">
              <div className="blog-post-share">
                <strong>Enjoyed this? Share it 🌸</strong>
                <div className="share-btns">
                  <a href={`https://wa.me/?text=${encodeURIComponent(selectedPost.title + ' — from Sapna\'s Art Studio Journal')}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm">
                    <i className="fab fa-whatsapp" /> Share
                  </a>
                  <a href={`https://instagram.com`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <i className="fab fa-instagram" /> Instagram
                  </a>
                </div>
              </div>
              <div className="blog-post-cta">
                <h3>Ready to Create Something Beautiful?</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/shop" className="btn btn-primary">Visit the Shop</Link>
                  <Link to="/workshops" className="btn btn-sage">Book a Workshop</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-page">
      {/* ── Hero ── */}
      <div className="page-hero blog-hero">
        <div className="page-hero-content">
          <span className="section-label">Stories, Tips & Travels</span>
          <h1>Sapna's Journal</h1>
          <p>Behind the art, inside the studio, across India & beyond — come along for the journey ✨</p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* ── Featured Post ── */}
          {featured && (
            <div className="blog-featured" data-id="blog-featured">
              <div className={`blog-featured-inner fade-up ${isVisible['blog-featured'] ? 'visible' : ''}`} onClick={() => setSelectedPost(featured)}>
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
                onClick={() => setSelectedPost(post)}
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
              <p>Get new blog posts, travel diaries, workshop announcements, and exclusive art drops — straight to your inbox.</p>
              <form className="blog-nl-form" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" className="form-control" />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
