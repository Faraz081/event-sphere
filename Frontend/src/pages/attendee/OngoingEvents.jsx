import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  ArrowUpRight,
  Radio,
} from 'lucide-react'

import businessExpo from '../../assets/event-gallery/corporate-1.jpg'
import weddingExpo from '../../assets/event-gallery/wedding-1.jpg'
import corporateEvent from '../../assets/event-gallery/corporate-2.jpg'
import creativeExpo from '../../assets/event-gallery/corporate-3.jpg'



const OngoingEvents = () => {
 const events = [
  {
    image: businessExpo,
    title: 'Business & Technology Expo 2026',
    category: 'Expo',
    date: '18 September 2026',
    time: '10:00 AM - 6:00 PM',
    location: 'Karachi Expo Centre',
    attendees: '500+ Attendees',
    description:
      'Explore innovative businesses, technology solutions and networking opportunities at our ongoing business expo.',
  },
  {
    image: weddingExpo,
    title: 'Wedding & Celebration Expo',
    category: 'Wedding',
    date: '20 September 2026',
    time: '4:00 PM - 10:00 PM',
    location: 'Pearl Continental, Karachi',
    attendees: '300+ Attendees',
    description:
      'Discover wedding ideas, decoration services, event planners and everything you need for your special celebration.',
  },
  {
    image: corporateEvent,
    title: 'Corporate Networking Event',
    category: 'Corporate',
    date: '22 September 2026',
    time: '5:00 PM - 9:00 PM',
    location: 'Marriott Hotel, Karachi',
    attendees: '200+ Attendees',
    description:
      'Connect with professionals, business leaders and organizations in an engaging corporate networking environment.',
  },
  {
    image: creativeExpo,
    title: 'Creative & Digital Exhibition',
    category: 'Exhibition',
    date: '25 September 2026',
    time: '11:00 AM - 7:00 PM',
    location: 'Arts Council, Karachi',
    attendees: '400+ Attendees',
    description:
      'Experience creativity, digital innovation, artwork and new ideas from talented creators and exhibitors.',
  },
]

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
            {events.length} Events Available
          </div>

        </div>


        <div className="grid gap-7 md:grid-cols-2">

          {events.map((event, index) => (

            <div
              key={index}
              className="group overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* Event Top */}

             <div className="relative h-56 overflow-hidden">

  <img
    src={event.image}
    alt={event.title}
    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
  />

  {/* Image Overlay */}

  <div className="absolute inset-0 bg-black/20" />

  {/* Live Badge */}

  <span className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-600 shadow-md">

    <span className="h-2 w-2 rounded-full bg-green-500" />

    Live Event

  </span>

</div>


              {/* Event Details */}

              <div className="p-7">

                <div className="flex items-center justify-between gap-3">

                  <span className="rounded-full bg-[#fff4d9] px-3 py-1 text-xs font-semibold text-[#9a721c]">
                    {event.category}
                  </span>

                </div>

                <h3 className="mt-4 font-serif text-2xl font-bold text-[#2f2a24]">
                  {event.title}
                </h3>

                <p className="mt-3 leading-7 text-[#5d574f]">
                  {event.description}
                </p>


                {/* Details */}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-[#c49424]" />

                    <div>
                      <p className="text-xs text-[#8a8379]">
                        Date
                      </p>

                      <p className="text-sm font-medium text-[#4d473f]">
                        {event.date}
                      </p>
                    </div>
                  </div>


                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-[#c49424]" />

                    <div>
                      <p className="text-xs text-[#8a8379]">
                        Time
                      </p>

                      <p className="text-sm font-medium text-[#4d473f]">
                        {event.time}
                      </p>
                    </div>
                  </div>


                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#c49424]" />

                    <div>
                      <p className="text-xs text-[#8a8379]">
                        Location
                      </p>

                      <p className="text-sm font-medium text-[#4d473f]">
                        {event.location}
                      </p>
                    </div>
                  </div>


                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#c49424]" />

                    <div>
                      <p className="text-xs text-[#8a8379]">
                        Expected
                      </p>

                      <p className="text-sm font-medium text-[#4d473f]">
                        {event.attendees}
                      </p>
                    </div>
                  </div>

                </div>


                {/* Book Ticket */}

                <Link
                  to="/book-ticket"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c49424] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
                >
                  Book Your Ticket
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

              </div>

            </div>

          ))}

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