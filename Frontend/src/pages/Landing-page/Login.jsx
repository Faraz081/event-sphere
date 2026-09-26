import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock } from 'lucide-react'
import loginSignupBg from '../../assets/login-signup-bg.jpg'


export default function Login() {

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    localStorage.setItem('isLoggedIn', 'true')

    navigate('/Dashboard')
  }

  return (
   <main
  className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-24"
  style={{ backgroundImage: `url(${loginSignupBg})` }}
>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden bg-[#f8f5ef] p-12 lg:flex lg:flex-col lg:justify-center">
          <div className="mb-6 flex items-center font-serif text-3xl font-semibold tracking-wide text-[#2f2a24]">
            <Sparkles className="mr-2 h-8 w-8 text-[#c49424]" />
            Event<span className="text-[#c49424]">Sphere</span>
          </div>

          <h1 className="font-serif text-4xl font-bold leading-tight text-[#2f2a24]">
            Welcome Back
            <br />
            <span className="text-[#c49424]">
              To EventSphere
            </span>
          </h1>

          <p className="mt-6 leading-7 text-[#5d574f]">
            Sign in to manage your events, exhibitors, schedules and attendees
            from one simple platform.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 sm:p-12">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-[#2f2a24]">
              Login
            </h2>

            <p className="mt-2 text-sm text-[#5d574f]">
              Enter your details to continue
            </p>
          </div>

         <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2f2a24]">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2f2a24]">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-[#c49424] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
            >
              Login
            </button>

            <div className="text-right">
  <Link
    to="/forgot-password"
    className="text-sm font-semibold text-[#c49424] hover:underline mr-35"
  >
    Forgot Password?
  </Link>
</div>
          </form>

          <p className="mt-6 text-center text-sm text-[#5d574f]">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-[#c49424] hover:underline"
            >
              Sign Up
            </Link>
          </p>
          
          <Link
              to="/"
              className="font-semibold text-[#c49424] hover:underline mr-20 text-center text-sm ml-40"
            >
              Back To Website
            </Link>
          
        </div>

      </div>
    </main>
  )
}