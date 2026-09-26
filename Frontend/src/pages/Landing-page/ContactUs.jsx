import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  MessageCircle,
} from 'lucide-react'

const ContactUs = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log('Contact Form:', formData)

    alert('Your message has been submitted successfully!')

    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    })
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      {/* ================= HERO ================= */}

      <section className="mx-auto max-w-4xl text-center">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Get In Touch
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Let's Talk About Your{' '}
          <span className="text-[#c49424]">
            Event
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Have a question, event idea or need help with EventSphere?
          Send us a message and our team will get back to you.
        </p>

      </section>


      {/* ================= CONTACT INFO ================= */}

      <section className="mx-auto mt-14 max-w-7xl">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {/* Email */}
          <div className="rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d9]">
              <Mail className="h-6 w-6 text-[#c49424]" />
            </div>

            <h3 className="mt-5 font-serif text-xl font-bold text-[#2f2a24]">
              Email
            </h3>

            <p className="mt-2 text-sm text-[#5d574f]">
              info@eventsphere.com
            </p>

          </div>


          {/* Phone */}
          <div className="rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d9]">
              <Phone className="h-6 w-6 text-[#c49424]" />
            </div>

            <h3 className="mt-5 font-serif text-xl font-bold text-[#2f2a24]">
              Phone
            </h3>

            <p className="mt-2 text-sm text-[#5d574f]">
              +92 300 1234567
            </p>

          </div>


          {/* Location */}
          <div className="rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d9]">
              <MapPin className="h-6 w-6 text-[#c49424]" />
            </div>

            <h3 className="mt-5 font-serif text-xl font-bold text-[#2f2a24]">
              Location
            </h3>

            <p className="mt-2 text-sm text-[#5d574f]">
              Karachi, Pakistan
            </p>

          </div>


          {/* Hours */}
          <div className="rounded-3xl border border-[#eadfc9] bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d9]">
              <Clock3 className="h-6 w-6 text-[#c49424]" />
            </div>

            <h3 className="mt-5 font-serif text-xl font-bold text-[#2f2a24]">
              Working Hours
            </h3>

            <p className="mt-2 text-sm text-[#5d574f]">
              Mon - Fri, 9 AM - 6 PM
            </p>

          </div>

        </div>

      </section>


      {/* ================= FORM + MAP ================= */}

      <section className="mx-auto mt-16 max-w-7xl">

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Contact Form */}

          <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-7 shadow-xl sm:p-10">

            <div className="mb-8">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4d9]">
                <MessageCircle className="h-7 w-7 text-[#c49424]" />
              </div>

              <h2 className="mt-5 font-serif text-3xl font-bold text-[#2f2a24]">
                Send Us a Message
              </h2>

              <p className="mt-2 text-[#777067]">
                Fill out the form and we'll get back to you soon.
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>


              {/* Email + Phone */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    required
                    className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                  />
                </div>


                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone"
                    required
                    className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                  />
                </div>

              </div>


              {/* Subject */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  required
                  className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>


              {/* Message */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write your message..."
                  required
                  className="w-full resize-none rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>


              {/* Submit */}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49424] px-6 py-3.5 font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
              >
                Send Message
                <Send className="h-4 w-4" />
              </button>

            </form>

          </div>


          {/* Map */}

          <div className="overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-white shadow-xl">

            <div className="p-7 sm:p-10">

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
                Find Us
              </p>

              <h2 className="mt-3 font-serif text-3xl font-bold text-[#2f2a24]">
                Our Location
              </h2>

              <p className="mt-3 leading-7 text-[#5d574f]">
                Visit our EventSphere management office or contact
                us online for more information.
              </p>

            </div>


            <div className="h-[450px] w-full">

              <iframe
                title="EventSphere Location"
                src="https://www.google.com/maps?q=Karachi,Pakistan&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                allowFullScreen
              />

            </div>

          </div>

        </div>

      </section>


      {/* ================= BOTTOM CTA ================= */}

      <section className="mx-auto mt-16 max-w-7xl">

        <div className="rounded-[2rem] bg-[#c49424] px-7 py-14 text-center text-white shadow-xl sm:px-12">

          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            Ready To Plan Your Event?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/85">
            Tell us about your event and let EventSphere help
            you turn your idea into a successful experience.
          </p>

          <a
            href="/book-now"
            className="mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#9a721c] transition hover:bg-[#f8f5ef]"
          >
            Book Your Event
          </a>

        </div>

      </section>

    </main>
  )
}

export default ContactUs