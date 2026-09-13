import { useEffect } from 'react'

const BASE = 'https://sapna.space'
const DEFAULT_IMAGE = 'https://sapna.space/og-image.jpg'

function setMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Per-page SEO: updates title, description, canonical, Open Graph and Twitter
// tags on navigation. Googlebot renders JS, so these are picked up per route.
export function useSeo({ title, description, image, path }) {
  useEffect(() => {
    const url = BASE + (path || window.location.pathname)
    const img = image || DEFAULT_IMAGE
    if (title) document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', img)
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', url)
  }, [title, description, image, path])
}
