import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  Ticket,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Store,
  Building2,
  CheckCircle2,
  Send,
} from 'lucide-react'

import { fetchPublicExpos, fetchPublicEvents } from '@/api/publicService'
import { bookEvent } from '@/api/attendeePortalService'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })

const inputClass =
  'w-full rounded-xl border border-[#e4d9c4] bg-[#f8f5ef] py-3.5 pl-12 pr-4 text-black outline-none'

const selectClass =
  'w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20 [&>option]:bg-white [&>option]:text-black'

const companyOf = (event) => event?.exhibitor?.companyName || event?.exhibitor?.name || 'the exhibitor'

const BookTicket = () => {
  const { user } = useSelector((state) => state.auth)
  const [searchParams] = useSearchParams()

  const [expos, setExpos] = useState([])
  const [events, setEvents] = useState([])
  const [expoId, setExpoId] = useState(searchParams.get('expo') ?? '')
  const [eventId, setEventId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [requested, setRequested] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [expoData, eventData] = await Promise.all([fetchPublicExpos(), fetchPublicEvents()])
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        setExpos((expoData.expos ?? []).filter((e) => new Date(e.date) >= startOfToday))
        setEvents(eventData.events ?? [])
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not load events')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const eventsForExpo = events.filter((e) => e.expo?._id === expoId && new Date(e.date) >= now)
  const selectedEvent = eventsForExpo.find((e) => e._id === eventId)
  const isAttendee = user?.role === 'attendee'

  const handleExpoChange = (value) => {
    setExpoId(value)
    setEventId('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventId) {
      toast.error('Please select an event')
      return
    }
    setSubmitting(true)
    try {
      await bookEvent(eventId)
      setRequested(selectedEvent)
      toast.success('Ticket request sent')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send your request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      {/* ================= HEADER ================= */}

      <section className="mx-auto max-w-4xl text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
          <Ticket className="h-8 w-8 text-[#c49424]" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Event Tickets
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Book Your{' '}
          <span className="text-[#c49424]">
            Ticket
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Choose an expo and an exhibitor event. The exhibitor approves
          your request and your ticket is confirmed.
        </p>

      </section>


      {/* ================= CONTENT ================= */}

      <section className="mx-auto mt-14 max-w-4xl">

        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-7 shadow-xl sm:p-10">

          {/* Not logged in */}
          {!user && (
            <div className="py-6 text-center">
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">
                Please login to book a ticket
              </h2>
              <p className="mt-3 text-[#5d574f]">
                You need an attendee account to request a ticket.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/login" className="rounded-full bg-[#c49424] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]">
                  Login
                </Link>
                <Link to="/register" className="rounded-full border border-[#c49424] px-7 py-3 text-sm font-semibold text-[#8d681b] transition hover:bg-[#fffdf9]">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Logged in but not an attendee */}
          {user && !isAttendee && (
            <div className="py-6 text-center">
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">
                Attendee account required
              </h2>
              <p className="mt-3 text-[#5d574f]">
                Ticket booking is only available for attendee accounts.
              </p>
            </div>
          )}

          {/* Request sent */}
          {isAttendee && requested && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#c49424]" />
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#2f2a24]">
                Ticket Request Sent
              </h2>
              <p className="mt-2 text-[#5d574f]">
                Your request for <b>{requested.title}</b> is waiting for approval from <b>{companyOf(requested)}</b>.
              </p>
              <p className="mt-2 text-sm text-[#8a8379]">
                You will get your pass code once the exhibitor approves it. Check the status in My Bookings on your profile.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/profile" className="rounded-full bg-[#c49424] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]">
                  View My Bookings
                </Link>
                <Link to="/ongoing-events" className="rounded-full border border-[#c49424] px-7 py-3 text-sm font-semibold text-[#8d681b] transition hover:bg-[#fffdf9]">
                  Browse More Events
                </Link>
              </div>
            </div>
          )}

          {/* Booking form */}
          {isAttendee && !requested && (
            <>
              <div className="mb-9">
                <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">
                  Ticket Request Form
                </h2>
                <p className="mt-2 text-sm text-[#777067]">
                  Your account details are used for the request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name + Email */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4d473f]">Full Name</label>
                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                      <input type="text" value={user.name ?? ''} readOnly className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4d473f]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                      <input type="email" value={user.email ?? ''} readOnly className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="tel" value={user.phone ?? ''} readOnly className={inputClass} />
                  </div>
                </div>

                {/* Expo */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">Select Expo</label>
                  <select
                    value={expoId}
                    onChange={(e) => handleExpoChange(e.target.value)}
                    disabled={loading}
                    className={selectClass}
                  >
                    <option value="">{loading ? 'Loading expos...' : 'Select an expo'}</option>
                    {expos.map((expo) => (
                      <option key={expo._id} value={expo._id}>
                        {expo.title} — {formatDate(expo.date)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">Select Event</label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    disabled={!expoId || eventsForExpo.length === 0}
                    className={selectClass}
                  >
                    <option value="">
                      {!expoId ? 'Select an expo first' : eventsForExpo.length === 0 ? 'No events yet for this expo' : 'Select an event'}
                    </option>
                    {eventsForExpo.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title} — {companyOf(event)}
                      </option>
                    ))}
                  </select>
                  {expoId && eventsForExpo.length === 0 && !loading && (
                    <p className="mt-2 text-sm text-[#8a8379]">Exhibitors have not added upcoming events to this expo yet.</p>
                  )}
                </div>

                {/* Selected event details */}
                {selectedEvent && (
                  <div className="space-y-4 rounded-2xl bg-[#fffdf9] p-5">
                    <p className="text-sm leading-6 text-[#5d574f]">{selectedEvent.description}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-[#c49424]" />
                        <div>
                          <p className="text-xs text-[#8a8379]">When</p>
                          <p className="text-sm font-medium text-[#4d473f]">{formatDateTime(selectedEvent.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-[#c49424]" />
                        <div>
                          <p className="text-xs text-[#8a8379]">Exhibitor</p>
                          <p className="text-sm font-medium text-[#4d473f]">{companyOf(selectedEvent)}</p>
                        </div>
                      </div>
                      {selectedEvent.booth?.boothNumber && (
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-[#c49424]" />
                          <div>
                            <p className="text-xs text-[#8a8379]">Booth</p>
                            <p className="text-sm font-medium text-[#4d473f]">{selectedEvent.booth.boothNumber}</p>
                          </div>
                        </div>
                      )}
                      {selectedEvent.expo?.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-[#c49424]" />
                          <div>
                            <p className="text-xs text-[#8a8379]">Location</p>
                            <p className="text-sm font-medium text-[#4d473f]">{selectedEvent.expo.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="border-t border-[#eee5d5] pt-7">
                  <button
                    type="submit"
                    disabled={submitting || !eventId}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49424] px-6 py-4 font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg disabled:opacity-60"
                  >
                    {submitting ? 'Sending request...' : 'Request Ticket'}
                    <Send className="h-4 w-4" />
                  </button>

                  <p className="mt-4 text-center text-xs text-[#8a8379]">
                    Your ticket is confirmed after the exhibitor approves it.
                  </p>
                </div>

              </form>
            </>
          )}

        </div>

      </section>

    </main>
  )
}

export default BookTicket