import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Sparkles,
  Search,
  Store,
  Clock3,
  User,
  Mic2,
  ArrowLeft,
  ArrowUpRight,
  Building2,
} from 'lucide-react'

import {
  fetchPublicExpo,
  fetchPublicExhibitors,
  fetchPublicBooths,
  fetchPublicEvents,
} from '@/api/publicService'
import { API_BASE_URL } from '@/api/api'
import fallbackImage from '../../assets/event-gallery/corporate-1.jpg'

const BASE = API_BASE_URL

const fileUrl = (path) => (!path ? '' : path.startsWith('http') ? path : `${BASE}${path}`)

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const formatDay = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatDateTime = (iso) => `${formatDate(iso)}, ${formatTime(iso)}`

const TABS = ['Schedule', 'Exhibitors', 'Events', 'Floor Plan']

const boothStyles = {
  available: 'border-[#c49424] bg-[#fff4d9] text-[#8d681b]',
  reserved: 'border-green-300 bg-green-50 text-green-800',
  occupied: 'border-gray-300 bg-gray-100 text-gray-600',
}

const ExpoDetail = () => {
  const { id } = useParams()

  const [expo, setExpo] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [booths, setBooths] = useState([])
  const [events, setEvents] = useState([])
  const [exhibitors, setExhibitors] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('Schedule')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [expoData, boothData, eventData] = await Promise.all([
          fetchPublicExpo(id),
          fetchPublicBooths(id),
          fetchPublicEvents(),
        ])
        setExpo(expoData.expo)
        setSchedules(expoData.schedules ?? [])
        setBooths(boothData.booths ?? [])
        const now = new Date()
     setEvents(
  (eventData.events ?? []).filter((e) => {
    const expoId = String(e.expo?._id || e.expo || "")
    return expoId === String(id) && new Date(e.date) >= now
  })
)
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true)
        else toast.error(err.response?.data?.error || 'Could not load this expo')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // exhibitors: search ke saath, thora ruk kar request
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const q = search.trim()
        const data = await fetchPublicExhibitors(id, q ? { search: q } : {})
        setExhibitors(data.exhibitors ?? [])
      } catch (err) {
        if (err.response?.status !== 404 && err.response?.status !== 400) {
          toast.error(err.response?.data?.error || 'Could not load exhibitors')
        }
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [id, search])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 text-center text-[#5d574f]">
        Loading...
      </main>
    )
  }

  if (notFound || !expo) {
    return (
      <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#2f2a24]">Expo not found</h1>
        <p className="mt-3 text-[#5d574f]">This expo is not available right now.</p>
        <Link to="/ongoing-events" className="mt-6 inline-block rounded-full bg-[#c49424] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]">
          Back to Events
        </Link>
      </main>
    )
  }

  const scheduleByDay = schedules.reduce((acc, s) => {
    const key = new Date(s.startTime).toDateString()
    if (!acc[key]) acc[key] = { label: formatDay(s.startTime), items: [] }
    acc[key].items.push(s)
    return acc
  }, {})

  const availableCount = booths.filter((b) => b.status === 'available').length

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-36 pb-24 lg:px-10">
      <div className="mx-auto max-w-6xl">

        <Link to="/ongoing-events" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b48620] hover:text-[#8f6b18]">
          <ArrowLeft className="h-4 w-4" />
          All Events
        </Link>

        {/* ================= HEADER ================= */}
        <section className="overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-white shadow-sm">
          <div className="relative h-60 sm:h-72">
            <img
              src={fileUrl(expo.banner) || fallbackImage}
              alt={expo.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            {expo.theme && (
              <span className="absolute left-6 top-6 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#9a721c] shadow-md">
                {expo.theme}
              </span>
            )}
          </div>

          <div className="p-7 sm:p-10">
            <h1 className="font-serif text-3xl font-bold text-[#2f2a24] sm:text-4xl">{expo.title}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#5d574f]">{expo.description}</p>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#4d473f]">
              <span className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-[#c49424]" />{formatDate(expo.date)}</span>
              <span className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[#c49424]" />{expo.location}</span>
              {expo.theme && <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#c49424]" />{expo.theme}</span>}
            </div>

            <Link
              to={`/book-ticket?expo=${expo._id}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
            >
              Book Your Ticket
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ================= TABS ================= */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-[#eadfc9] pb-4">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === t ? 'bg-[#c49424] text-white' : 'bg-[#f8f5ef] text-[#5d574f] hover:bg-[#fff4d9]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <section className="mt-8">

          {/* ---------- SCHEDULE ---------- */}
          {tab === 'Schedule' && (
            <div className="space-y-8">
              {schedules.length === 0 && <p className="text-[#5d574f]">The schedule has not been published yet.</p>}

              {Object.values(scheduleByDay).map((day) => (
                <div key={day.label}>
                  <h2 className="mb-4 font-serif text-2xl font-bold text-[#2f2a24]">{day.label}</h2>
                  <div className="space-y-3">
                    {day.items.map((s) => (
                      <div key={s._id} className="flex flex-col gap-4 rounded-2xl border border-[#eadfc9] bg-white p-5 sm:flex-row sm:items-center">
                        <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#fff4d9] px-4 py-3 text-sm font-semibold text-[#9a721c] sm:w-44">
                          <Clock3 className="h-4 w-4" />
                          {formatTime(s.startTime)} – {formatTime(s.endTime)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[#2f2a24]">{s.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#5d574f]">
                            {s.speaker && <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-[#c49424]" />{s.speaker}</span>}
                            {s.topic && <span className="flex items-center gap-1.5"><Mic2 className="h-4 w-4 text-[#c49424]" />{s.topic}</span>}
                            {s.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#c49424]" />{s.location}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- EXHIBITORS ---------- */}
{tab === 'Exhibitors' && (
  <div>
    <div className="relative mb-6 max-w-md">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by company, product or keyword"
        className="w-full rounded-xl border border-[#e4d9c4] bg-white py-3.5 pl-12 pr-4 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
      />
    </div>

    {exhibitors.length === 0 && (
      <p className="text-[#5d574f]">
        {search.trim() ? 'No exhibitors match your search.' : 'No approved exhibitors yet for this expo.'}
      </p>
    )}

    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {exhibitors.map((ex) => (
        <div key={ex._id} className="rounded-2xl border border-[#eadfc9] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {ex.logo ? (
              <img src={fileUrl(ex.logo)} alt={ex.companyName} className="h-14 w-14 rounded-xl border border-[#eadfc9] object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff4d9] text-[#c49424]">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate font-serif text-lg font-bold text-[#2f2a24]">{ex.companyName}</h3>
              {ex.booth && (
                <p className="flex items-center gap-1.5 text-sm text-[#8d681b]">
                  <Store className="h-4 w-4" />
                  Booth {ex.booth.boothNumber}
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm font-medium text-[#4d473f]">{ex.productsServices}</p>
          {ex.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5d574f]">{ex.description}</p>}
          {ex.booth?.location && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[#8a8379]">
              <MapPin className="h-3.5 w-3.5" />
              {ex.booth.location}
            </p>
          )}

          <button
            onClick={() => navigate(`/attendee/messages?user=${ex.userId}`)}
            className="mt-4 rounded-lg bg-gold text-background px-4 py-2 text-sm font-medium"
          >
            Message Exhibitor
          </button>
        </div>
      ))}
    </div>
  </div>
)}

          {/* ---------- EVENTS ---------- */}
          {tab === 'Events' && (
            <div className="grid gap-5 md:grid-cols-2">
              {events.length === 0 && <p className="text-[#5d574f]">Exhibitors have not added upcoming events yet.</p>}

              {events.map((ev) => (
                <div key={ev._id} className="flex flex-col rounded-2xl border border-[#eadfc9] bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-[#2f2a24]">{ev.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#5d574f]">{ev.description}</p>
                  <div className="mt-4 space-y-1.5 text-sm text-[#4d473f]">
                    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#c49424]" />{formatDateTime(ev.date)}</p>
                    <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[#c49424]" />{ev.exhibitor?.companyName || ev.exhibitor?.name}</p>
                    {ev.booth?.boothNumber && (
                      <p className="flex items-center gap-2"><Store className="h-4 w-4 text-[#c49424]" />Booth {ev.booth.boothNumber}</p>
                    )}
                  </div>
                  <Link
                    to={`/book-ticket?expo=${id}`}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#c49424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
                  >
                    Request Ticket
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* ---------- FLOOR PLAN ---------- */}
          {tab === 'Floor Plan' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5d574f]">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-[#c49424] bg-[#fff4d9]" /> Available ({availableCount})</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-green-300 bg-green-50" /> Reserved</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-gray-300 bg-gray-100" /> Occupied</span>
              </div>

              {booths.length === 0 && <p className="text-[#5d574f]">The floor plan has not been published yet.</p>}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {booths.map((b) => (
                  <div key={b._id} className={`rounded-2xl border-2 p-4 ${boothStyles[b.status] ?? boothStyles.available}`}>
                    <p className="font-mono text-lg font-bold">{b.boothNumber}</p>
                    <p className="mt-1 text-xs capitalize">{b.status}{b.size ? ` · ${b.size}` : ''}</p>
                    <p className="mt-2 truncate text-xs font-medium">{b.companyName || (b.status === 'available' ? 'Open booth' : 'Taken')}</p>
                    {b.location && <p className="mt-1 truncate text-[11px] opacity-70">{b.location}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  )
}

export default ExpoDetail