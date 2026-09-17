import React from 'react'
import './StudioLoader.css'

// Loading state for the studio: a macrame knot drawing itself, inside a slowly
// turning ring of thread. Used while a route chunk arrives; the same mark is
// inlined in index.html for the very first paint, so a reload and a page change
// look like the same thing.
export default function StudioLoader({ label = 'Gathering the threads…' }) {
  return (
    <div className="studio-loader" role="status" aria-live="polite">
      <svg className="studio-loader-mark" viewBox="0 0 120 120" aria-hidden="true">
        {/* Ring of thread, turning slowly. */}
        <circle className="sl-ring" cx="60" cy="60" r="50" pathLength="100" />
        {/* The knot, drawn and released on a loop. */}
        <path
          className="sl-knot"
          pathLength="100"
          d="M60 32 C 80 44, 80 56, 60 60 C 40 64, 40 76, 60 88 C 80 76, 80 64, 60 60 C 40 56, 40 44, 60 32 Z"
        />
      </svg>
      <span className="studio-loader-label">{label}</span>
    </div>
  )
}
