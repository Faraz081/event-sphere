import React, { useState, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react'

import heroImage from '../../assets/hero.jpg'
import weddingImage from '../../assets/wedding.jpg'
import corporateImage from '../../assets/corporate.jpg'
import birthdayImage from '../../assets/birthday.jpg'
import gallery1 from '../../assets/gallery-1.jpg'
import gallery2 from '../../assets/gallery-2.jpg'
import gallery3 from '../../assets/gallery-3.jpg'
import Footer from './Footer'


const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  
  const [openFaq, setOpenFaq] = useState(null)

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
    question: 'Is there a fee to create an organizer account?',
    answer:
      'Creating an organizer account is simple. Any applicable event or service charges depend on the selected services.',
  },
]

  const navClass = ({ isActive }) =>
    `text-sm transition-colors ${
      isActive
        ? 'font-semibold text-[#c49424]'
        : 'text-[#29251f] hover:text-[#c49424]'
    }`

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#29251f]">
   

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden pt-28">

        {/* Background Image */}
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[#f8f5ef]/80" />

        <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center px-6 lg:px-10">

          <div className="grid w-full items-center gap-12 lg:grid-cols-2">

            {/* Hero Content */}
            <div className="max-w-2xl">

              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
                Event Management Platform
              </p>

              <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Create
                <br />

                <span className="text-[#c49424]">
                  Unforgettable
                </span>

                <br />

                Events With Style
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-[#5d574f] sm:text-lg">
                Plan, manage and experience extraordinary events with
                EventSphere. From exhibitors and schedules to attendees
                and event analytics, everything is managed in one place.
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
                  Book Now
                </Link>

                <Link
                  to="/Dashboard"
                  className="rounded-full border border-[#c49424] px-7 py-3.5 text-sm font-semibold text-[#8d681b] transition hover:bg-white"
                >
                  Go to Dashboard
                </Link>

              </div>

            </div>


            {/* Hero Image Box */}
            <div className="relative flex justify-center lg:justify-end">

              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#c49424]/25 blur-2xl" />

              <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl">

                <img
                  src={heroImage}
                  alt="Elegant event venue"
                  className="h-[430px] w-full object-cover sm:h-[500px]"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="scroll-mt-24 bg-[#f8f5ef] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          {/* Text */}
          <div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              About EventSphere
            </p>

            <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Everything You Need
              <br />
              <span className="text-[#c49424]">
                For A Perfect Event
              </span>
            </h2>

            <p className="mt-6 leading-7 text-[#5d574f]">
              EventSphere is an event and expo management platform designed
              to make event planning simple, organized and efficient.
              Organizers can manage exhibitors, schedules, attendees,
              communication and event information from one place.
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


          {/* About Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-lg">

            <div className="grid grid-cols-2 gap-5">

              <div className="rounded-2xl bg-[#f8f5ef] p-6 text-center">
                <h3 className="font-serif text-4xl font-bold text-[#c49424]">
                  01
                </h3>
                <p className="mt-2 text-sm text-[#5d574f]">
                  Easy Management
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f5ef] p-6 text-center">
                <h3 className="font-serif text-4xl font-bold text-[#c49424]">
                  02
                </h3>
                <p className="mt-2 text-sm text-[#5d574f]">
                  Smart Scheduling
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f5ef] p-6 text-center">
                <h3 className="font-serif text-4xl font-bold text-[#c49424]">
                  03
                </h3>
                <p className="mt-2 text-sm text-[#5d574f]">
                  Exhibitor Support
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f5ef] p-6 text-center">
                <h3 className="font-serif text-4xl font-bold text-[#c49424]">
                  04
                </h3>
                <p className="mt-2 text-sm text-[#5d574f]">
                  Event Analytics
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section
        id="services"
        className="scroll-mt-24 bg-[#fffdf9] px-6 py-24 lg:px-10"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-14 text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              What We Do
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Our <span className="text-[#c49424]">Services</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[#5d574f]">
              From intimate celebrations to professional events, EventSphere
              provides tools to organize every important detail.
            </p>

          </div>


          <div className="grid gap-7 md:grid-cols-3">

            {/* Wedding */}
            <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="overflow-hidden">
                <img
                  src={weddingImage}
                  alt="Wedding event"
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                />

              </div>

              <div className="p-7 text-center">

                <h3 className="font-serif text-2xl font-bold text-[#c49424]">
                  Luxury Weddings
                </h3>

                <p className="mt-3 leading-6 text-[#5d574f]">
                  Elegant weddings with beautiful arrangements,
                  organized planning and memorable experiences.
                </p>

   <Link
    to="/book-now"
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
  >
    Book Now
        <ArrowUpRight className="h-4 w-4" />
  </Link>

              </div>

            </div>


            {/* Corporate */}
            <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="overflow-hidden">
                <img
                  src={corporateImage}
                  alt="Corporate event"
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-7 text-center">

                <h3 className="font-serif text-2xl font-bold text-[#c49424]">
                  Corporate Events
                </h3>

                <p className="mt-3 leading-6 text-[#5d574f]">
                  Professional conferences with seamless management, organized execution and impactful networking experiences.
                </p>

   <Link
    to="/book-now"
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
  >
    Book Now
        <ArrowUpRight className="h-4 w-4" />
  </Link>

              </div>

            </div>


            {/* Birthday */}
            <div className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">

              <div className="overflow-hidden">
                <img
                  src={birthdayImage}
                  alt="Birthday event"
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-7 text-center">

                <h3 className="font-serif text-2xl font-bold text-[#c49424]">
                  Birthday Parties
                </h3>

                <p className="mt-3 leading-6 text-[#5d574f]">
                  Creative celebrations with personalized styling, thematic planning and unforgettable special moments.
                </p>

    <Link
    to="/book-now"
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c49424] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#b48620] hover:shadow-lg"
  >
    Book Now
        <ArrowUpRight className="h-4 w-4" />
  </Link>

              </div>

            </div>

          </div>

          <div className="mt-10 text-center">
      <Link
        to="/service"
        className="rounded-full bg-[#c49424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
      >
        View All Services
      </Link>
    </div>

        </div>

      </section>

      {/* ================= GALLERY ================= */}
    <section
  id="gallery"
  className="scroll-mt-24 bg-[#fffdf9] px-6 py-24 lg:px-10"
>
  <div className="mx-auto max-w-7xl">

    {/* Gallery Heading */}
    <div className="mb-14 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
        Our Moments
      </p>

      <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
        Event <span className="text-[#c49424]">Gallery</span>
      </h2>
    </div>

    {/* Bento Gallery */}
    <div className="grid gap-5 md:grid-cols-4 md:grid-rows-2">

      {/* Large image */}
      <div className="group overflow-hidden rounded-3xl md:col-span-2 md:row-span-2">
        <img
          src={gallery1}
          alt="Event gallery"
          className="h-full min-h-[200px] w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Top right */}
      <div className="group overflow-hidden rounded-3xl md:col-span-2">
        <img
          src={gallery2}
          alt="Event gallery"
          className="h-[400px] w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Bottom right */}
      <div className="group overflow-hidden rounded-3xl md:col-span-2">
        <img
          src={gallery3}
          alt="Event gallery"
          className="h-[400px] w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </div>

    </div>

    {/* Explore More */}
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


   {/* ================= REVIEWS ================= */}

<section className="bg-[#f8f5ef] px-6 py-24 lg:px-10">

  <div className="mx-auto max-w-7xl">

    {/* Heading */}
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


    {/* Rating Summary */}
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


    {/* Reviews Carousel */}
    <div className="relative mt-10">

      {/* Review Cards */}
      <div
        id="reviews-container"
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >

        {/* Review 1 */}
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


        {/* Review 2 */}
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


        {/* Review 3 */}
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


        {/* Review 4 */}
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


        {/* Review 5 */}
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

        
        {/* Review 6 */}
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

        
        {/* Review 7 */}
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


        {/* Review 8 */}
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


      {/* Previous Arrow */}
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


      {/* Next Arrow */}
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


    {/* Contact Button */}
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



     {/* ================= FAQ + STATS ================= */}

<section className="bg-[#f8f5ef] px-6 py-20 lg:px-10">

  <div className="mx-auto max-w-5xl">

    {/* FAQ HEADER */}

    <div className="text-center">

      <h2 className="font-serif text-4xl font-semibold text-[#2f2a24] sm:text-5xl">
        Frequently Asked Questions
      </h2>

      <p className="mt-3 text-[#5d574f]">
        Everything you need to know before getting started.
      </p>

    </div>


    {/* FAQ LIST */}

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


{/* ================= STATISTICS ================= */}

<section className="bg-white px-6 py-20 lg:px-10">

  <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 text-center lg:grid-cols-4">

    {/* Stat 1 */}

    <div>
      <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
        140+
      </p>

      <p className="mt-2 text-sm text-[#5d574f]">
        Expos Hosted
      </p>
    </div>


    {/* Stat 2 */}

    <div>
      <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
        3,000+
      </p>

      <p className="mt-2 text-sm text-[#5d574f]">
        Exhibitors Onboarded
      </p>
    </div>


    {/* Stat 3 */}

    <div>
      <p className="font-serif text-4xl font-bold text-[#a8790d] sm:text-5xl">
        80K+
      </p>

      <p className="mt-2 text-sm text-[#5d574f]">
        Attendee Check-ins
      </p>
    </div>


    {/* Stat 4 */}

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