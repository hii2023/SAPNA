// ============================================================
// IMAGE UTILITIES
// Client-side downscale + JPEG compression so uploaded photos
// are small enough to save reliably (raw phone photos are several
// MB; these bring them down to a couple hundred KB). Also a crop
// helper used by the crop modal.
// ============================================================

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

// Downscale to fit within maxW x maxH (never upscales) and export JPEG.
export async function compressImage(input, { maxW = 1400, maxH = 1400, quality = 0.82 } = {}) {
  const src = typeof input === 'string' ? input : await fileToDataUrl(input)
  const img = await loadImage(src)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  const scale = Math.min(1, maxW / w, maxH / h)
  const ow = Math.max(1, Math.round(w * scale))
  const oh = Math.max(1, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = ow
  canvas.height = oh
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ow, oh)
  ctx.drawImage(img, 0, 0, ow, oh)
  return canvas.toDataURL('image/jpeg', quality)
}

// Crop a source region (source pixels) and render it at outW x outH as JPEG.
export async function cropImage(input, crop, outW, outH, quality = 0.85) {
  const src = typeof input === 'string' ? input : await fileToDataUrl(input)
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outW, outH)
  return canvas.toDataURL('image/jpeg', quality)
}

// Rough KB size of a data URL (for UI hints / guards).
export function dataUrlKB(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return 0
  const i = dataUrl.indexOf(',')
  const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl
  return Math.round((b64.length * 3 / 4) / 1024)
}
