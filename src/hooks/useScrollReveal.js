import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Content blocks that should drift into view as you scroll. Deliberately a
// curated list of the repeated "content" pieces rather than everything on the
// page: if every element moves, the page feels busy instead of calm.
const TARGETS = [
  '.shop-product-card', // Shop
  '.projects-card',     // Projects
  '.recycle-card',      // Second Life
  '.video-card',        // home videos
  '.service-card',      // Home
  '.insta-item',
  '.highlight-item',
  '.example-card',      // Custom Orders
  '.pricing-card',
  '.value-card',        // About
  '.travel-card',
  '.stat-item',
  '[data-reveal]',
].join(',')

// Adds a gentle reveal to those blocks on every page, including the ones that
// never had any (Shop, Projects, Second Life). Pages that animate a block
// themselves via .fade-up are left alone so the two systems cannot fight over
// the same opacity.
export function useScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Honour the OS "reduce motion" setting: never hide anything, just stop.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    // Without IntersectionObserver nothing would ever un-hide, so do nothing
    // rather than risk leaving the page blank.
    if (typeof IntersectionObserver === 'undefined') return

    // Scoped to this run of the effect, NOT stamped on the element. A marker
    // that outlived the effect meant the second run (StrictMode double-invokes
    // effects, and the cleanup disconnects the first observer) skipped every
    // element as "already bound" and nothing was ever observed, so hidden
    // content stayed hidden.
    const seen = new WeakSet()

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('reveal-in')
          io.unobserve(entry.target) // reveal once, then leave it be
        }
      },
      // Start a little before the block is fully in view, so it has settled by
      // the time the eye reaches it.
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    )

    const bind = () => {
      for (const el of document.querySelectorAll(TARGETS)) {
        if (seen.has(el)) continue
        // Leave anything the page animates itself alone, so the two systems
        // never fight over the same opacity.
        if (el.classList.contains('fade-up') || el.closest('.fade-up')) continue
        seen.add(el)

        // Already shown by an earlier effect run: don't hide it again.
        if (el.classList.contains('reveal-in')) continue

        // Stagger siblings so a grid arrives as a wave rather than a snap.
        // Capped so a long grid never leaves the last card waiting.
        const siblings = Array.from(el.parentElement?.children || [])
        const i = Math.max(0, siblings.indexOf(el))
        el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 70}ms`)

        el.classList.add('reveal')
        io.observe(el)
      }
    }

    bind()

    // Routes are lazy-loaded, and grids re-render on filter changes, so watch
    // for content arriving after the first pass. Coalesced to one pass a frame.
    let queued = false
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => { queued = false; bind() })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => { io.disconnect(); mo.disconnect() }
  }, [pathname])
}
