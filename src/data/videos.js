// ============================================================
// VIDEOS
// YouTube links rather than uploaded files: a phone video is tens
// of megabytes, and YouTube already handles hosting, streaming and
// mobile playback. The admin pastes any YouTube URL; the site pulls
// the thumbnail and only loads the player once someone clicks.
// ============================================================

// Empty by default: the homepage section stays hidden until Sapna
// adds her first video.
export const videos = []

// Pull the video id out of any YouTube URL shape (watch, youtu.be,
// embed, shorts, /v/), so the admin can paste whatever they copied.
export function youtubeId(url) {
  if (!url) return ''
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{6,})/
  )
  return m ? m[1] : ''
}

// Thumbnail for a video: the admin's own photo if they set one,
// otherwise YouTube's.
export function youtubePoster(video, photo) {
  if (photo) return photo
  const id = youtubeId(video)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

export function youtubeEmbed(video) {
  const id = youtubeId(video)
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : ''
}
