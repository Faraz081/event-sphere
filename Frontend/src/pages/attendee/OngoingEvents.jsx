import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Radio,
  Search,
  X,
  Building2,
} from 'lucide-react'

import { fetchPublicExpos, fetchPublicEvents } from '@/api/publicService'
import { API_BASE_URL } from '@/api/api'
import BookmarkButton, { useLoadBookmarks } from '@/components/shared/BookmarkButton'
import fallbackImage from '../../assets/event-gallery/corporate-1.jpg'

const BASE = API_BASE_URL

const getImage = (banner) => {
  if (!banner) return fallbackImage
  return banner.startsWith('http') ? banner : `${BASE}${banner}`
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

const OngoingEvents = () => {
  const [expos, setExpos] = useState([])
  const [approvedEvents, setApprovedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useLoadBookmarks()

  const normalizedSearch = search.trim().toLocaleLowerCase()

  const filteredExpos = normalizedSearch
    ? expos.filter((expo) =>
        (expo.exhibitors || []).some((companyName) =>
          companyName.toLocaleLowerCase().includes(normalizedSearch)
        ) ||
        (expo.title || '').toLocaleLowerCase().includes(normalizedSearch)
      )
    : expos

  const filteredEvents = normalizedSearch
    ? approvedEvents.filter((ev) => {
        const title = (ev.title || '').toLocaleLowerCase()
        const company = (ev.companyName || ev.exhibitorName || '').toLocaleLowerCase()
        const type = (ev.eventType || '').toLocaleLowerCase()
        return (
          title.includes(normalizedSearch) ||
          company.includes(normalizedSearch) ||
          type.includes(normalizedSearch)
        )
      })
    : approvedEvents

  useEffect(() => {
    const load = async () => {
      try {
        const [expoData, eventData] = await Promise.all([
          fetchPublicExpos(),
          fetchPublicEvents(),
        ])
        setExpos(expoData.expos ?? [])
        setApprovedEvents(eventData.events ?? [])
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not load events')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalCount = filteredExpos.length + filteredEvents.length

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      <section className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
          <Radio className="h-8 w-8 text-[#c49424]" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Live & Ongoing Expos
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Explore Our{' '}
          <span className="text-[#c49424]">Ongoing Expos</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Discover expos and exhibitor events currently happening or coming soon.
          Choose one and reserve your spot today.
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b48620]">
              Available Expos
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-[#2f2a24]">
              Expos You Can Attend
            </h2>
          </div>

          <div className="hidden rounded-full bg-[#fff4d9] px-4 py-2 text-sm font-semibold text-[#9a721c] sm:block">
            {totalCount} Available
          </div>
        </div>

        <form
          className="mb-8 flex w-full max-w-xl items-center gap-3 rounded-full border border-[#eadfc9] bg-white p-2 shadow-sm"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#c49424]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, exhibitor or company"
            aria-label="Search events"
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

        {loading && (
          <p className="py-16 text-center text-[#5d574f]">Loading events...</p>
        )}

        {!loading && totalCount === 0 && (
          <p className="py-16 text-center text-[#5d574f]">
            No events are open right now. Please check back soon.
          </p>
        )}

        {/* ---------- EXPOS ---------- */}
        {!loading && filteredExpos.length > 0 && (
          <>
            <h3 className="mb-5 font-serif text-xl font-bold text-[#2f2a24]">Expos</h3>
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
          </>
        )}

        {/* ---------- EXHIBITOR EVENTS (approved) ---------- */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-5 font-serif text-xl font-bold text-[#2f2a24]">
              Exhibitor Events
            </h3>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="flex flex-col rounded-[1.5rem] border border-[#eadfc9] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-[#fff4d9] px-3 py-1 text-xs font-semibold text-[#9a721c]">
                      {ev.eventType || 'Event'}
                    </span>
                    <BookmarkButton event={ev} className="border border-[#eadfc9]" />
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-bold text-[#2f2a24]">
                    {ev.title}
                  </h3>

                  <p className="mt-2 flex-1 line-clamp-3 text-sm leading-6 text-[#5d574f]">
                    {ev.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-[#4d473f]">
                    {ev.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#c49424]" />
                        {ev.location}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#c49424]" />
                      {ev.companyName || ev.exhibitorName || 'Exhibitor'}
                    </p>
                  </div>

                  <Link
                    to={`/book-now?event=${ev._id}`}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
                  >
                    Book Now
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="rounded-[2rem] bg-[#f8f5ef] px-7 py-12 text-center sm:px-12">
          <h2 className="font-serif text-3xl font-bold text-[#2f2a24]">
            Don't Miss Your Next Event
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#5d574f]">
            Reserve your place today and enjoy a well-organized event experience
            with EventSphere.
          </p>
        </div>
      </section>
    </main>
  )
}

export default OngoingEvents