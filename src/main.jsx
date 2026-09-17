import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Retire the first-paint loader from index.html once React has actually
// painted. Two frames: the first commits the tree, the second is the browser
// having drawn it, so the cross-fade never reveals a blank page.
const boot = document.getElementById('boot')
if (boot) {
  let cleared = false
  const retire = () => {
    if (cleared) return
    cleared = true
    boot.classList.add('is-done')
    setTimeout(() => boot.remove(), 600)
  }
  // Two frames: the first commits the tree, the second is the browser having
  // drawn it, so the cross-fade never reveals a blank page.
  requestAnimationFrame(() => requestAnimationFrame(retire))
  // requestAnimationFrame is throttled in a background tab, so a page opened
  // in one (a cmd-click, say) could sit behind the loader until it is focused.
  // This guarantees the overlay is retired either way.
  setTimeout(retire, 2000)
}
