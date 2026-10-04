import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  MessageSquareText,
  UserRound,
  Mail,
  Star,
  Send,
  Lightbulb,
  TriangleAlert,
  CheckCircle2,
} from 'lucide-react'

import { submitFeedback } from '@/api/feedbackService'

const TYPES = [
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
  { value: 'issue', label: 'Report an Issue', icon: TriangleAlert },
  { value: 'other', label: 'Other', icon: MessageSquareText },
]

const inputClass =
  'w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] py-3.5 pl-12 pr-4 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20'

const readOnlyClass =
  'w-full rounded-xl border border-[#e4d9c4] bg-[#f8f5ef] py-3.5 pl-12 pr-4 text-black outline-none'

const Feedback = () => {
  const { user } = useSelector((state) => state.auth)

  const [type, setType] = useState('suggestion')
  const [subject, setSubject] = useState('')
  const [rating, setRating] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (message.trim().length < 10) {
      toast.error('Please write at least 10 characters')
      return
    }

    setSubmitting(true)
    try {
      await submitFeedback({
        type,
        subject,
        message,
        rating: rating || undefined,
      })
      setSent(true)
      toast.success('Thank you for your feedback')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send your feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setType('suggestion')
    setSubject('')
    setRating('')
    setMessage('')
    setSent(false)
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
          Send us a suggestion or report an issue. Your feedback helps us
          improve the EventSphere platform.
        </p>

      </section>

      {/* Content */}
      <section className="mx-auto mt-12 max-w-3xl">

        <div className="rounded-[2rem] border border-[#eadfc9] bg-white p-6 shadow-xl sm:p-10">

          {/* Not logged in */}
          {!user && (
            <div className="py-6 text-center">
              <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">
                Please login to send feedback
              </h2>
              <p className="mt-3 text-[#5d574f]">
                You need an account so we can follow up on your feedback.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/login" className="rounded-full bg-[#c49424] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]">
                  Login
                </Link>
                <Link to="/register" className="rounded-full border border-[#c49424] px-7 py-3 text-sm font-semibold text-[#8d681b] transition hover:bg-[#fffdf9]">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Sent */}
          {user && sent && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#c49424]" />
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#2f2a24]">
                Thank You!
              </h2>
              <p className="mt-2 text-[#5d574f]">
                Your feedback has been sent to our team.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full bg-[#c49424] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a97d18]"
                >
                  Send Another
                </button>
                <Link to="/" className="rounded-full border border-[#c49424] px-7 py-3 text-sm font-semibold text-[#8d681b] transition hover:bg-[#fffdf9]">
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Form */}
          {user && !sent && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name + Email */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="text" value={user.name ?? ''} readOnly className={readOnlyClass} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />
                    <input type="email" value={user.email ?? ''} readOnly className={readOnlyClass} />
                  </div>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4d473f]">
                  What would you like to share?
                </label>

                <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                  {TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                        type === value
                          ? 'border-[#c49424] bg-[#fff4d9] text-[#8d681b]'
                          : 'border-[#e4d9c4] bg-[#fffdf9] text-[#5d574f] hover:border-[#c49424]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Subject <span className="font-normal text-[#8a8379]">(optional)</span>
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={120}
                  placeholder={type === 'issue' ? 'e.g. Booth page is not loading' : 'e.g. Add a map of the venue'}
                  className="w-full rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#4d473f]">
                  How was your experience? <span className="font-normal text-[#8a8379]">(optional)</span>
                </label>

                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setRating(rating === String(number) ? '' : String(number))}
                      className={`flex flex-col items-center justify-center rounded-xl border py-3 transition ${
                        rating === String(number)
                          ? 'border-[#c49424] bg-[#fff4d9]'
                          : 'border-[#e4d9c4] bg-[#fffdf9] hover:border-[#c49424]'
                      }`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating === String(number)
                            ? 'fill-[#c49424] text-[#c49424]'
                            : 'text-[#b48620]'
                        }`}
                      />
                      <span className="mt-1 text-xs text-[#5d574f]">{number}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4d473f]">
                  Your Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="6"
                  minLength={10}
                  maxLength={2000}
                  placeholder={type === 'issue' ? 'What went wrong? What were you trying to do?' : 'Tell us your idea or experience...'}
                  required
                  className="w-full resize-none rounded-xl border border-[#e4d9c4] bg-[#fffdf9] px-4 py-3.5 text-black outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
                <p className="mt-1 text-right text-xs text-[#8a8379]">{message.length}/2000</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c49424] px-6 py-3.5 font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Submit Feedback'}
                <Send className="h-4 w-4" />
              </button>

            </form>
          )}

        </div>

      </section>

    </main>
  )
}

export default Feedback