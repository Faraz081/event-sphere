import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Menu, Sparkles, X } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import { fetchUnreadCounts } from '@/store/slices/messageSlice';
import { clearNotifications } from '@/store/slices/notificationSlice';
import { clearBookmarks } from '@/store/slices/bookmarkSlice';
import NotificationBell from '@/components/shared/NotificationBell'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const settings = useSelector((state) => state.websiteSettings.settings)
  const { unread } = useSelector((state) => state.message)
  const isAttendee = user?.role === 'attendee'
  const isGuest = !user

  const navigate = useNavigate()
  const location = useLocation()
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
    if (!isAttendee) return

    dispatch(fetchUnreadCounts())

    const interval = setInterval(() => {
      dispatch(fetchUnreadCounts())
    }, 5000)

    return () => clearInterval(interval)
  }, [dispatch, isAttendee])

  const websiteName = settings?.websiteName?.trim() || ''
  const logo = settings?.logo?.trim() || ''

  const scrollToSection = (id) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goHome = () => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed inset-x-0 top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex h-16 sm:h-20 items-center justify-between rounded-full border border-white/80 bg-white/70 px-4 sm:px-6 shadow-[0_8px_32px_0_rgba(196,148,36,0.12)] backdrop-blur-2xl transition-all duration-300">
        <Link to="/" onClick={goHome} className="inline-flex min-w-0 shrink-0 items-center transition-transform duration-200 hover:scale-[1.03]">
          {logo ? (
            <img src={logo} alt={websiteName} className="h-12 sm:h-16 w-auto max-w-40 sm:max-w-55 rounded-xl object-contain drop-shadow-sm" />
          ) : (
            <Sparkles aria-hidden="true" className="h-7 w-7 text-[#c49424]" />
          )}
          {websiteName && (
            <span className="ml-2 max-w-40 truncate font-semibold text-[#2f2a24]">
              {websiteName}
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-8 xl:flex whitespace-nowrap">
          <button onClick={goHome} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            Home
          </button>

          <button onClick={() => scrollToSection('about')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            About
          </button>

          <button onClick={() => scrollToSection('expos')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            Expos
          </button>

          <button onClick={() => scrollToSection('events')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            Events
          </button>

          <button onClick={() => scrollToSection('gallery')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            Gallery
          </button>

          <Link to="/contact" className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            Contact
          </Link>

          <button onClick={() => navigate('/book-now')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
            Book Now
          </button>

          {isAttendee && (
            <Link to="/attendee/messages" className="relative text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Messages
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c49424] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {isAttendee && (
            <Link to="/profile" className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Profile
            </Link>
          )}

          {isAttendee && (
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              <LogOut size={16} />
              Logout
            </button>
          )}

          {isGuest && (
            <div className="flex items-center gap-3 pl-1">
              <Link to="/login" className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
                Login
              </Link>

              <Link to="/register" className="rounded-full bg-linear-to-r from-[#d4a73b] to-[#b48620] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:opacity-90 hover:shadow-md hover:shadow-[#c49424]/20">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && !isAttendee && (
            <Link to="/dashboard" className="hidden rounded-full border border-[#c49424]/40 bg-white/20 px-5 py-2 text-xs font-medium uppercase tracking-widest text-[#9a721c] backdrop-blur-md transition-all duration-300 hover:border-[#c49424] hover:bg-[#c49424] hover:text-white hover:shadow-lg hover:shadow-[#c49424]/20 lg:block whitespace-nowrap">
              Dashboard
            </Link>
          )}

          {isAttendee && <NotificationBell />}

          <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c49424]/20 bg-white/60 text-[#b48620] shadow-sm transition hover:bg-white xl:hidden" aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute inset-x-4 top-18 sm:top-24 rounded-3xl border border-white/80 bg-white/40 p-6 shadow-[0_16px_48px_0_rgba(196,148,36,0.2)] backdrop-blur-3xl xl:hidden">
          <div className="flex flex-col gap-8 text-center">
            <button onClick={goHome} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Home
            </button>

            <button onClick={() => scrollToSection('about')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              About
            </button>

            <button onClick={() => scrollToSection('expos')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Expos
            </button>

            <button onClick={() => scrollToSection('events')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Events
            </button>

            <button onClick={() => scrollToSection('gallery')} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Gallery
            </button>

            <Link to="/contact" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Contact
            </Link>

            <button onClick={() => { navigate('/book-now'); setMenuOpen(false); }} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
              Book Now
            </button>

            <div className="flex flex-col gap-4 pt-2">
              {isAttendee && (
                <Link to="/attendee/messages" onClick={() => setMenuOpen(false)} className="relative text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c49424] px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {isAttendee && (
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
                  Profile
                </Link>
              )}

              {isAttendee && (
                <button type="button" onClick={handleLogout} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
                  <LogOut size={16} />
                  Logout
                </button>
              )}

              {isGuest && (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-[#c49424] transition-opacity hover:opacity-75">
                    Login
                  </Link>

                  <Link to="/register" onClick={() => setMenuOpen(false)} className="inline-block rounded-full bg-linear-to-r from-[#d4a73b] to-[#b48620] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:opacity-95">
                    Sign Up
                  </Link>
                </div>
              )}

              {user && !isAttendee && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="inline-block w-full rounded-full border border-[#c49424] bg-white/30 py-3 text-xs font-medium uppercase tracking-widest text-[#9a721c] backdrop-blur-md transition hover:bg-[#c49424] hover:text-white">
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
