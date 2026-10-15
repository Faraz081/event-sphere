import weddingEventImage from '../../assets/event-gallery/wedding-1.jpg'
import corporateEventImage from '../../assets/event-gallery/corporate-1.jpg'
import birthdayEventImage from '../../assets/event-gallery/birthday-1.jpg'

import { useEffect, useState } from 'react'
import { Target, Eye, CalendarCheck, Users, Diamond, Headset, ChevronDown  } from 'lucide-react'
import api from '../../api/api'
import websiteDefaults from '@/data/websiteDefaults'

export default function AboutPlatform() {
  const [settings, setSettings] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        const response = await api.get('/api/website-settings')
        setSettings(response.data.settings)
      } catch (error) {
        console.error('Failed to load website settings:', error)
      }
    }

    fetchWebsiteSettings()
  }, [])

  const aboutSettings = settings?.about || {}

  const aboutTitle =
    aboutSettings.title?.trim() || websiteDefaults.about.title

  const aboutDescription =
    aboutSettings.description?.trim() ||
    websiteDefaults.about.description

  const aboutImage =
    aboutSettings.image?.trim() || websiteDefaults.about.image

  const teamMembers = [
    {
      name: 'Deepak Kumar',
      role: 'Founder & Manager',
      description:
        'I am the Founder & Manager at EventSphere. We are always here for providing man power services in all types of events.',
    },
    {
      name: 'Shahid Raza',
      role: 'Online Booking Manager',
      description:
        'I am an Online Booking Manager at EventSphere, I solve the problems of our clients related to bookings.',
    },
    {
      name: 'Rohit Raj',
      role: 'Creative Manager',
      description:
        'I am a creative manager at EventSphere, where I lead talented design teams and translate brand visions into immersive event experiences that captivate thousands of attendees.',
    },
    
    {
      name: 'Member Four',
      role: 'Event Coordinator',
      description:
        'Responsible for coordinating event activities and ensuring smooth communication between the team and clients.',
    },
    {
      name: 'Member Five',
      role: 'Operations Manager',
      description:
        'Oversees event operations, manages resources and helps ensure every event runs smoothly.',
    },

  ]

  return (
    <main className="min-h-screen space-y-24 bg-[#fffdf9] px-6 pt-48 pb-24 lg:px-10">

      <section className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          <div className="group h-72 overflow-hidden rounded-[2rem] bg-[#f8f5ef] shadow-lg sm:h-96">
            <img
              src={aboutImage}
              alt="EventSphere event management platform"        
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"

            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Who We Are
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#2f2a24] sm:text-5xl">
              {aboutTitle}
            </h1>

            <p className="mt-6 leading-7 text-[#5d574f]">
              {aboutDescription}
            </p>

          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl pt-12 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">

          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-[#f0eae1] text-center hover:shadow-md transition duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf8ed]">
              <Target className="h-8 w-8 text-[#c49424]" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#2f2a24] mb-4">
              Our Mission
            </h3>

            <p className="text-[#5d574f] leading-relaxed max-w-md mx-auto">
              To deliver exceptional event management services through
              creativity, innovation, professionalism, and customer
              satisfaction while making every celebration unforgettable.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-[#f0eae1] text-center hover:shadow-md transition duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdf8ed]">
              <Eye className="h-8 w-8 text-[#c49424]" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#2f2a24] mb-4">
              Our Vision
            </h3>

            <p className="text-[#5d574f] leading-relaxed max-w-md mx-auto">
              To become India's most trusted event management company by
              creating memorable experiences and setting new standards of
              excellence in the event industry.
            </p>
          </div>

        </div>
      </section>

      <section className="mb-20">
        <div className="text-center mb-12">

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2f2a24]">
            Why Choose <span className="text-[#c49424]">EventSphere?</span>
          </h2>

          <p className="mt-3 text-[#5d574f] max-w-2xl mx-auto">
            We believe every event deserves perfection, creativity and
            professional execution.
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#f0eae1] hover:shadow-md transition duration-300">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf8ed]">
              <CalendarCheck className="h-7 w-7 text-[#c49424]" />
            </div>

            <h4 className="font-serif text-xl font-bold text-[#2f2a24] mb-3">
              Professional Planning
            </h4>

            <p className="text-sm text-[#5d574f] leading-relaxed">
              Every event is carefully planned from start to finish with
              complete attention to detail.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#f0eae1] hover:shadow-md transition duration-300">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf8ed]">
              <Users className="h-7 w-7 text-[#c49424]" />
            </div>

            <h4 className="font-serif text-xl font-bold text-[#2f2a24] mb-3">
              Experienced Team
            </h4>

            <p className="text-sm text-[#5d574f] leading-relaxed">
              Skilled professionals ensure smooth coordination throughout your
              event.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#f0eae1] hover:shadow-md transition duration-300">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf8ed]">
              <Diamond className="h-7 w-7 text-[#c49424]" />
            </div>

            <h4 className="font-serif text-xl font-bold text-[#2f2a24] mb-3">
              Premium Quality
            </h4>

            <p className="text-sm text-[#5d574f] leading-relaxed">
              Elegant decoration, quality service and unforgettable
              experiences.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#f0eae1] hover:shadow-md transition duration-300">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf8ed]">
              <Headset className="h-7 w-7 text-[#c49424]" />
            </div>

            <h4 className="font-serif text-xl font-bold text-[#2f2a24] mb-3">
              24×7 Support
            </h4>

            <p className="text-sm text-[#5d574f] leading-relaxed">
              We remain available whenever you need assistance before or after
              booking.
            </p>
          </div>

        </div>
      </section>


      
      {/* Trusted Partners Section */}
      <section className="mx-auto max-w-7xl w-full py-12">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
            Our Network
          </p>

          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-[#2f2a24]">
            Our Trusted <span className="text-[#c49424]">Partners</span>
          </h2>

          <p className="mt-4 mx-auto max-w-2xl leading-7 text-[#5d574f]">
            Great events happen through great teamwork. We aim to build
            lasting relationships with event venues, creative teams and
            service providers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { name: 'EVENT WORKS', subtitle: 'Event Services' },
            { name: 'PRIME VENUES', subtitle: 'Event Venues' },
            { name: 'CREATIVE CO.', subtitle: 'Design & Decor' },
            { name: 'ELITE EVENTS', subtitle: 'Event Production' },
            { name: 'PRO CONNECT', subtitle: 'Business Network' },
          ].map((partner) => (
            <div
              key={partner.name}
              className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-[#f0eae1] bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#c49424]/40 bg-[#fdf8ed] font-serif text-lg font-bold text-[#c49424]">
                {partner.name.charAt(0)}
              </div>

              <h3 className="font-serif text-sm font-bold tracking-wide text-[#2f2a24]">
                {partner.name}
              </h3>

              <p className="mt-1 text-xs text-[#8a8175]">
                {partner.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Memorable Events Section */}
      <section className="mx-auto max-w-7xl w-full py-12">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Moments That Matter
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#2f2a24] sm:text-4xl">
              Our Memorable <span className="text-[#c49424]">Events</span>
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-[#5d574f]">
              From professional gatherings to beautiful celebrations,
              every event is an opportunity to create meaningful memories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              image: corporateEventImage,
              category: 'Corporate & Business',
              title: 'Business Networking Experiences',
              description:
                'Professional gatherings designed to bring people together, encourage collaboration and create new opportunities.',
            },
            {
              image: weddingEventImage,
              category: 'Weddings & Celebrations',
              title: 'Beautiful Wedding Celebrations',
              description:
                'Thoughtfully planned celebrations where elegant details and special moments come together.',
            },
            {
              image: birthdayEventImage,
              category: 'Private Celebrations',
              title: 'Joyful Birthday Events',
              description:
                'Colorful celebrations filled with thoughtful details, joyful moments and memorable experiences.',
            },
          ].map((event) => (
            <article
              key={event.title}
              className="group overflow-hidden rounded-3xl border border-[#f0eae1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  loading="lazy"
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b48620]">
                  {event.category}
                </p>

                <h3 className="mt-3 font-serif text-xl font-bold text-[#2f2a24]">
                  {event.title}
                </h3>

                <p className="mt-3 leading-7 text-[#5d574f]">
                  {event.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] bg-[#2f2a24] px-7 py-10 text-center sm:px-12 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#e2bd69]">
            Your Next Event Starts Here
          </p>

          <h3 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold text-white sm:text-4xl">
            Let’s Create Something Memorable Together
          </h3>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Bring your ideas to EventSphere and take the next step toward
            a well-organized, unforgettable event.
          </p>

          <a
            href="/book-now"
            className="mt-7 inline-flex rounded-full bg-[#c49424] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
          >
            Plan Your Event
          </a>
        </div>
      </section>


      <section className="mx-auto max-w-7xl pt-12">
        <div className="text-center mb-16 space-y-3">

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2f2a24]">
            Our Administrative <span className="text-[#c49424]">Team</span>
          </h2>

          <p className="text-[#5d574f] max-w-2xl mx-auto leading-relaxed">
            Our experienced professionals work together to make every event memorable and successful.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 text-center shadow-sm border border-[#f0eae1] hover:shadow-md transition duration-300 flex flex-col items-center"
            >

              <div className="w-36 h-36 rounded-full border-2 border-[#c49424] flex items-center justify-center mb-6 overflow-hidden bg-[#fdf8ed]">
                <Users className="w-16 h-16 text-[#c49424]" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2f2a24] mb-2">
                {member.name}
              </h3>

              <p className="text-sm font-semibold text-[#c49424] mb-4">
                {member.role}
              </p>

              <p className="text-sm text-[#5d574f] leading-relaxed">
                {member.description}
              </p>

            </div>
          ))}

        </div>
      </section>

      
      {/* FAQ SECTION */}
      <section className="bg-[#f8f5ef] px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Need Help?
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold text-[#2f2a24] sm:text-5xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-[#5d574f]">
              Everything you need to know about EventSphere.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl space-y-3">
            {[
              {
                question: 'What is EventSphere?',
                answer:
                  'EventSphere is an event and expo management platform designed to help event teams manage planning, exhibitors, attendees and event details in one place.',
              },
              {
                question: 'What types of events can I manage?',
                answer:
                  'You can use EventSphere for business expos, corporate networking events, weddings, celebrations and other special gatherings.',
              },
              {
                question: 'How can I book an event?',
                answer:
                  'Visit our Book Now page, enter your event details and submit the form to get started.',
              },
              {
                question: 'How do exhibitors participate in expos?',
                answer:
                  'Exhibitors can explore event opportunities and, when the relevant features are available, register their company and manage their participation.',
              },
              {
                question: 'How can I contact EventSphere?',
                answer:
                  'Visit our Contact page to send us your questions or request assistance with your event.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#e4dccd] bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-[#fffdf9]"
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

      {/* STATS SECTION */}
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

    </main>
  )
}