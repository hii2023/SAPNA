import React, { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { hydrate } from './data/adminData'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
// Route-based code splitting: the landing page loads eagerly; everything
// else (especially the large Admin) is a separate chunk fetched on demand,
// so public visitors download far less up front.
const About = lazy(() => import('./pages/About'))
const Shop = lazy(() => import('./pages/Shop'))
const Workshops = lazy(() => import('./pages/Workshops'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Recycle = lazy(() => import('./pages/Recycle'))
const Projects = lazy(() => import('./pages/Projects'))
const CustomOrders = lazy(() => import('./pages/CustomOrders'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Admin = lazy(() => import('./pages/Admin'))

function RouteFallback() {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8178' }}>Loading…</div>
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
