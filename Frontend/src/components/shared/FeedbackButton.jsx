import { Link, useLocation } from 'react-router-dom'
import { MessageSquareText } from 'lucide-react'

const FeedbackButton = () => {
  const { pathname } = useLocation()

  // Login, Signup aur Forgot Password pages par button hide rahega
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  ) {
    return null
  }

  return (
    <Link
      to="/feedback"
      style={{
        position: 'fixed',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 99999,
      }}
      className="group flex flex-col rounded-l-xl border gap-2 border-[#e5d8bd] bg-white px-0.5 py-3 text-[#5d574f] shadow-2xl transition-all duration-300 hover:bg-[#c49424] hover:text-white"
    >
      <MessageSquareText
        className=" rotate-90 h-6 w-6 text-[#c49424] transition-colors group-hover:text-white"
      />

      <span
        style={{
          writingMode: 'vertical-rl',
        }}
        className="font-semibold"
      >
        Feedback
      </span>
    </Link>
  )
}

export default FeedbackButton
