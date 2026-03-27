import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Shop from './pages/Shop'
import Workshops from './pages/Workshops'
import Gallery from './pages/Gallery'
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
  return (
    <Router>
      <ScrollToTop />
      <SiteLayout />
    </Router>
  )
}
