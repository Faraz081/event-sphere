import React from 'react'
import { Link } from 'react-router-dom'


import servicesImage from '../../assets/service-gallery/service.jpg'
import eventPlanningImage from '../../assets/service-gallery/event-planning.jpg'
import exhibitorManagementImage from '../../assets/service-gallery/exhibitor-management.jpg'
import birthday from '../../assets/service-gallery/birthday.jpg'
import mehndi from "../../assets/service-gallery/Mehndi.jpg";
import engaged from '../../assets/service-gallery/engaged.jpg'
import graduationevent from '../../assets/service-gallery/graduation-event.jpg'

import {
  ArrowUpRight,
  CalendarDays,
  Users,
  Clock3,
  UserRoundCheck,
  BarChart3,
  Radio,
  MessageCircle,
} from 'lucide-react'

const Service = () => {
  const services = [
{
    image: eventPlanningImage,
    title: 'Event Planning',
    description:
      'Plan and organize complete events with seamless venues, dates, activities and all important details in one place.',
  },
  {
    image: exhibitorManagementImage,
    title: 'Exhibitor Events',
    description:
      'Manage exhibitors, booth allocations, attendee registrations and overall participation details efficiently for every successful event.',
  },
  {
    image: birthday,
    title: 'Birthday Parties',
    description:
      'Create joyful birthday celebrations with custom theme management, entertainment schedules and fun activities for all guests.',
  },
  {
    image: mehndi,
    title: 'Mehndi Events',
    description:
      'Organize vibrant Mehndi ceremonies with colorful decor arrangements, traditional music setups and memorable guest experiences.',
  },
  {
    image: engaged,
    title: 'Engagement Events',
    description:
      'Plan elegant engagement functions with personalized rings ceremony setups, guest handling and special moment coordination.',
  },
  {
    image: graduationevent,
    title: 'Graduation Ceremony',
    description:
      'Host memorable graduation ceremonies with organized student registrations, stage scheduling and smooth stage announcements.',
  },
  {
    title: 'Feedback & Support',
    description:
      'Share your suggestions, ask questions and get helpful 24/7 support for an outstanding event experience.',
  },
]

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
              Powerful tools designed to make planning, managing and
              experiencing events easier.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {

              return (
<div
  key={index}
  className={`group rounded-3xl border border-[#eadfca] bg-white p-7 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl ${
    service.title === 'Feedback & Support'
      ? 'md:col-start-2'
      : ''
  }`}
>
                  {service.image && (
  <div className="mb-6 overflow-hidden rounded-2xl">
    <img
      src={service.image}
      alt={service.title}
      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
    />
  </div>
)}

                  <h3 className="mt-6 font-serif text-2xl font-bold text-neutral-900">
                    {service.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#5d574f]">
                    {service.description}
                  </p>

                    <Link
    to="/book-now"
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
  >
    Book Now
        <ArrowUpRight className="h-4 w-4" />
  </Link>

              {service.title === 'Feedback & Support' && (
  <button
    onClick={() => {
      window.location.href = '/feedback'
    }}
    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
  >
    Get in Touch
    <ArrowUpRight className="h-4 w-4" />
  </button>
)}

                </div>
              )
            })}
          </div>

        </section>

      </div>
    </main>
  )
}

export default Service