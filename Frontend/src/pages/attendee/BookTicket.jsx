import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  Ticket, UserRound, Mail, Phone, CalendarDays, MapPin, CheckCircle2, Send,
} from 'lucide-react'

import { fetchPublicExpos } from '@/api/publicService'
import { bookExpoTicket } from '@/api/attendeePortalService'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const inputClass =
  'w-full rounded-xl border border-[#e4d9c4] bg-[#f8f5ef] py-3.5 pl-12 pr-4 text-black outline-none'

const selectClass =
  'w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20 [&>option]:bg-white [&>option]:text-black'

const BookTicket = () => {
  const { user } = useSelector((state) => state.auth)
  const [searchParams] = useSearchParams()

  const [expos, setExpos] = useState([])
  const [expoId, setExpoId] = useState(searchParams.get('expo') ?? '')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [requested, setRequested] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const expoData = await fetchPublicExpos()
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        setExpos((expoData.expos ?? []).filter((e) => new Date(e.date) >= startOfToday))
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not load expos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectedExpo = expos.find((e) => e._id === expoId)
  const isAttendee = user?.role === 'attendee'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!expoId) {
      toast.error('Please select an expo')
      return
    }
    setSubmitting(true)
    try {
      await bookExpoTicket(expoId)
      setRequested(selectedExpo)
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
          Expo Tickets
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Book Your <span className="text-[#c49424]">Ticket</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Choose an expo and request your entry ticket. The organizer reviews
          your request and your entry pass is issued once it is approved.
        </p>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="mx-auto mt-14 max-w-4xl">
        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-7 shadow-xl sm:p-10">

          {/* Not logged in */}
          {!user && (
            <div className="py-6 text-center">
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">Please login to book a ticket</h2>
              <p className="mt-3 text-[#5d574f]">You need an attendee account to request a ticket.</p>
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
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">Attendee account required</h2>
              <p className="mt-3 text-[#5d574f]">Ticket booking is only available for attendee accounts.</p>
            </div>
          )}

          {/* Request sent */}
          {isAttendee && requested && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#c49424]" />
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#2f2a24]">Ticket Request Sent</h2>
              <p className="mt-2 text-[#5d574f]">
                Your request for <b>{requested?.title}</b> is waiting for approval from the organizer.
              </p>
              <p className="mt-2 text-sm text-[#8a8379]">
                Your entry pass will appear in My Bookings on your profile once it is approved.
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
                <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">Ticket Request Form</h2>
                <p className="mt-2 text-sm text-[#777067]">Your account details are used for the request.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

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
                    onChange={(e) => setExpoId(e.target.value)}
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
                  {!loading && expos.length === 0 && (
                    <p className="mt-2 text-sm text-[#8a8379]">No upcoming expos are open for booking right now.</p>
                  )}
                </div>

                {/* Selected expo details */}
                {selectedExpo && (
                  <div className="space-y-4 rounded-2xl bg-[#fffdf9] p-5">
                    {selectedExpo.description && (
                      <p className="text-sm leading-6 text-[#5d574f]">{selectedExpo.description}</p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-[#c49424]" />
                        <div>
                          <p className="text-xs text-[#8a8379]">When</p>
                          <p className="text-sm font-medium text-[#4d473f]">{formatDate(selectedExpo.date)}</p>
                        </div>
                      </div>
                      {selectedExpo.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-[#c49424]" />
                          <div>
                            <p className="text-xs text-[#8a8379]">Location</p>
                            <p className="text-sm font-medium text-[#4d473f]">{selectedExpo.location}</p>
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
                    disabled={submitting || !expoId}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49424] px-6 py-4 font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg disabled:opacity-60"
                  >
                    {submitting ? 'Sending request...' : 'Request Ticket'}
                    <Send className="h-4 w-4" />
                  </button>
                  <p className="mt-4 text-center text-xs text-[#8a8379]">
                    Your entry pass is issued after the organizer approves your request.
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