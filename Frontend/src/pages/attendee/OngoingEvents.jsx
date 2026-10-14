import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Radio,
  Search,
  X,
  ArrowUpRight,
} from 'lucide-react'

import api from '@/api/api'
import BookmarkButton, { useLoadBookmarks } from '@/components/shared/BookmarkButton'
import fallbackImage from '../../assets/event-gallery/corporate-1.jpg'

const OngoingEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useLoadBookmarks()

  const normalizedSearch = search.trim().toLocaleLowerCase()

  const filteredEvents = normalizedSearch
    ? events.filter((ev) => {
        const title = (ev.title || ev.name || '').toLocaleLowerCase()
        const company = (ev.companyName || ev.exhibitorName || '').toLocaleLowerCase()
        return (
          title.includes(normalizedSearch) ||
          company.includes(normalizedSearch)
        )
      })
    : events

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/public/events')
        const list = response.data?.events ?? response.data
        setEvents(Array.isArray(list) ? list : [])
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not load events')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalCount = filteredEvents.length

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      <section className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
          <Radio className="h-8 w-8 text-[#c49424]" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Live & Ongoing Events
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Explore Our{' '}
          <span className="text-[#c49424]">Ongoing Events</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Discover exhibitor events currently happening or coming soon.
          Choose one and reserve your spot today.
        </p>
      </section>

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
            placeholder="Search by title or exhibitor"
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

        {/* ---------- EVENTS ---------- */}
        {!loading && filteredEvents.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((ev) => (
              <div
                key={ev._id}
                className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={ev.images?.[0] || fallbackImage}
                    alt={ev.title ?? ev.name}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <BookmarkButton event={ev} className="absolute right-4 top-4" />
                </div>

                <div className="p-7 text-center">
                  <h3 className="font-serif text-2xl font-bold text-[#c49424]">
                    {ev.title ?? ev.name}
                  </h3>

                  {(ev.companyName || ev.exhibitorName) && (
                    <p className="mt-1 text-sm font-medium text-[#8d681b]">
                      by{' '}
                      {ev.exhibitor?._id ? (
                        <Link to={`/exhibitors/${ev.exhibitor._id}`} className="underline-offset-4 transition hover:text-[#c49424] hover:underline">
                          {ev.companyName ?? ev.exhibitorName}
                        </Link>
                      ) : (
                        ev.companyName ?? ev.exhibitorName
                      )}
                    </p>
                  )}

                  {ev.location && (
                    <p className="mt-2 text-sm text-[#8a8379]">📍 {ev.location}</p>
                  )}

                  <p className="mt-3 line-clamp-3 leading-6 text-[#5d574f]">
                    {ev.description}
                  </p>

                  <Link
                    to={`/book-now?event=${ev._id}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
                  >
                    Book Now
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
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