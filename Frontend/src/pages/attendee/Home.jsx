import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
} from 'lucide-react'

import gallery1 from '../../assets/gallery-1.jpg'
import gallery2 from '../../assets/gallery-2.jpg'
import gallery3 from '../../assets/gallery-3.jpg'
import api, { API_BASE_URL } from '../../api/api'
import { fetchPublicExpos } from '@/api/publicService'
import BookmarkButton from '@/components/shared/BookmarkButton'
import { useLoadBookmarks } from '@/hooks/useLoadBookmarks'
import websiteDefaults from '@/data/websiteDefaults'

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

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [websiteSettings, setWebsiteSettings] = useState(null)
  const [expos, setExpos] = useState([])
  const [exposLoading, setExposLoading] = useState(true)
  const [events, setEvents] = useState([])
const [eventsLoading, setEventsLoading] = useState(true)
  useLoadBookmarks()

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

  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        const response = await api.get('/api/website-settings')
        setWebsiteSettings(response.data?.settings || null)
      } catch (error) {
        console.error('Failed to load website settings:', error)
      }
    }

    fetchWebsiteSettings()
  }, [])

  const mainBannerImage =
    websiteSettings?.hero?.image?.trim() || websiteDefaults.hero.image
  const mainBannerTitle =
    websiteSettings?.hero?.title?.trim() || websiteDefaults.hero.title
  const mainBannerDescription =
    websiteSettings?.hero?.description?.trim() ||
    websiteDefaults.hero.description
  const mainBannerButtonText =
    websiteSettings?.hero?.buttonText?.trim() || websiteDefaults.hero.buttonText
  const tagline =
    websiteSettings?.tagline?.trim() || websiteDefaults.tagline
  const aboutTitle =
    websiteSettings?.about?.title?.trim() || websiteDefaults.about.title
  const aboutDescription =
    websiteSettings?.about?.description?.trim() ||
    websiteDefaults.about.description
  const aboutSectionImage =
    websiteSettings?.about?.image?.trim() || websiteDefaults.about.image

  const faqs = [
    {
      question: 'How do I register as an exhibitor?',
      answer:
        'You can register as an exhibitor by creating an account and submitting your exhibitor details through the EventSphere platform.',
    },
    {
      question: 'Can I attend multiple events with one account?',
      answer:
        'Yes. One EventSphere account can be used to register for and manage participation in multiple events.',
    },
    {
      question: 'How does booth selection work for exhibitors?',
      answer:
        'Exhibitors can view available booth information and select a suitable booth based on the event requirements and availability.',
    },
    {
      question: 'Is there a fee to create an exhibitor account?',
      answer:
        'Creating an exhibitor account is free. Any applicable event or service charges depend on the selected services.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#29251f]">

      
      <section className="relative min-h-screen overflow-hidden pt-28">

        
        <img
          src={mainBannerImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        
        <div className="absolute inset-0 bg-[#f8f5ef]/80" />

        <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center px-6 lg:px-10">

          <div className="grid w-full items-center gap-12 lg:grid-cols-2">

            
            <div className="max-w-2xl">

              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
                {tagline}
              </p>

              <h1 className="whitespace-pre-line font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {mainBannerTitle}
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-[#5d574f] sm:text-lg">
                {mainBannerDescription}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <Link
                  to="/ongoing-events"
                  className="rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
                >
                  Explore Events
                </Link>

                <Link
                  to="/book-now"
                  className="rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
                >
                  {mainBannerButtonText}
                </Link>

              </div>

            </div>

            
            <div className="relative flex justify-center lg:justify-end">

              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#c49424]/25 blur-2xl" />

              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl">

                <img
                  src={mainBannerImage}
                  alt="Elegant event venue"
                  className="h-full w-full object-cover"
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      <section
        id="about"
        className="scroll-mt-24 bg-[#f8f5ef] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          
          <div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              About EventSphere
            </p>

            <h2 className="font-serif whitespace-pre-line text-4xl font-bold leading-tight sm:text-5xl">
              {aboutTitle}
            </h2>

            <p className="mt-6 leading-7 text-[#5d574f]">
              {aboutDescription}
            </p>

            <p className="mt-4 leading-7 text-[#5d574f]">
              Whether it is a corporate expo, a wedding celebration or a
              special gathering, EventSphere helps bring every important
              part of an event together.
            </p>

            <Link
              to="/about-platform"
              className="mt-7 inline-block rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
            >
              Explore Platform
            </Link>

          </div>


          <div className="space-y-5">
            <div className="relative h-64 overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-lg sm:h-80">
              <img
                src={aboutSectionImage}
                alt="EventSphere event management"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-white p-5 shadow-lg sm:gap-5 sm:p-8">
              {[
                ["01", "Easy Management"],
                ["02", "Smart Scheduling"],
                ["03", "Exhibitor Support"],
                ["04", "Event Analytics"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-2xl bg-[#f8f5ef] p-4 text-center sm:p-6">
                  <h3 className="font-serif text-3xl font-bold text-[#c49424] sm:text-4xl">
                    {number}
                  </h3>
                  <p className="mt-2 text-xs text-[#5d574f] sm:text-sm">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      <section id="expos" className="scroll-mt-24 bg-[#fffdf9] px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">What We Do</p>
            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Our <span className="text-[#c49424]">Expos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#5d574f]">
              From trade shows to large-scale expos, explore what is happening and book your spot.
            </p>
          </div>

          {exposLoading ? (
            <p className="text-center text-[#5d574f]">Loading expos...</p>
          ) : expos.length === 0 ? (
            <p className="text-center text-[#5d574f]">No expos available right now. Please check back soon.</p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2">
              {expos.slice(0, 4).map((expo) => {
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

          <div className="mt-10 text-center">
            <Link to="/service" className="rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]">
              View All Expos
            </Link>
          </div>

        </div>
      </section>

<section id="events" className="scroll-mt-24 bg-[#f8f5ef] px-6 py-24 lg:px-10">
  <div className="mx-auto max-w-7xl">

    <div className="mb-14 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
        Live & Upcoming
      </p>
      <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
        Ongoing <span className="text-[#c49424]">Events</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-[#5d574f]">
        Discover exhibitor events currently happening or coming soon and reserve your spot.
      </p>
    </div>

    {eventsLoading ? (
      <p className="text-center text-[#5d574f]">Loading events...</p>
    ) : events.length === 0 ? (
      <p className="text-center text-[#5d574f]">
        No events are open right now. Please check back soon.
      </p>
    ) : (
      <div className="grid gap-7 md:grid-cols-3">
        {events.slice(0, 3).map((ev) => (
          <div
            key={ev._id}
            className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="relative overflow-hidden">
              <img
                src={getImage(ev.images?.[0])}
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
                    <Link
                      to={`/exhibitors/${ev.exhibitor._id}`}
                      className="underline-offset-4 transition hover:text-[#c49424] hover:underline"
                    >
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

    <div className="mt-10 text-center">
      <Link
        to="/ongoing-events"
        className="rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
      >
        View All Events
      </Link>
    </div>

  </div>
</section>

      
      <section
        id="gallery"
        className="scroll-mt-24 bg-[#fffdf9] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto max-w-7xl">

          
          <div className="mb-14 text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Our Moments
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Event <span className="text-[#c49424]">Gallery</span>
            </h2>

          </div>

          
          <div className="grid gap-5 md:grid-cols-4 md:grid-rows-2">

            
            <div className="group overflow-hidden rounded-3xl md:col-span-2 md:row-span-2">
              <img
                src={gallery1}
                alt="Event gallery"
                className="h-full min-h-[200px] w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
            </div>

            
            <div className="group overflow-hidden rounded-3xl md:col-span-2">
              <img
                src={gallery2}
                alt="Event gallery"
                className="h-[400px] w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
            </div>

            
            <div className="group overflow-hidden rounded-3xl md:col-span-2">
              <img
                src={gallery3}
                alt="Event gallery"
                className="h-[400px] w-full object-cover object-center transition duration-500 group-hover:scale-105"
              />
            </div>

          </div>

          
          <div className="mt-10 text-center">
            <Link
              to="/event-gallery"
              className="rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
            >
              Explore More
            </Link>
          </div>

        </div>

      </section>

      <section className="bg-[#f8f5ef] px-6 py-24 lg:px-10">

        <div className="mx-auto max-w-7xl">

          
          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Client Reviews
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
              What Our Clients Say
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[#5d574f]">
              Real experiences from clients who trusted EventSphere
              with their special events.
            </p>

          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">

            <div className="rounded-2xl border border-[#eadfc9] bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-xl">
                  👥
                </div>

                <div>
                  <p className="text-2xl font-bold text-[#2f2a24]">
                    6
                  </p>

                  <p className="text-sm text-[#777067]">
                    Customers Rated Us
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-2xl border border-[#eadfc9] bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-xl">
                  ⭐
                </div>

                <div>
                  <p className="text-2xl font-bold text-[#2f2a24]">
                    4.8/5
                  </p>

                  <p className="text-sm text-[#777067]">
                    Average Rating
                  </p>
                </div>

              </div>

            </div>

          </div>

          <div className="relative mt-10">

            <div
              id="reviews-container"
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >

              
              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Shahid Raza
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Wedding
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  EventSphere made our wedding management much easier.
                  The team handled everything professionally and kept
                  the entire event well organized.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 02 September 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Tahir Imam
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Corporate Event
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  The management team helped us organize our corporate
                  event smoothly. Everything was handled on time and
                  the overall experience was excellent.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 23 August 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Tareef Hussain
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Engagement
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ☆
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  They helped us manage our engagement event and made
                  the whole process simple. We really appreciated their
                  support and attention to detail.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 22 August 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Ayesha Khan
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Birthday Event
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  The team made our birthday celebration stress-free.
                  Everything was planned beautifully and the event
                  turned out better than we expected.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 18 August 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Hamza Ahmed
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Business Expo
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  EventSphere helped us manage our business expo
                  efficiently. The organization and communication
                  throughout the event were excellent.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 15 August 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Hamza Ahmed
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Business Expo
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  EventSphere helped us manage our business expo
                  efficiently. The organization and communication
                  throughout the event were excellent.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 15 August 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Hamza Ahmed
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Business Expo
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  EventSphere helped us manage our business expo
                  efficiently. The organization and communication
                  throughout the event were excellent.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 15 August 2026
                  </p>
                </div>

              </div>

              <div
                data-review-card
                className="min-w-[85%] rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-w-[48%] lg:min-w-[32%]"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d9] text-[#c49424]">
                    👤
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#2f2a24]">
                      Sana Malik
                    </h3>

                    <p className="text-sm text-[#8a8379]">
                      Mehndi Event
                    </p>
                  </div>

                </div>

                <div className="mt-5 text-[#c49424]">
                  ★ ★ ★ ★ ★
                </div>

                <p className="mt-4 leading-7 text-[#5d574f]">
                  We had a wonderful experience with EventSphere.
                  Their team managed every detail carefully and made
                  our mehndi event memorable.
                </p>

                <div className="mt-5 border-t border-[#eee5d5] pt-4">
                  <p className="text-xs text-[#8a8379]">
                    📅 10 August 2026
                  </p>
                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() => {
                const container = document.getElementById('reviews-container')

                if (container) {
                  const card = container.querySelector('[data-review-card]')

                  if (card) {
                    const cardWidth = card.offsetWidth + 24

                    if (container.scrollLeft <= 10) {
                      container.scrollTo({
                        left: container.scrollWidth,
                        behavior: 'smooth',
                      })
                    } else {
                      container.scrollBy({
                        left: -cardWidth,
                        behavior: 'smooth',
                      })
                    }
                  }
                }
              }}
              className="absolute -left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-[#c49424] shadow-lg transition duration-300 hover:bg-[#c49424] hover:text-white"
              aria-label="Previous review"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                const container = document.getElementById('reviews-container')

                if (container) {
                  const card = container.querySelector('[data-review-card]')

                  if (card) {
                    const cardWidth = card.offsetWidth + 24

                    if (
                      container.scrollLeft + container.clientWidth >=
                      container.scrollWidth - 10
                    ) {
                      container.scrollTo({
                        left: 0,
                        behavior: 'smooth',
                      })
                    } else {
                      container.scrollBy({
                        left: cardWidth,
                        behavior: 'smooth',
                      })
                    }
                  }
                }
              }}
              className="absolute -right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-[#c49424] shadow-lg transition duration-300 hover:bg-[#c49424] hover:text-white"
              aria-label="Next review"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

          </div>

          <div className="mt-12 text-center">

            <Link
              to="/contact"
              className="inline-block rounded-full bg-[#c49424] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
            >
              Contact Us
            </Link>

          </div>

        </div>

      </section>

      <section className="bg-[#f8f5ef] px-6 py-20 lg:px-10">

        <div className="mx-auto max-w-5xl">

          
          <div className="text-center">

            <h2 className="font-serif text-4xl font-semibold text-[#2f2a24] sm:text-5xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-[#5d574f]">
              Everything you need to know before getting started.
            </p>

          </div>

          <div className="mx-auto mt-12 max-w-4xl space-y-3">

            {faqs.map((faq, index) => (

              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#e4dccd] bg-white"
              >

                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-[#fffdf9]"
                >

                  <span className="font-medium text-[#2f2a24]">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#b48620] transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />

                </button>


                {openFaq === index && (

                  <div className="border-t border-[#eee5d5] px-6 py-4">

                    <p className="text-sm leading-6 text-[#6a6259]">
                      {faq.answer}
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      </section>

      <section className="bg-white px-6 py-20 lg:px-10">

        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 text-center lg:grid-cols-4">

          
          <div>
            <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
              140+
            </p>

            <p className="mt-2 text-sm text-[#5d574f]">
              Expos Hosted
            </p>
          </div>

          <div>
            <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
              3,000+
            </p>

            <p className="mt-2 text-sm text-[#5d574f]">
              Exhibitors Onboarded
            </p>
          </div>

          <div>
            <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
              80K+
            </p>

            <p className="mt-2 text-sm text-[#5d574f]">
              Attendee Check-ins
            </p>
          </div>

          <div>
            <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
              99%
            </p>

            <p className="mt-2 text-sm text-[#5d574f]">
              Uptime Reliability
            </p>
          </div>

        </div>

      </section>


    </div>
  )
}

export default Home