import { useState } from 'react'
import {
  Ticket,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Users,
  CreditCard,
  Send,
} from 'lucide-react'

const BookTicket = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event: '',
    date: '',
    tickets: '1',
    payment: '',
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

    console.log('Ticket Booking:', formData)

    alert('Your ticket booking request has been submitted successfully!')

    setFormData({
      name: '',
      email: '',
      phone: '',
      event: '',
      date: '',
      tickets: '1',
      payment: '',
    })
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      {/* ================= HEADER ================= */}

      <section className="mx-auto max-w-4xl text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
          <Ticket className="h-8 w-8 text-[#c49424]" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Event Tickets
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Book Your{' '}
          <span className="text-[#c49424]">
            Ticket
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          Select your event, provide your details and reserve your
          place with EventSphere.
        </p>

      </section>


      {/* ================= FORM ================= */}

      <section className="mx-auto mt-14 max-w-4xl">

        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-7 shadow-xl sm:p-10">

          <div className="mb-9">

            <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">
              Ticket Booking Form
            </h2>

            <p className="mt-2 text-sm text-[#777067]">
              Enter your information below to reserve your ticket.
            </p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Name + Email */}

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
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


              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
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

            </div>


            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
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


            {/* Event */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                Select Event
              </label>

              <select
                name="event"
                value={formData.event}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
              >

                <option value="">
                  Select an event
                </option>

                <option value="Business & Technology Expo 2026">
                  Business & Technology Expo 2026
                </option>

                <option value="Wedding & Celebration Expo">
                  Wedding & Celebration Expo
                </option>

                <option value="Corporate Networking Event">
                  Corporate Networking Event
                </option>

                <option value="Creative & Digital Exhibition">
                  Creative & Digital Exhibition
                </option>

              </select>
            </div>


            {/* Date + Tickets */}

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Event Date
                </label>

                <div className="relative">

                  <CalendarDays className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Number of Tickets
                </label>

                <div className="relative">

                  <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                  <input
                    type="number"
                    name="tickets"
                    value={formData.tickets}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                    className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                  />

                </div>

              </div>

            </div>


            {/* Payment */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                Payment Method
              </label>

              <div className="relative">

                <CreditCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <select
                  name="payment"
                  value={formData.payment}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                >

                  <option value="">
                    Select payment method
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Online Payment">
                    Online Payment
                  </option>

                </select>

              </div>

            </div>


            {/* Submit */}

            <div className="border-t border-[#eee5d5] pt-7">

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49424] px-6 py-4 font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
              >
                Confirm Ticket Booking
                <Send className="h-4 w-4" />
              </button>

              <p className="mt-4 text-center text-xs text-[#8a8379]">
                Your booking details will be reviewed by our event team.
              </p>

            </div>

          </form>

        </div>

      </section>

    </main>
  )
}

export default BookTicket