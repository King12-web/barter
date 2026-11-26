import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

// Keep one-time email codes (verification, password reset) out of analytics.
function redactAuthCodes(event) {
  const url = new URL(event.url)
  url.searchParams.delete('oobCode')
  return { ...event, url: url.toString() }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Analytics beforeSend={redactAuthCodes} />
    </BrowserRouter>
  </StrictMode>,
)