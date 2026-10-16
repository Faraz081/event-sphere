import api from "@/api/api"
import { useEffect } from "react"

function WebsiteSettingsLoader() {
  useEffect(() => {
    const loadWebsiteSettings = async () => {
      try {
        const response = await api.get('/api/website-settings')
        const settings = response.data.settings
        if (settings?.websiteName) {
          document.title = settings.websiteName
        }

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


export default WebsiteSettingsLoader