import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import {
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import api from '../../api/api'

const Footer = () => {
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

  const websiteName = settings?.websiteName || 'EventSphere'

  const footerDescription =
    settings?.footer?.description ||
    'A modern event and expo management platform designed to simplify planning, connect people, and create memorable experiences.'

  const copyright =
    settings?.footer?.copyright ||
    '© 2026 EventSphere Management. All rights reserved.'

  const phone =
    settings?.contact?.phone || '+92 300 1234567'

  const email =
    settings?.contact?.email || 'hello@eventsphere.com'

  const address =
    settings?.contact?.address || 'Karachi, Pakistan'

  const socialLinks = settings?.socialLinks || {}

  const socials = [
    {
      icon: <FaInstagram className="h-5 w-5" />,
      label: 'Instagram',
      href: socialLinks.instagram || '#',
    },
    {
      icon: <FaLinkedinIn className="h-5 w-5" />,
      label: 'LinkedIn',
      href: socialLinks.linkedin || '#',
    },
    {
      icon: <FaFacebookF className="h-4 w-4" />,
      label: 'Facebook',
      href: socialLinks.facebook || '#',
    },
    {
      icon: <FaXTwitter className="h-4 w-4" />,
      label: 'X',
      href: socialLinks.twitter || '#',
    },
    {
      icon: <FaYoutube className="h-5 w-5" />,
      label: 'YouTube',
      href: socialLinks.youtube || '#',
    },
  ]

  return (
    <footer className="relative bg-[#29251f] px-8 py-16 text-white md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-12">

          {/* Brand / Newsletter */}
          <div className="lg:col-span-4">

            <Link
              to="/"
              className="inline-flex items-center font-serif text-2xl font-medium tracking-wider text-white transition-opacity hover:opacity-80"
            >
              <Sparkles className="mr-2 h-6 w-6 text-[#c49424]" />
              {websiteName}
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
              {footerDescription}
            </p>

            <div className="mt-6 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Subscribe to Our Newsletter
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-2.5 flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 p-1.5 backdrop-blur-md transition-all focus-within:border-[#c49424]"
              >
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="w-full bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/30"
                  required
                />

                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c49424] text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#a77d20]"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">

              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href !== '#' ? '_blank' : undefined}
                  rel={social.href !== '#' ? 'noopener noreferrer' : undefined}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-[#c49424] hover:bg-[#c49424]/10 hover:text-[#c49424]"
                >
                  {social.icon}
                </a>
              ))}

            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:border-l lg:border-white/10 lg:pl-8">

            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c49424]">
              Quick Links
            </h3>

            <ul className="mt-5 flex flex-col gap-3 text-sm text-white/60">

              <li>
                <Link
                  to="/"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about-platform"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/service"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Our Services
                </Link>
              </li>

              <li>
                <Link
                  to="/event-gallery"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Gallery
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Contact Us
                </Link>
              </li>

            </ul>
          </div>

          {/* Platform */}
          <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">

            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c49424]">
              Platform
            </h3>

            <ul className="mt-5 flex flex-col gap-3 text-sm text-white/60">

              <li>
                <Link
                  to="/dashboard"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Event Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Event Management
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Exhibitor Hub
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Attendee Portal
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="transition-all duration-300 hover:pl-1 hover:text-[#c49424]"
                >
                  Analytics & Reports
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">

            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c49424]">
              Contact Us
            </h3>

            <div className="mt-5 space-y-5 text-sm text-white/70">

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#c49424]" />

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    Call Us Now
                  </p>

                  <p className="font-medium text-white/90">
                    {phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#c49424]" />

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    Email Us
                  </p>

                  <p className="font-medium text-white/90">
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c49424]" />

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    Location
                  </p>

                  <p className="font-medium text-white/90">
                    {address}
                  </p>
                </div>
              </div>

            </div>

            <Link
              to="/book-now"
              className="ml-2 mt-6 inline-flex items-center gap-2 rounded-full border border-[#c49424]/40 bg-[#c49424] px-8 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-[#a77d20]"
            >
              Book Now
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-4 pt-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between">

          <p>{copyright}</p>

          <div className="flex gap-6">

            <Link
              to="/"
              className="transition hover:text-[#c49424]"
            >
              Privacy Policy
            </Link>

            <Link
              to="/"
              className="hover:text-[#c49424]"
            >
              Terms & Conditions
            </Link>

          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
