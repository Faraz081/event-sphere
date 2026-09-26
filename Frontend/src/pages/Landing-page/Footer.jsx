import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="relative bg-[#29251f] px-8 py-16 text-white md:px-16 lg:px-24">
      <div className="mx-autoz max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-12">
          
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center font-serif text-2xl font-medium tracking-wider text-white transition-opacity hover:opacity-80"
            >
              <Sparkles className="mr-2 h-6 w-6 text-[#c49424]" />
              Event<span className="text-[#c49424]">Sphere</span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-white/60 max-w-md">
              A modern event and expo management platform designed to simplify planning, connect people, and create memorable experiences.
            </p>

            <div className="mt-6 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Subscribe to Our Newsletter
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="mt-2.5 flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 p-1.5 backdrop-blur-md focus-within:border-[#c49424] transition-all">
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="w-full bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/30"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c49424] text-white shadow-md transition-all duration-300 hover:bg-[#a77d20] hover:scale-105"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>

            <div className="mt-6 flex gap-3">
              {[
                { icon: <FaInstagram className="h-5 w-5" />, label: 'Instagram', href: '#' },
                { icon: <FaLinkedinIn className="h-5 w-5" />, label: 'LinkedIn', href: '#' },
                { icon: <FaFacebookF className="h-4 w-4" />, label: 'Facebook', href: '#' },
                { icon: <FaXTwitter className="h-4 w-4" />, label: 'X', href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-[#c49424] hover:bg-[#c49424]/10 hover:text-[#c49424]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 lg:border-l lg:border-white/10 lg:pl-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c49424]">
              Quick Links
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <li><Link to="/" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Home</Link></li>
              <li><Link to="/about-platform" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">About Us</Link></li>
              <li><Link to="/service" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Our Services</Link></li>
              <li><Link to="/event-gallery" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Gallery</Link></li>
              <li><Link to="/contact" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Contact Us</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c49424]">
              Platform
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <li><Link to="/Dashboard" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Event Dashboard</Link></li>
              <li><Link to="/Dashboard" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Event Management</Link></li>
              <li><Link to="/Dashboard" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Exhibitor Hub</Link></li>
              <li><Link to="/Dashboard" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Attendee Portal</Link></li>
              <li><Link to="/Dashboard" className="transition-all duration-300 hover:text-[#c49424] hover:pl-1">Analytics & Reports</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#c49424]">
              Contact Us
            </h3>
            
            <div className="mt-5 space-y-5 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#c49424]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">Call Us Now</p>
                  <p className="font-medium text-white/90">+92 300 1234567</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#c49424]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">Email Us</p>
                  <p className="font-medium text-white/90">hello@eventsphere.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c49424]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/40">Location</p>
                  <p className="font-medium text-white/90">Karachi, Pakistan</p>
                </div>
              </div>
            </div>

            <Link
              to="/Dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c49424]/40 bg-[#c49424] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-[#a77d20]"
            >
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>

             <Link
              to="/book-now"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c49424]/40 bg-[#c49424] px-12.5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-[#a77d20]"
            >
              Book Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        <div className="flex flex-col gap-4 pt-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© 2026 EventSphere Management. All rights reserved.</p>

          <div className="flex gap-6">
            <Link to="/" className="transition hover:text-[#c49424]">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-[#c49424]">
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;