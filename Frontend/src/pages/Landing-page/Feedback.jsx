import { useState } from 'react'
import {
  MessageSquareText,
  UserRound,
  Mail,
  Star,
  Send,
} from 'lucide-react'

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '',
    feedback: '',
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

    console.log('Feedback:', formData)

    alert('Thank you! Your feedback has been submitted.')

    setFormData({
      name: '',
      email: '',
      rating: '',
      feedback: '',
    })
  }

  return (
    <main className="min-h-screen bg-[#fffdf9] px-6 pt-40 pb-24 lg:px-10">

      {/* Header */}
      <section className="mx-auto max-w-3xl text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
          <MessageSquareText className="h-8 w-8 text-[#c49424]" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
          Your Feedback Matters
        </p>

        <h1 className="mt-3 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
          Share Your <span className="text-[#c49424]">Feedback</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#5d574f]">
          We would love to hear about your experience with EventSphere.
          Your feedback helps us improve our platform and services.
        </p>

      </section>

      {/* Form */}
      <section className="mx-auto mt-12 max-w-3xl">

        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-6 shadow-xl sm:p-10">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                Your Name
              </label>

              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Rating */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#4d473f]">
                How was your experience?
              </label>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">

                {[1, 2, 3, 4, 5].map((number) => (
                  <label
                    key={number}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border py-3 transition ${
                      formData.rating === String(number)
                        ? 'border-[#c49424] bg-[#fff4d9]'
                        : 'border-[#e4d9c4] bg-[#fffdf9] hover:border-[#c49424]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={number}
                      checked={formData.rating === String(number)}
                      onChange={handleChange}
                      required
                      className="hidden"
                    />

                    <Star
                      className={`h-6 w-6 ${
                        formData.rating === String(number)
                          ? 'fill-[#c49424] text-[#c49424]'
                          : 'text-[#b48620]'
                      }`}
                    />

                    <span className="mt-1 text-xs text-[#5d574f]">
                      {number}
                    </span>
                  </label>
                ))}

              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                Your Feedback
              </label>

              <textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                rows="6"
                placeholder="Tell us about your experience..."
                required
                className="w-full resize-none rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49424] px-6 py-3.5 font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
            >
              Submit Feedback
              <Send className="h-4 w-4" />
            </button>

          </form>

        </div>

      </section>

    </main>
  )
}

export default Feedback