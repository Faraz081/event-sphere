import { useEffect, useState } from 'react'
import aboutPlatformImage from '../../assets/about-gallery/about-company.jpg'
import { Target, Eye, CalendarCheck, Users, Diamond, Headset } from 'lucide-react'
import api from '../../api/api'

export default function AboutPlatform() {
  const [settings, setSettings] = useState(null)

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
    aboutSettings.title || 'We Make Event Management Simple & Successful'

  const aboutDescription =
    aboutSettings.description ||
    'EventSphere is a modern event and expo management platform created to make event planning easier, smarter and more organized. Our platform brings all important event activities together in one convenient place.'

  const aboutImage =
    aboutSettings.image || aboutPlatformImage

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
  ]

  return (
    <main className="min-h-screen space-y-24 bg-[#fffdf9] px-6 pt-48 pb-24 lg:px-10">

      <section className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          <div className="group overflow-hidden rounded-[2rem] shadow-lg">
            <img
              src={aboutImage}
              alt="EventSphere event management platform"
              className="h-400px w-full object-cover transition duration-700 group-hover:scale-105"
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

            <p className="mt-4 leading-7 text-[#5d574f]">
              From managing exhibitors and attendees to organizing schedules,
              communication and event details, EventSphere helps organizers
              save time and manage every part of their event efficiently.
            </p>

            <p className="mt-4 leading-7 text-[#5d574f]">
              Whether you are arranging a corporate expo, wedding celebration
              or special gathering, EventSphere is designed to support you
              from planning to successful execution.
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

    </main>
  )
}