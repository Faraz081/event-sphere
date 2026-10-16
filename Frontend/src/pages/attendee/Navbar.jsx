import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut } from 'lucide-react'
import api from '../../api/api'
import { logout } from '@/store/slices/authSlice'
import { fetchUnreadCounts } from '@/store/slices/messageSlice'
import { clearNotifications } from '@/store/slices/notificationSlice'
import { clearBookmarks } from '@/store/slices/bookmarkSlice'
import NotificationBell from '@/components/shared/NotificationBell'
import websiteDefaults from '@/data/websiteDefaults'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settings, setSettings] = useState(null)
  const { user } = useSelector((state) => state.auth)
  const { unread } = useSelector((state) => state.message)
  const isAttendee = user?.role === 'attendee'
  const isGuest = !user

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const unreadCount = unread.reduce((total, item) => total + item.count, 0)

  const handleLogout = () => {
    dispatch(clearNotifications())
    dispatch(clearBookmarks())
    dispatch(logout())
    setMenuOpen(false)
    navigate('/')
  }

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

  useEffect(() => {
    if (!isAttendee) return

    dispatch(fetchUnreadCounts())

    const interval = setInterval(() => {
      dispatch(fetchUnreadCounts())
    }, 5000)

    return () => clearInterval(interval)
  }, [dispatch, isAttendee])

  const websiteName =
    settings?.websiteName?.trim() || websiteDefaults.websiteName
  const logo = settings?.logo?.trim() || websiteDefaults.logo

  const renderLogo = () => {
    return (
      <img
        src={logo}
        alt={websiteName}
        className="mr-2 h-8 max-h-9 w-auto max-w-30 shrink-0 rounded-md object-contain shadow-[0_1px_3px_rgba(0,0,0,0.3)] md:h-9 md:max-w-40"
      />
    )
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

        
        <Link
          to="/"
          className="inline-flex min-w-0 shrink items-center font-serif text-2xl font-medium tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-opacity hover:opacity-80"
        >
          {renderLogo()}
          {websiteName}
        </Link>

        
        <div className="hidden items-center gap-7 lg:flex whitespace-nowrap">

          <button
            onClick={goHome}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('about')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
          >
            About
          </button>

          <button
            onClick={() => scrollToSection('expos')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
          >
            Services
          </button>

          <button
            onClick={() => scrollToSection('gallery')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
          >
            Gallery
          </button>

          <Link
            to="/contact"
            className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
          >
            Contact
          </Link>

          <button
            onClick={() => navigate('/book-now')}
            className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
          >
            Book Now
          </button>

          {isAttendee && (
            <Link
              to="/attendee/messages"
              className="relative text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49424] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {isAttendee && (
            <Link
              to="/profile"
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
            >
              Profile
            </Link>
          )}

          {isAttendee && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}

          {isGuest && (
            <>
              <Link
                to="/login"
                className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="text-sm text-[#c49424] transition-opacity hover:opacity-75 whitespace-nowrap"
              >
                Sign Up
              </Link>
            </>
          )}

        </div>

        
        <div className="flex items-center gap-3">

          {user && !isAttendee && (
            <Link
              to="/dashboard"
              className="hidden rounded-full border border-[#c49424]/40 bg-white/20 px-5 py-2 text-xs font-medium uppercase tracking-widest text-[#9a721c] backdrop-blur-md transition-all duration-300 hover:border-[#c49424] hover:bg-[#c49424] hover:text-white hover:shadow-lg hover:shadow-[#c49424]/20 lg:block whitespace-nowrap"
            >
              Dashboard
            </Link>
          )}

          {isAttendee && <NotificationBell />}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-xl text-neutral-900 focus:outline-none lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      
      {menuOpen && (
        <div className="absolute inset-x-4 top-20 rounded-3xl border border-white/80 bg-white/30 p-6 shadow-[0_16px_48px_0_rgba(196,148,36,0.2)] backdrop-blur-3xl lg:hidden">
          <div className="flex flex-col gap-4 text-center">

            <button
              onClick={goHome}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
            >
              Home
            </button>

            <button
              onClick={() => {
                scrollToSection('about')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
            >
              About
            </button>

            <button
              onClick={() => {
                scrollToSection('expos')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
            >
              Services
            </button>

            <button
              onClick={() => {
                scrollToSection('gallery')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
            >
              Gallery
            </button>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
            >
              Contact
            </Link>

            <button
              onClick={() => {
                navigate('/book-now')
                setMenuOpen(false)
              }}
              className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
            >
              Book Now
            </button>

            <div className="flex flex-col gap-4 pt-2">

              {isAttendee && (
                <Link
                  to="/attendee/messages"
                  onClick={() => setMenuOpen(false)}
                  className="relative text-sm text-[#c49424] transition-opacity hover:opacity-75"
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49424] px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {isAttendee && (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
                >
                  Profile
                </Link>
              )}

              {isAttendee && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 text-sm text-[#c49424] transition-opacity hover:opacity-75"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}

              {isGuest && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-[#c49424] transition-opacity hover:opacity-75"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              
              {user && !isAttendee && (
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block w-full rounded-full border border-[#c49424] bg-white/30 py-3 text-xs font-medium uppercase tracking-widest text-[#9a721c] backdrop-blur-md transition hover:bg-[#c49424] hover:text-white"
                >
                  Dashboard
                </Link>
              )}

            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar