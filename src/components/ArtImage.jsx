import React, { useState, useEffect } from 'react'
import './ArtImage.css'

// An <img> that never shows the browser's broken-image icon.
//
// Two things produced one: content saved with no photo yet (src="" resolves to
// the current page URL, which is not an image), and a few built-in Unsplash
// placeholder URLs that have since 404'd. Either way a visitor saw a torn-page
// icon. This falls back to a quiet branded panel instead, which reads as
// "no photo yet" rather than "this site is broken".
export default function ArtImage({ src, alt = '', className = '', loading = 'lazy', ...rest }) {
  const [failed, setFailed] = useState(false)

  // A new src deserves a fresh attempt (filters and edits swap these in place).
  useEffect(() => { setFailed(false) }, [src])

  const usable = typeof src === 'string' && src.trim() !== ''

  if (!usable || failed) {
    return (
      <div className={`art-image-fallback ${className}`} role="img" aria-label={alt || 'Photo coming soon'}>
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 10 C 32 16, 32 21, 24 24 C 16 27, 16 32, 24 38 C 32 32, 32 27, 24 24 C 16 21, 16 16, 24 10 Z" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
