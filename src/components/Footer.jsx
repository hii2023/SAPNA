import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* Newsletter Strip */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-inner">
            <div className="newsletter-text">
              <span className="section-label">Stay Connected</span>
              <h3>New Art Drops & Workshop Alerts ✨</h3>
              <p>Join Sapna's community — get first access to new collections, workshop dates, travel-inspired stories & exclusive discounts.</p>
            </div>
            {subscribed ? (
              <div className="newsletter-success">
                <div className="success-icon">🌸</div>
                <p><strong>You're in!</strong> Welcome to Sapna's inner circle. Check your inbox soon.</p>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <div className="newsletter-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="newsletter-input"
                  />
                  <button type="submit" className="btn btn-terracotta">
                    Subscribe <i className="fas fa-arrow-right" />
                  </button>
                </div>
                <p className="newsletter-note">No spam, ever. Unsubscribe anytime. 🤍</p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Brand column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="logo-mark">S</div>
                <div>
                  <span className="logo-name">Sapna's Art Studio</span>
                  <span className="logo-tagline">Handcrafted with Love & Wanderlust</span>
                </div>
              </Link>
              <p className="footer-bio">
                Hello! I'm Sapna — a textile artist, painter, and wanderer based in Ahmedabad, Gujarat.
                Every piece I create carries a little piece of a journey, a memory, and a whole lot of love.
              </p>
              <div className="footer-social">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-link">
                  <i className="fab fa-instagram" />
                </a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="social-link whatsapp">
                  <i className="fab fa-whatsapp" />
                </a>
                <a href="mailto:hello@sapnaart.studio" aria-label="Email" className="social-link">
                  <i className="fas fa-envelope" />
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest" className="social-link">
                  <i className="fab fa-pinterest-p" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Explore</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Sapna</Link></li>
                <li><Link to="/shop">Shop Art</Link></li>
                <li><Link to="/workshops">Workshops</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/custom-orders">Custom Orders</Link></li>
                <li><Link to="/blog">Journal</Link></li>
              </ul>
            </div>

            {/* Shop by category */}
            <div className="footer-col">
              <h4 className="footer-col-title">Shop By Type</h4>
              <ul className="footer-links">
                <li><Link to="/shop?cat=macrame">🪢 Macrame Wall Hangings</Link></li>
                <li><Link to="/shop?cat=painting">🖌️ Original Paintings</Link></li>
                <li><Link to="/shop?cat=stitching">🧵 Embroidery & Stitching</Link></li>
                <li><Link to="/shop?cat=diy">🎁 DIY Kits</Link></li>
                <li><Link to="/custom-orders">✏️ Custom Commissions</Link></li>
                <li><Link to="/workshops">📅 Book a Workshop</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-col-title">Get in Touch</h4>
              <ul className="footer-contact">
                <li>
                  <i className="fab fa-whatsapp" />
                  <div>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">+91 98765 43210</a>
                    <span>Mon–Sat, 10am–7pm IST</span>
                  </div>
                </li>
                <li>
                  <i className="fas fa-envelope" />
                  <div>
                    <a href="mailto:hello@sapnaart.studio">hello@sapnaart.studio</a>
                    <span>Reply within 24 hours</span>
                  </div>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt" />
                  <div>
                    <span>Ahmedabad, Gujarat, India</span>
                    <span>Shipping across India 🇮🇳</span>
                  </div>
                </li>
                <li>
                  <i className="fab fa-instagram" />
                  <div>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">@sapnaart.studio</a>
                    <span>Follow for daily art & travel</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>© {year} Sapna's Art Studio. All rights reserved. Made with 🧡 in Ahmedabad.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <span>·</span>
              <a href="#">Shipping & Returns</a>
              <span>·</span>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
