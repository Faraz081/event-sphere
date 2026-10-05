import { ArrowUp } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const ScrollTopButton = () => {
  const { pathname } = useLocation()

  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  ) {
    return null
  }


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        right: '0',
        bottom: '30px',
        zIndex: 99999,
      }}
      className="flex items-center justify-center rounded-l-xl border border-[#e5d8bd] bg-white px-3 py-4 text-[#c49424] shadow-2xl transition-all duration-300 hover:bg-[#c49424] hover:text-white"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

export default ScrollTopButton