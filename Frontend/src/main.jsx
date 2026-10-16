import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import api from './api/api'

function WebsiteSettingsLoader() {
  useEffect(() => {
    const loadWebsiteSettings = async () => {
      try {
        const response = await api.get('/api/website-settings')
        const settings = response.data.settings

        // Browser tab title
        if (settings?.websiteName) {
          document.title = settings.websiteName
        }

        // Browser favicon
        const faviconUrl = settings?.favicon

        if (faviconUrl) {
          let favicon = document.querySelector('link[rel="icon"]')

          if (!favicon) {
            favicon = document.createElement('link')
            favicon.rel = 'icon'
            document.head.appendChild(favicon)
          }

          favicon.href = faviconUrl
        }
      } catch (error) {
        console.error('Failed to load website settings:', error)
      }
    }

    loadWebsiteSettings()
  }, [])

  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <WebsiteSettingsLoader />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)