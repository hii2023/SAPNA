import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { hydrate } from './data/adminData'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Shop from './pages/Shop'
import Workshops from './pages/Workshops'
import Gallery from './pages/Gallery'
import Recycle from './pages/Recycle'
import Projects from './pages/Projects'
import CustomOrders from './pages/CustomOrders'
import Blog from './pages/Blog'
import Admin from './pages/Admin'

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
          <Route path="/admin" element={<Admin />} />
        </Routes>
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
