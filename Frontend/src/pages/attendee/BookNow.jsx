import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CalendarDays, UserRound, Phone, Mail, MapPin, Users, Sparkles, ClipboardList } from 'lucide-react'
import api from '../../api/api'

const fieldCls = 'text-[#2f2a24] placeholder:text-[#a39b8d] [color-scheme:light] border border-[#e4d9c4] bg-[#fffdf9] outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20'
const inputCls = `w-full rounded-xl py-3.5 pl-12 pr-4 ${fieldCls}`

const todayStr = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const emptyForm = { name: '', phone: '', eventDate: '', guests: '', message: '' }

export default function BookNow() {
  // NOTE: agar tumhare authSlice mein user ka naam alag hai (state.auth.user), yahan adjust karna
  const user = useSelector((state) => state.auth.user)
  const isAttendee = user?.role === 'attendee'

  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState(searchParams.get('event') ?? '')
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [stalls, setStalls] = useState([])
  const [selectedStalls, setSelectedStalls] = useState([])
  const [stallsLoading, setStallsLoading] = useState(false)
  const [dateBooked, setDateBooked] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/api/public/events')
        const list = response.data?.events ?? response.data
        setEvents(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setEventsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // name aur phone account se prefill hote hain, lekin user badal sakta hai
  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || user.phone || '',
    }))
  }, [user])

  useEffect(() => {
    setSelectedStalls([])
    setDateBooked(false)

    if (!selectedEventId) {
      setStalls([])
      return
    }

    const loadStalls = async () => {
      setStallsLoading(true)
      try {
        const params = formData.eventDate ? { date: formData.eventDate } : {}
        const response = await api.get(`/api/public/events/${selectedEventId}/stalls`, { params })
        setStalls(response.data?.stalls ?? [])
        setDateBooked(!!response.data?.dateBooked)
      } catch (error) {
        setStalls([])
      } finally {
        setStallsLoading(false)
      }
    }
    loadStalls()
  }, [selectedEventId, formData.eventDate])

  const selectedEvent = events.find((ev) => ev._id === selectedEventId)
  const organizer = selectedEvent?.companyName ?? selectedEvent?.exhibitorName

  const handleEventChange = (e) => {
    const id = e.target.value
    setSelectedEventId(id)
    id ? setSearchParams({ event: id }) : setSearchParams({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleStall = (stallId) =>
    setSelectedStalls((prev) => (prev.includes(stallId) ? prev.filter((s) => s !== stallId) : [...prev, stallId]))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)

    if (!user) {
      setFeedback({ type: 'error', text: 'Please login to book an event.' })
      return
    }
    if (dateBooked) {
      setFeedback({ type: 'error', text: 'This event is already booked for that date. Please choose another date.' })
      return
    }
    if (stalls.length && !selectedStalls.length) {
      setFeedback({ type: 'error', text: 'Please select at least one stall.' })
      return
    }

    try {
      setSubmitting(true)
      const response = await api.post('/api/attendee-portal/book', {
        event: selectedEventId,
        eventDate: formData.eventDate,
        guests: Number(formData.guests),
        stalls: selectedStalls,
        name: formData.name,
        phone: formData.phone,
        message: formData.message,
      })
      setFeedback({ type: 'success', text: response.data?.msg || 'Booking request sent. You can track it from your profile.' })
      setFormData({ ...emptyForm, name: user?.name ?? '', phone: user?.phone ?? '' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.response?.data?.error || 'Could not send your booking request' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      <section className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">Event Booking</p>
        <h1 className="font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Book Your <span className="text-[#c49424]">Event</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Select an event, choose your date and the organizer will confirm your booking.
        </p>
      </section>

      <section className="mx-auto mt-14 max-w-5xl">
        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-6 shadow-xl sm:p-10">

          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6df]">
              <ClipboardList className="h-7 w-7 text-[#b48620]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">Event Booking Form</h2>
              <p className="text-sm text-[#777067]">Fill in your details below</p>
            </div>
          </div>

          {!user && (
            <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-[#eadfc9] bg-[#fff6df] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#5d574f]">Please login with your attendee account to book an event.</p>
              <Link to="/login" className="rounded-full bg-[#c49424] px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#a97d18]">
                Login
              </Link>
            </div>
          )}

          {user && !isAttendee && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Only attendee accounts can book events.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Event Information */}
            <div>
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#2f2a24]">
                <Sparkles className="h-5 w-5 text-[#b48620]" />
                Event Information
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Select Event</label>
                  <select
                    value={selectedEventId}
                    onChange={handleEventChange}
                    required
                    disabled={eventsLoading}
                    className={`w-full rounded-xl px-4 py-3.5 ${fieldCls}`}
                  >
                    <option value="">{eventsLoading ? 'Loading events...' : 'Select an event'}</option>
                    {events.map((ev) => (
                      <option key={ev._id} value={ev._id}>{ev.title ?? ev.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Event Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      min={todayStr()}
                      required
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {dateBooked && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  This event is already booked for that date. Please choose another date.
                </p>
              )}

              {selectedEvent && (
                <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-[#eadfc9] bg-[#fffdf9] p-4 sm:flex-row">
                  {selectedEvent.images?.[0] && (
                    <img src={selectedEvent.images[0]} alt="" className="h-32 w-full rounded-xl object-cover sm:w-48" />
                  )}
                  <div className="space-y-2 text-sm text-[#5d574f]">
                    <p className="font-serif text-xl font-bold text-[#c49424]">{selectedEvent.title ?? selectedEvent.name}</p>
                    {selectedEvent.eventType && <p className="font-semibold text-[#8d681b]">{selectedEvent.eventType}</p>}
                    {organizer && <p>Organized by <span className="font-semibold text-[#8d681b]">{organizer}</span></p>}
                    {selectedEvent.location && (
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#b48620]" />{selectedEvent.location}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedEventId && !dateBooked && (
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Select Stalls</label>

                  {!formData.eventDate ? (
                    <p className="text-sm text-[#8a8379]">Choose a date to see the stalls.</p>
                  ) : stallsLoading ? (
                    <p className="text-sm text-[#8a8379]">Loading stalls...</p>
                  ) : stalls.length === 0 ? (
                    <p className="text-sm text-[#8a8379]">This event has no stalls listed.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {stalls.map((s) => {
                        const checked = selectedStalls.includes(s._id)
                        return (
                          <label
                            key={s._id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm text-[#2f2a24] transition ${
                              checked ? 'border-[#c49424] bg-[#fff4d9]' : 'border-[#e4d9c4] bg-[#fffdf9] hover:border-[#c49424]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStall(s._id)}
                              className="mt-1 accent-[#c49424]"
                            />
                            <span>
                              <span className="block font-semibold">{s.name || `Stall ${s.stallNumber}`}</span>
                              <span className="block text-xs">#{s.stallNumber}{s.size ? ` · ${s.size}` : ''}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#2f2a24]">
                <UserRound className="h-5 w-5 text-[#b48620]" />
                Contact Information
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Full Name</label>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="email" value={user?.email ?? ''} readOnly placeholder="Login to see your email" className={`${inputCls} cursor-not-allowed bg-[#f6f1e6]`} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">Number of Guests</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="number" name="guests" value={formData.guests} onChange={handleChange} placeholder="e.g. 100" min="1" required className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4d473f]">Additional Details</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us anything else about your booking..."
                className={`w-full resize-none rounded-xl px-4 py-3.5 ${fieldCls}`}
              />
            </div>

            {feedback && (
              <p className={`rounded-xl p-3 text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {feedback.text}
              </p>
            )}

            <div className="flex flex-col gap-4 border-t border-[#eee5d5] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#777067]">The organizer will review your request and confirm it.</p>
              <button
                type="submit"
                disabled={submitting || !user || !isAttendee || dateBooked}
                className="rounded-xl bg-[#b48620] px-8 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#967019] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Submit Booking'}
              </button>
            </div>

          </form>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link to="/" className="text-sm font-semibold text-[#b48620] transition hover:text-[#8f6b18]">← Back to Home</Link>
      </div>

    </main>
  )
}