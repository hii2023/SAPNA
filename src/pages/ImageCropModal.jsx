import React, { useState, useEffect, useRef, useCallback } from 'react'
import { loadImage, cropImage } from '../utils/image'
import './ImageCropModal.css'

// Interactive crop: drag to reposition, slider to zoom. Output is
// rendered at exactly outW x outH (the section's recommended size).
export default function ImageCropModal({ src, aspect, outW, outH, label, onCancel, onConfirm }) {
  const viewportRef = useRef(null)
  const [img, setImg] = useState(null)          // { w, h }
  const [vw, setVw] = useState(320)             // viewport display width (px)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const drag = useRef(null)

  const vh = vw / aspect

  // Load the image to get natural dimensions.
  useEffect(() => {
    let alive = true
    loadImage(src).then(im => { if (alive) setImg({ w: im.naturalWidth || im.width, h: im.naturalHeight || im.height }) })
    return () => { alive = false }
  }, [src])

  // Track viewport width (responsive / mobile).
  useEffect(() => {
    const measure = () => { if (viewportRef.current) setVw(viewportRef.current.clientWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const coverScale = img ? Math.max(vw / img.w, vh / img.h) : 1
  const scale = coverScale * zoom
  const dw = img ? img.w * scale : 0
  const dh = img ? img.h * scale : 0

  const clamp = useCallback((o, curScale) => {
    const w = img ? img.w * curScale : 0
    const h = img ? img.h * curScale : 0
    return {
      x: Math.min(0, Math.max(vw - w, o.x)),
      y: Math.min(0, Math.max(vh - h, o.y)),
    }
  }, [img, vw, vh])

  // Centre the image whenever the image or viewport changes.
  useEffect(() => {
    if (!img) return
    setOffset(clamp({ x: (vw - dw) / 2, y: (vh - dh) / 2 }, scale))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, vw])

  const onZoom = (z) => {
    if (!img) return
    const old = scale
    const next = coverScale * z
    // keep the viewport centre point stable
    const cx = (vw / 2 - offset.x) / old
    const cy = (vh / 2 - offset.y) / old
    const no = { x: vw / 2 - cx * next, y: vh / 2 - cy * next }
    setZoom(z)
    setOffset(clamp(no, next))
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const nx = drag.current.ox + (e.clientX - drag.current.px)
    const ny = drag.current.oy + (e.clientY - drag.current.py)
    setOffset(clamp({ x: nx, y: ny }, scale))
  }
  const onPointerUp = () => { drag.current = null }

  const handleConfirm = async () => {
    if (!img) return
    setBusy(true)
    try {
      const sx = -offset.x / scale
      const sy = -offset.y / scale
      const sw = vw / scale
      const sh = vh / scale
      const out = await cropImage(src, { sx, sy, sw, sh }, outW, outH, 0.85)
      onConfirm(out)
    } catch (e) {
      setBusy(false)
    }
  }

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={e => e.stopPropagation()}>
        <div className="crop-head">
          <div>
            <h3>Position photo</h3>
            {label && <span className="crop-sub">{label}</span>}
          </div>
          <button className="crop-x" onClick={onCancel} aria-label="Close"><i className="fas fa-times" /></button>
        </div>

        <p className="crop-hint">Drag the photo to choose which part shows. Use the slider to zoom. The frame is the exact shape this section uses.</p>

        <div
          className="crop-viewport"
          ref={viewportRef}
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {img && (
            <img
              src={src}
              alt="Crop preview"
              draggable="false"
              style={{ position: 'absolute', left: offset.x, top: offset.y, width: dw, height: dh, maxWidth: 'none' }}
            />
          )}
          <div className="crop-grid" />
        </div>

        <div className="crop-zoom">
          <i className="fas fa-search-minus" />
          <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={e => onZoom(Number(e.target.value))} />
          <i className="fas fa-search-plus" />
        </div>

        <div className="crop-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={handleConfirm} disabled={busy || !img}>
            <i className="fas fa-check" /> {busy ? 'Saving…' : 'Use this photo'}
          </button>
        </div>
      </div>
    </div>
  )
}
