import loginSignupBg from '../../assets/login-signup-bg.jpg'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  UserRound,
  Mail,
  Lock,
  UserPlus,
} from 'lucide-react'

export default function Signup() {
  return (
   <main
  className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-32 lg:px-10"
  style={{ backgroundImage: `url(${loginSignupBg})` }}
>
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#eadfca] bg-white shadow-xl lg:grid-cols-2">

        {/* Left Side - Branding */}
        <div className="relative hidden overflow-hidden bg-[#f8f5ef] p-12 lg:flex lg:flex-col lg:justify-center">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#c49424]/10" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#c49424]/10" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center font-serif text-3xl font-semibold tracking-wide text-[#2f2a24]">
              <Sparkles className="mr-2 h-8 w-8 text-[#c49424]" />
              Event<span className="text-[#c49424]">Sphere</span>
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
              Join EventSphere
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#2f2a24] sm:text-5xl">
              Create Your
              <br />
              <span className="text-[#c49424]">
                Event Journey
              </span>
            </h1>

            <p className="mt-6 max-w-md leading-7 text-[#5d574f]">
              Join EventSphere and make your event planning experience
              simpler, smarter and more organized.
            </p>

            <div className="mt-8 space-y-4 text-sm text-[#5d574f]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c49424] shadow-sm">
                  ✓
                </span>
                Manage events easily
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c49424] shadow-sm">
                  ✓
                </span>
                Organize attendees and exhibitors
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c49424] shadow-sm">
                  ✓
                </span>
                Plan memorable experiences
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="p-8 sm:p-12 lg:p-14">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf8ed]">
              <UserPlus className="h-7 w-7 text-[#c49424]" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-[#2f2a24]">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-[#5d574f]">
              Sign up to get started with EventSphere
            </p>
          </div>

          <form className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2f2a24]">
                Full Name
              </label>

              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#2f2a24]">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b48620]" />

                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-[#eadfca] bg-[#fffdf9] py-3 pl-12 pr-4 outline-none transition focus:border-[#c49424] focus:ring-2 focus:ring-[#c49424]/20"
                />
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-[#c49424] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a97d18] hover:shadow-lg"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5d574f]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#c49424] hover:underline"
            >
              Login
            </Link>
          </p>

            <Link
              to="/"
              className="font-semibold text-[#c49424] hover:underline mr-20 text-center text-sm ml-45"
            >
              Back To Website
            </Link>
          
        </div>
      </div>
    </main>
  )
}