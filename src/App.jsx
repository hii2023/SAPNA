import React, { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { hydrate } from './data/adminData'
import { useScrollReveal } from './hooks/useScrollReveal'
import StudioLoader from './components/StudioLoader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
// Route-based code splitting: the landing page loads eagerly; everything
// else (especially the large Admin) is a separate chunk fetched on demand,
// so public visitors download far less up front.
// After a new deploy, the old chunk hashes disappear, so a stale page would
// fail to import and show blank. lazyWithRetry recovers by reloading once
// to fetch the fresh index + chunks.
function lazyWithRetry(factory) {
  return lazy(() => factory().catch((err) => {
    if (!sessionStorage.getItem('chunk-reloaded')) {
      try { sessionStorage.setItem('chunk-reloaded', '1') } catch (_) {}
      window.location.reload()
      return new Promise(() => {}) // hold until the reload happens
    }
    throw err
  }))
}
const About = lazyWithRetry(() => import('./pages/About'))
const Shop = lazyWithRetry(() => import('./pages/Shop'))
const Workshops = lazyWithRetry(() => import('./pages/Workshops'))
const Gallery = lazyWithRetry(() => import('./pages/Gallery'))
const Recycle = lazyWithRetry(() => import('./pages/Recycle'))
const Projects = lazyWithRetry(() => import('./pages/Projects'))
const CustomOrders = lazyWithRetry(() => import('./pages/CustomOrders'))
const Blog = lazyWithRetry(() => import('./pages/Blog'))
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'))
const Admin = lazyWithRetry(() => import('./pages/Admin'))

function RouteFallback() {
  return <StudioLoader />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

function SiteLayout() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'
  useScrollReveal()

  return (
    <div className="app">
      {!isAdmin && <Navbar />}
      <main>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/second-life" element={<Recycle />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/custom-orders" element={<CustomOrders />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

export default function App() {
  // Pull the latest published content from Supabase on load, then bump
  // `ver` to remount the tree so pages re-read the freshly cached data.
  // First paint uses cached/default data instantly (no blocking loader).
  const [ver, setVer] = useState(0)
  useEffect(() => {
    let alive = true
    // App mounted successfully: clear the stale-chunk reload guard so a
    // future deploy can recover the same way.
    try { sessionStorage.removeItem('chunk-reloaded') } catch (_) {}
    hydrate().finally(() => { if (alive) setVer(v => v + 1) })
    return () => { alive = false }
  }, [])

  return (
    <Router>
      <ScrollToTop />
      <SiteLayout key={ver} />
    </Router>
  )
}
