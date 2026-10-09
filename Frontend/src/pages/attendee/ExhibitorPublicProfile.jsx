import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { ArrowLeft, ArrowUpRight, MessageSquare } from 'lucide-react'
import gallery1 from '../../assets/gallery-1.jpg'
import { fetchPublicExhibitorProfile } from '../../api/publicService'

const ExhibitorPublicProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [exhibitor, setExhibitor] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchPublicExhibitorProfile(id)
        setExhibitor(data.exhibitor)
        setEvents(data.events ?? [])
      } catch (err) {
        setError(err.response?.status === 404 ? 'Exhibitor not found.' : 'Failed to load exhibitor profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const showMessageButton = !user || user.role === 'attendee'

  const handleMessage = () => {
    if (!user) {
      toast.info('Please login to message this exhibitor')
      navigate('/login')
      return
    }
    navigate(`/attendee/messages?user=${exhibitor._id}`)
  }

  if (loading) return <main className="min-h-screen bg-[#fffdf9] px-4 py-24 text-center text-[#5d574f]">Loading...</main>

  if (error || !exhibitor) {
    return (
      <main className="min-h-screen bg-[#fffdf9] px-4 py-24 text-center">
        <p className="text-[#5d574f]">{error || 'Exhibitor not found.'}</p>
        <Link to="/service" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c49424] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>
      </main>
    )
  }

  const products = (exhibitor.productsServices ?? '').split(/[,\n]/).map((p) => p.trim()).filter(Boolean)

  return (
    <main className="min-h-screen bg-[#fffdf9] px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <Link to="/service" className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a721c] hover:text-[#c49424]">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Company header */}
        <section className="relative mt-6 rounded-[2rem] border border-[#eadfca] bg-white p-8 shadow-sm sm:p-10">

          {showMessageButton && (
            <button
              onClick={handleMessage}
              title="Message this exhibitor"
              aria-label="Message this exhibitor"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#c49424] text-white shadow-md transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {exhibitor.logo ? (
              <img src={exhibitor.logo} alt={exhibitor.companyName} className="h-28 w-28 rounded-2xl border border-[#eadfca] object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#c49424]/10 font-serif text-5xl font-bold text-[#c49424]">
                {exhibitor.companyName?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">Exhibitor</p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-neutral-900 sm:text-4xl">{exhibitor.companyName}</h1>
              {exhibitor.description && <p className="mt-3 max-w-2xl leading-7 text-[#5d574f]">{exhibitor.description}</p>}
            </div>
          </div>

          {products.length > 0 && (
            <div className="mt-8 border-t border-[#eadfca] pt-6">
              <h2 className="font-serif text-xl font-bold text-neutral-900">Products & Services</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {products.map((p) => (
                  <span key={p} className="rounded-full border border-[#c49424]/30 bg-[#c49424]/10 px-4 py-2 text-sm text-[#9a721c]">{p}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Events */}
        <section className="mt-16">
          <h2 className="font-serif text-3xl font-bold text-neutral-900">
            Events by <span className="text-[#c49424]">{exhibitor.companyName}</span>
          </h2>

          {events.length === 0 ? (
            <p className="mt-6 text-[#5d574f]">No events available right now.</p>
          ) : (
            <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <div key={ev._id} className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="overflow-hidden">
                    <img src={ev.images?.[0] || gallery1} alt={ev.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>

                  <div className="p-7 text-center">
                    <h3 className="font-serif text-2xl font-bold text-[#c49424]">{ev.title}</h3>
                    {ev.location && <p className="mt-2 text-sm text-[#8a8379]">📍 {ev.location}</p>}
                    <p className="mt-3 leading-6 text-[#5d574f]">{ev.description}</p>

                    <Link
                      to={`/book-now?event=${ev._id}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
                    >
                      Book Now <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}

export default ExhibitorPublicProfile