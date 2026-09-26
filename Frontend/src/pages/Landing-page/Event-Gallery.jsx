import React from 'react'

import wedding1 from '../../assets/event-gallery/wedding-1.jpg'
import wedding2 from '../../assets/event-gallery/wedding-2.jpg'
import wedding3 from '../../assets/event-gallery/wedding-3.jpg'
import wedding4 from '../../assets/event-gallery/wedding-4.jpg'
import wedding5 from '../../assets/event-gallery/wedding-5.jpg'
import wedding6 from '../../assets/event-gallery/wedding-6.jpg'

import corporate1 from '../../assets/event-gallery/corporate-1.jpg'
import corporate2 from '../../assets/event-gallery/corporate-2.jpg'
import corporate3 from '../../assets/event-gallery/corporate-3.jpg'
import corporate4 from '../../assets/event-gallery/corporate-4.jpg'
import corporate5 from '../../assets/event-gallery/corporate-5.jpg'
import corporate6 from '../../assets/event-gallery/corporate-6.jpg'

import birthday1 from '../../assets/event-gallery/birthday-1.jpg'
import birthday2 from '../../assets/event-gallery/birthday-2.jpg'
import birthday3 from '../../assets/event-gallery/birthday-3.jpg'
import birthday4 from '../../assets/event-gallery/birthday-4.jpg'
import birthday5 from '../../assets/event-gallery/birthday-5.jpg'
import birthday6 from '../../assets/event-gallery/birthday-6.jpg'

const EventGallery = () => {
  const galleryImages = [
    wedding1,
    corporate1,
    birthday1,
    wedding2,
    corporate2,
    birthday2,
    wedding3,
    corporate3,
    birthday3,
    wedding4,
    corporate4,
    birthday4,
    wedding5,
    corporate5,
    birthday5,
    wedding6,
    corporate6,
    birthday6,
  ]

  return (
    <main className="min-h-screen bg-[#fffdf9] px-4 py-20 sm:px-6 lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* Heading */}
       <div className="mb-10 pt-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b48620]">
            Our Moments
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
            Event <span className="text-[#c49424]">Gallery</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Explore memorable moments from weddings, corporate gatherings,
            birthdays and special celebrations.
          </p>
        </div>

        {/* Pinterest Style Masonry Grid */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-4 xl:columns-5">

          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl"
            >
              <img
                src={image}
                alt={`Event gallery ${index + 1}`}
                className="block h-auto w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          ))}

        </div>

      </div>

    </main>
  )
}

export default EventGallery