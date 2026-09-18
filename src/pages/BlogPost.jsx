import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import ArtImage from '../components/ArtImage'
import { getSocialUrl } from '../data/adminData'
import { getBlog } from '../data/adminData'
import { useSeo } from '../hooks/useSeo'
import './Blog.css'

function renderContent(content) {
  return (content || '').split('\n\n').map((para, i) => {
    if (para.startsWith('**') && para.endsWith('**')) {
      return <h3 key={i}>{para.replace(/\*\*/g, '')}</h3>
    }
    if (para.includes('**')) {
      const parts = para.split('**')
      return <p key={i}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>
    }
    return <p key={i}>{para}</p>
  })
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getBlog().find(p => p.slug === slug)

  useEffect(() => { window.scrollTo({ top: 0 }) }, [slug])

  useSeo(post ? {
    title: `${post.title} | Sapna's Art Studio Journal`,
    description: post.excerpt,
    image: post.image && !post.image.startsWith('data:') ? post.image : undefined,
    path: `/blog/${post.slug}`,
  } : {
    title: 'Journal | Sapna\'s Art Studio',
    description: 'Stories, tips and travels from Sapna\'s Art Studio.',
    path: '/blog',
  })

  if (!post) {
    return (
      <div className="blog-page">
        <div className="container container-narrow" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h1>Post not found</h1>
          <p>This journal entry may have moved.</p>
          <Link to="/blog" className="btn btn-primary"><i className="fas fa-arrow-left" /> Back to Journal</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-page">
      <article className="blog-post-view">
        <div className="blog-post-hero">
          <ArtImage src={post.image} alt={post.title} />
          <div className="blog-post-hero-overlay" />
          <div className="blog-post-hero-content container">
            <span className="tag tag-terracotta">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <span><i className="fas fa-user" /> {post.author}</span>
              <span><i className="fas fa-calendar" /> {post.date}</span>
              <span><i className="fas fa-clock" /> {post.readTime}</span>
            </div>
          </div>
        </div>
        <div className="container container-narrow" style={{ padding: '3rem 2rem' }}>
          <Link className="blog-back-btn" to="/blog">
            <i className="fas fa-arrow-left" /> Back to Journal
          </Link>
          <div className="blog-post-body">
            {renderContent(post.content)}
          </div>
          <div className="blog-post-footer">
            <div className="blog-post-share">
              <strong>Enjoyed this? Share it 🌸</strong>
              <div className="share-btns">
                <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' https://sapna.space/blog/' + post.slug)}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm">
                  <i className="fab fa-whatsapp" /> Share
                </a>
                {getSocialUrl('instagram') && (
                  <a href={getSocialUrl('instagram')} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <i className="fab fa-instagram" /> Instagram
                  </a>
                )}
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
      </article>
    </div>
  )
}
