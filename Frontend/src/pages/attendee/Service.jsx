import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import servicesImage from '../../assets/service-gallery/service.jpg'
import gallery1 from '../../assets/gallery-1.jpg'
import { API_BASE_URL } from '../../api/api'
import { fetchPublicExpos } from '@/api/publicService'
import BookmarkButton, { useLoadBookmarks } from '@/components/shared/BookmarkButton'

import { ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles, Search, X } from 'lucide-react'

const getImage = (banner) => {
  if (!banner) return gallery1
  return banner.startsWith('http') ? banner : `${API_BASE_URL}${banner}`
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const formatTime = (iso) => {
  const d = new Date(iso)
  if (d.getHours() === 0 && d.getMinutes() === 0) return null
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const getBadge = (iso) => {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) return { label: 'Live Today', text: 'text-green-600', dot: 'bg-green-500' }
  if (d > today) return { label: 'Upcoming', text: 'text-[#9a721c]', dot: 'bg-[#c49424]' }
  return { label: 'Ended', text: 'text-gray-500', dot: 'bg-gray-400' }
}

const Service = () => {
  const [expos, setExpos] = useState([])
  const [exposLoading, setExposLoading] = useState(true)
  const [search, setSearch] = useState('')

  useLoadBookmarks()

  const normalizedSearch = search.trim().toLocaleLowerCase()

  const filteredExpos = normalizedSearch
    ? expos.filter((expo) =>
        (expo.exhibitors || []).some((companyName) =>
          companyName.toLocaleLowerCase().includes(normalizedSearch)
        ) ||
        (expo.theme || '').toLocaleLowerCase().includes(normalizedSearch) ||
        (expo.title || '').toLocaleLowerCase().includes(normalizedSearch)
      )
    : expos

  useEffect(() => {
    const fetchExpos = async () => {
      try {
        const data = await fetchPublicExpos()
        setExpos(data.expos ?? [])
      } catch (error) {
        console.error('Failed to load expos:', error)
      } finally {
        setExposLoading(false)
      }
    }
    fetchExpos()
  }, [])

  return (
    <main className="min-h-screen bg-[#fffdf9] px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Hero Section */}
        <section className="pt-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
                What We Offer
              </p>

              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Everything You Need
                <span className="block text-[#c49424]">
                  To Manage Events
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#5d574f]">
                EventSphere brings event planning, exhibitor management,
                attendee coordination and event analytics together in one
                simple platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-[#c49424]/30 bg-[#c49424]/10 px-4 py-2 text-sm text-[#9a721c]">
                  Easy Management
                </span>

                <span className="rounded-full border border-[#c49424]/30 bg-[#c49424]/10 px-4 py-2 text-sm text-[#9a721c]">
                  Real-Time Updates
                </span>

                <span className="rounded-full border border-[#c49424]/30 bg-[#c49424]/10 px-4 py-2 text-sm text-[#9a721c]">
                  Smart Analytics
                </span>
              </div>
            </div>

            <div className="group overflow-hidden rounded-[2rem] shadow-xl">
              <img
                src={servicesImage}
                alt="Event management services"
                className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[450px]"
              />
            </div>

          </div>
        </section>

        {/* Services Section */}
        <section className="mt-24 pb-20">

          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Our Services
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Everything In{' '}
              <span className="text-[#c49424]">One Place</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[#5d574f]">
              From trade shows to large-scale expos, explore what is
              happening and book your spot.
            </p>
          </div>

          <form
            className="mx-auto mb-10 flex w-full max-w-xl items-center gap-3 rounded-full border border-[#eadfc9] bg-white p-2 shadow-sm"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-[#c49424]" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category, exhibitor or company"
              aria-label="Search expos"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#2f2a24] outline-none placeholder:text-[#8a8379]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="rounded-full p-2 text-[#8a8379] transition hover:bg-[#fff4d9] hover:text-[#9a721c]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </form>

          {exposLoading ? (
            <p className="text-center text-[#5d574f]">Loading expos...</p>
          ) : filteredExpos.length === 0 ? (
            <p className="text-center text-[#5d574f]">
              {normalizedSearch
                ? 'No expos match your search.'
                : 'No expos available right now. Please check back soon.'}
            </p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2">
              {filteredExpos.map((expo) => {
                const badge = getBadge(expo.date)
                const time = formatTime(expo.date)

                return (
                  <div
                    key={expo._id}
                    className="group overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getImage(expo.banner)}
                        alt={expo.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <BookmarkButton expo={expo} className="absolute left-5 top-5" />
                      <span
                        className={`absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-md ${badge.text}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <div className="p-7">
                      <span className="rounded-full bg-[#fff4d9] px-3 py-1 text-xs font-semibold text-[#9a721c]">
                        {expo.theme || 'Expo'}
                      </span>

                      <h3 className="mt-4 font-serif text-2xl font-bold text-[#2f2a24]">
                        {expo.title}
                      </h3>

                      <p className="mt-3 line-clamp-3 leading-7 text-[#5d574f]">
                        {expo.description}
                      </p>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-5 w-5 text-[#c49424]" />
                          <div>
                            <p className="text-xs text-[#8a8379]">Date</p>
                            <p className="text-sm font-medium text-[#4d473f]">
                              {formatDate(expo.date)}
                            </p>
                          </div>
                        </div>

                        {time && (
                          <div className="flex items-center gap-3">
                            <Clock3 className="h-5 w-5 text-[#c49424]" />
                            <div>
                              <p className="text-xs text-[#8a8379]">Time</p>
                              <p className="text-sm font-medium text-[#4d473f]">{time}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-[#c49424]" />
                          <div>
                            <p className="text-xs text-[#8a8379]">Location</p>
                            <p className="text-sm font-medium text-[#4d473f]">
                              {expo.location}
                            </p>
                          </div>
                        </div>

                        {expo.theme && (
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-[#c49424]" />
                            <div>
                              <p className="text-xs text-[#8a8379]">Theme</p>
                              <p className="text-sm font-medium text-[#4d473f]">
                                {expo.theme}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link
                          to={`/expos/${expo._id}`}
                          className="inline-flex flex-1 items-center justify-center rounded-full border border-[#c49424] px-6 py-3.5 text-sm font-semibold text-[#8d681b] transition hover:bg-[#fffdf9]"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/book-ticket?expo=${expo._id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#c49424] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
                        >
                          Book Ticket
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Feedback & Support */}
          <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-[#eadfca] bg-white p-7 text-center shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              Feedback & Support
            </h3>

            <p className="mt-3 leading-7 text-[#5d574f]">
              Share your suggestions, ask questions and get helpful 24/7
              support for an outstanding event experience.
            </p>

            <Link
              to="/feedback"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
            >
              Get in Touch
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

        </section>

      </div>
    </main>
  )
}

export default Service