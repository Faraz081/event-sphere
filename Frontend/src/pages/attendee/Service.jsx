import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import servicesImage from '../../assets/service-gallery/service.jpg'
import gallery1 from '../../assets/gallery-1.jpg'
import api from '../../api/api'
import BookmarkButton, { useLoadBookmarks } from '@/components/shared/BookmarkButton'

import { ArrowUpRight } from 'lucide-react'

const Service = () => {
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useLoadBookmarks()

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
              From intimate celebrations to professional events, explore what
              our exhibitors are offering and book your spot.
            </p>
          </div>

          {eventsLoading ? (
            <p className="text-center text-[#5d574f]">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-[#5d574f]">
              No events available right now. Please check back soon.
            </p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={ev.images?.[0] || gallery1}
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
                      <p className="mt-2 text-sm text-[#8a8379]">
                        📍 {ev.location}
                      </p>
                    )}

                    <p className="mt-3 leading-6 text-[#5d574f]">
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