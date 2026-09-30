import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import api from '../../api/api'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settings, setSettings] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        const response = await api.get('/api/website-settings')
        setSettings(response.data.settings)
      } catch (error) {
        console.error('Failed to load website settings:', error)
      }
    }

    fetchWebsiteSettings()
  }, [])

  const websiteName = settings?.websiteName || 'EventSphere'
  const logo = settings?.logo || ''

  const renderLogo = () => {
    if (logo) {
      return (
        <img
          src={logo}
          alt={websiteName}
          className="mr-2 h-8 w-8 rounded-full object-cover"
        />
      )
    }

    return <Sparkles className="mr-2 h-6 w-6 text-[#c49424]" />
  }

  const scrollToSection = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/')

      setTimeout(() => {
        const section = document.getElementById(id)

        if (section) {
          section.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      }, 100)

      return
    }

    const section = document.getElementById(id)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const goHome = () => {
    if (window.location.pathname !== '/') {
      navigate('/')
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    setMenuOpen(false)
  }

  return (
    <nav className="fixed inset-x-0 top-6 z-50 mx-auto max-w-7xl px-4 font-bold sm:px-6">
      <div className="flex h-16 items-center justify-between rounded-full border border-white/80 bg-white/20 px-6 shadow-[0_8px_32px_0_rgba(196,148,36,0.15)] backdrop-blur-2xl transition-all duration-300 md:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="inline-flex items-center font-serif text-2xl font-medium tracking-wider text-white transition-opacity hover:opacity-80"
        >
          {renderLogo()}
          {websiteName}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 md:flex">

          <button
            onClick={goHome}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('about')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            About
          </button>

          <button
            onClick={() => scrollToSection('services')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            Services
          </button>

          <button
            onClick={() => scrollToSection('gallery')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            Gallery
          </button>

          <Link
            to="/contact"
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            Contact
          </Link>

          <button
            onClick={() => navigate('/book-now')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            Book Now
          </button>

          <Link
            to="/login"
            className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
          >
            Login
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl text-neutral-900 focus:outline-none md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? '×' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="absolute inset-x-4 top-20 rounded-3xl border border-white/80 bg-white/30 p-6 shadow-[0_16px_48px_0_rgba(196,148,36,0.2)] backdrop-blur-3xl md:hidden">
          <div className="flex flex-col gap-4 text-center">

            <button
              onClick={goHome}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
            >
              Home
            </button>

            <button
              onClick={() => {
                scrollToSection('about')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
            >
              About
            </button>

            <button
              onClick={() => {
                scrollToSection('services')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
            >
              Services
            </button>

            <button
              onClick={() => {
                scrollToSection('gallery')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
            >
              Gallery
            </button>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
            >
              Contact
            </Link>

            <button
              onClick={() => {
                navigate('/book-now')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
            >
              Book Now
            </button>

            <div className="flex flex-col gap-4 pt-2">

              {/* Login */}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#c49424] transition-opacity hover:opacity-70"
              >
                Login
              </Link>

            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
