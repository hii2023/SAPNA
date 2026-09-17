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
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      boot.classList.add('is-done')
      setTimeout(() => boot.remove(), 600)
    })
  })
}
