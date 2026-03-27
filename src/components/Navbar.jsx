import React, { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
  { to: "/",             label: "Home" },
  { to: "/about",        label: "About" },
  { to: "/shop",         label: "Shop" },
  { to: "/workshops",    label: "Workshops" },
  { to: "/gallery",      label: "Gallery" },
  { to: "/custom-orders",label: "Custom Orders" },
  { to: "/blog",         label: "Journal" },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [hideNav,    setHideNav]    = useState(false)
  const [lastScroll, setLastScroll] = useState(0)
  const location = useLocation()

  const handleScroll = useCallback(() => {
    const current = window.scrollY
    setScrolled(current > 40)
    setHideNav(current > lastScroll && current > 120)
    setLastScroll(current)
  }, [lastScroll])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isHome = location.pathname === '/'

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''} ${hideNav ? 'hide' : ''} ${isHome && !scrolled ? 'navbar-transparent' : ''}`}>
        <div className="navbar-inner container-wide">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-mark">S</div>
            <div className="logo-text">
              <span className="logo-name">Sapna's Art Studio</span>
              <span className="logo-tagline">Handcrafted with Love</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar-nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="navbar-cta">
            <a
              href="https://wa.me/918511341910"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm navbar-whatsapp"
            >
              <i className="fab fa-whatsapp" />
              <span>Chat with Sapna</span>
            </a>
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          <div className="mobile-logo">
            <div className="logo-mark">S</div>
            <span className="logo-name">Sapna's Art Studio</span>
          </div>
          <nav className="mobile-nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mobile-cta">
            <a
              href="https://wa.me/918511341910"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <i className="fab fa-whatsapp" /> Chat with Sapna on WhatsApp
            </a>
            <div className="mobile-social">
              <a href="https://instagram.com/art_wt_sapna" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="mailto:hello@art_wt_sapna" aria-label="Email">
                <i className="fas fa-envelope" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  )
}
