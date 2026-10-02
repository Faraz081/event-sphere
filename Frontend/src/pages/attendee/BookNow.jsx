import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Users,
  Sparkles,
  ClipboardList,
} from 'lucide-react'

export default function BookNow() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guests: '',
    location: '',
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

    console.log('Booking Details:', formData)

    alert('Your booking request has been submitted successfully!')

    setFormData({
      name: '',
      email: '',
      phone: '',
      eventType: '',
      eventDate: '',
      guests: '',
      location: '',
      message: '',
    })
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      {/* Header */}
      <section className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Event Booking
        </p>

        <h1 className="font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Plan Your <span className="text-[#c49424]">Event</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Tell us about your event and our team will help you plan and
          organize it successfully.
        </p>
      </section>

      {/* Booking Form */}
      <section className="mx-auto mt-14 max-w-5xl">
        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-6 shadow-xl sm:p-10">

          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6df]">
              <ClipboardList className="h-7 w-7 text-[#b48620]" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">
                Event Booking Form
              </h2>

              <p className="text-sm text-[#777067]">
                Fill in your event details below
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Information */}
            <div>
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#2f2a24]">
                <UserRound className="h-5 w-5 text-[#b48620]" />
                Personal Information
              </h3>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                      className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Event Information */}
            <div>
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#2f2a24]">
                <Sparkles className="h-5 w-5 text-[#b48620]" />
                Event Information
              </h3>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Event Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Event Type
                  </label>

                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                  >
                    <option value="">Select event type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Expo">Expo</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Event Date
                  </label>

                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Number of Guests
                  </label>

                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      placeholder="e.g. 100"
                      min="1"
                      required
                      className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                    Event Location
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                      required
                      className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                Additional Details
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us anything else about your event..."
                className="w-full resize-none rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-4 border-t border-[#eee5d5] pt-8 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-[#777067]">
                Our team will contact you after receiving your request.
              </p>

              <button
                type="submit"
                className="rounded-xl bg-[#b48620] px-8 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#967019] hover:shadow-lg"
              >
                Submit Booking
              </button>

            </div>

          </form>
        </div>
      </section>

      {/* Back */}
      <div className="mt-10 text-center">
        <Link
          to="/"
          className="text-sm font-semibold text-[#b48620] transition hover:text-[#8f6b18]"
        >
          ← Back to Home
        </Link>
      </div>

    </main>
  )
}