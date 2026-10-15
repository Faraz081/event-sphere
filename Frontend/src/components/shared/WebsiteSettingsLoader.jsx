import { useEffect } from 'react'
import api from '@/api/api'
import websiteDefaults from '@/data/websiteDefaults'

export default function WebsiteSettingsLoader() {
  useEffect(() => {
    const loadWebsiteSettings = async () => {
      try {
        const response = await api.get('/api/website-settings')
        const settings = response.data.settings

        document.title =
          settings?.websiteName?.trim() || websiteDefaults.websiteName

        const faviconUrl =
          settings?.favicon?.trim() || websiteDefaults.favicon

        let favicon = document.querySelector('link[rel="icon"]')

        if (!favicon) {
          favicon = document.createElement('link')
          favicon.rel = 'icon'
          document.head.appendChild(favicon)
        }

        favicon.href = faviconUrl
      } catch (error) {
        console.error('Failed to load website settings:', error)
      }
    }

    loadWebsiteSettings()
  }, [])

  return null
}
