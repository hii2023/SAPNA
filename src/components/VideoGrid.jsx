import React, { useState } from 'react'
import { youtubeId, youtubePoster, youtubeEmbed } from '../data/videos'
import './VideoGrid.css'

// One video card: shows the thumbnail until it is clicked, then swaps in the
// YouTube player. Nothing from youtube.com loads until someone asks for it,
// so the page stays light and no tracking happens on a plain visit.
function VideoCard({ item }) {
  const [playing, setPlaying] = useState(false)
  const id = youtubeId(item.video)
  if (!id) return null

  const poster = youtubePoster(item.video, item.photo)

  return (
    <article className="video-card">
      <div className="video-frame">
        {playing ? (
          <iframe
            src={youtubeEmbed(item.video)}
            title={item.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            className="video-play"
            onClick={() => setPlaying(true)}
            aria-label={item.title ? `Play ${item.title}` : 'Play video'}
          >
            {poster && <img src={poster} alt="" loading="lazy" decoding="async" />}
            <span className="video-play-dot">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>
      {(item.title || item.description) && (
        <div className="video-body">
          {item.title && <h3>{item.title}</h3>}
          {item.description && <p>{item.description}</p>}
        </div>
      )}
    </article>
  )
}

// Renders nothing at all when there are no usable videos, so the section it
// sits in can disappear until Sapna adds one.
export default function VideoGrid({ items }) {
  const usable = (items || []).filter(v => youtubeId(v.video))
  if (!usable.length) return null
  return (
    <div className="video-grid">
      {usable.map((v, i) => <VideoCard key={v.id || i} item={v} />)}
    </div>
  )
}
