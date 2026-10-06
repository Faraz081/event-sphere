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
} from 'lucide-react'

import { fetchPublicExpos } from '@/api/publicService'
import fallbackImage from '../../assets/event-gallery/corporate-1.jpg'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3200'

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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLocaleLowerCase()
  const filteredExpos = normalizedSearch
    ? expos.filter((expo) =>
        (expo.exhibitors || []).some((companyName) =>
          companyName.toLocaleLowerCase().includes(normalizedSearch)
        )
      )
    : expos

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicExpos()
        setExpos(data.expos ?? [])
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not load events')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      {/* ================= HERO ================= */}

      <section className="mx-auto max-w-4xl text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
          <Radio className="h-8 w-8 text-[#c49424]" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Live & Ongoing Events
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Explore Our{' '}
          <span className="text-[#c49424]">
            Ongoing Events
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Discover events currently happening or coming soon.
          Choose an event and reserve your ticket today.
        </p>

      </section>


      {/* ================= EVENTS ================= */}

      <section className="mx-auto mt-16 max-w-7xl">

        <div className="mb-10 flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b48620]">
              Available Events
            </p>

            <h2 className="mt-2 font-serif text-3xl font-bold text-[#2f2a24]">
              Events You Can Attend
            </h2>
          </div>

          <div className="hidden rounded-full bg-[#fff4d9] px-4 py-2 text-sm font-semibold text-[#9a721c] sm:block">
            {expos.length} Events Available
          </div>

        </div>

        <form
          className="mb-8 flex w-full max-w-xl items-center gap-3 rounded-full border border-[#eadfc9] bg-white p-2 shadow-sm"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <Search className="ml-3 h-5 w-5 shrink-0 text-[#c49424]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by exhibitor or company"
            aria-label="Search ongoing expos by exhibitor or company"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#2f2a24] outline-none placeholder:text-[#8a8379]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear exhibitor search"
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

        {!loading && expos.length === 0 && (
          <p className="py-16 text-center text-[#5d574f]">
            No events are open right now. Please check back soon.
          </p>
        )}

        {!loading && expos.length > 0 && filteredExpos.length === 0 && (
          <p className="py-16 text-center text-[#5d574f]">
            No ongoing expos found for this exhibitor.
          </p>
        )}

        <div className="grid gap-7 md:grid-cols-2">

          {filteredExpos.map((expo) => {
            const badge = getBadge(expo.date)
            const time = formatTime(expo.date)

            return (
              <div
                key={expo._id}
                className="group overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Event Top */}

                <div className="relative h-56 overflow-hidden">

                  <img
                    src={getImage(expo.banner)}
                    alt={expo.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <span className={`absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-md ${badge.text}`}>
                    <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>

                </div>


                {/* Event Details */}

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


                  {/* Details */}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#c49424]" />
                      <div>
                        <p className="text-xs text-[#8a8379]">Date</p>
                        <p className="text-sm font-medium text-[#4d473f]">{formatDate(expo.date)}</p>
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
                        <p className="text-sm font-medium text-[#4d473f]">{expo.location}</p>
                      </div>
                    </div>

                    {expo.theme && (
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-[#c49424]" />
                        <div>
                          <p className="text-xs text-[#8a8379]">Theme</p>
                          <p className="text-sm font-medium text-[#4d473f]">{expo.theme}</p>
                        </div>
                      </div>
                    )}

                  </div>


                  {/* Book Ticket */}

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

      </section>


      {/* ================= BOTTOM ================= */}

      <section className="mx-auto mt-16 max-w-5xl">

        <div className="rounded-[2rem] bg-[#f8f5ef] px-7 py-12 text-center sm:px-12">

          <h2 className="font-serif text-3xl font-bold text-[#2f2a24]">
            Don't Miss Your Next Event
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#5d574f]">
            Reserve your place today and enjoy a well-organized
            event experience with EventSphere.
          </p>

        </div>

      </section>

    </main>
  )
}

export default OngoingEvents
