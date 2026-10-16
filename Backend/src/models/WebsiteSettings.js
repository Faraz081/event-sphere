import mongoose from "mongoose";

const websiteSettingsSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      default: "EventSphere",
      trim: true,
    },

    logo: {
      type: String,
      default: "/logo.jpg",
      trim: true,
    },

    favicon: {
      type: String,
      default: "/favicon.png",
      trim: true,
    },

    tagline: {
      type: String,
      default: "Event Management Platform",
      trim: true,
    },

    hero: {
      title: {
        type: String,
        default: "Create\nUnforgettable\nEvents With Style",
        trim: true,
      },
      description: {
        type: String,
        default:
          "Plan, manage and experience extraordinary events with EventSphere. From exhibitors and schedules to attendees and event analytics, everything is managed in one place.",
        trim: true,
      },
      buttonText: {
        type: String,
        default: "Book Now",
        trim: true,
      },
      image: {
        type: String,
        default: "/images/hero-default.jpg",
        trim: true,
      },
    },

    about: {
      title: {
        type: String,
        default: "Everything You Need For A Perfect Event",
        trim: true,
      },
      description: {
        type: String,
        default:
          "EventSphere is an event and expo management platform designed to make event planning simple, organized and efficient. Admins can manage exhibitors, schedules, attendees, communication and event information from one place. Whether it is a corporate expo, a wedding celebration or a special gathering, EventSphere helps bring every important part of an event together.",
        trim: true,
      },
      image: {
        type: String,
        default: "/images/about-default.jpg",
        trim: true,
      },
    },

    contact: {
      email: {
        type: String,
        default: "hello@eventsphere.com",
        trim: true,
      },
      phone: {
        type: String,
        default: "+92 300 1234567",
        trim: true,
      },
      address: {
        type: String,
        default: "Karachi, Pakistan",
        trim: true,
      },
      officeHours: {
        type: String,
        default: "Mon - Fri, 9 AM - 6 PM",
        trim: true,
      },
    },

    socialLinks: {
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
      twitter: {
        type: String,
        default: "",
        trim: true,
      },
    },

    footer: {
      description: {
        type: String,
        default:
          "A modern event and expo management platform designed to simplify planning, connect people, and create memorable experiences.",
        trim: true,
      },
      copyright: {
        type: String,
        default: "© 2026 EventSphere Management. All rights reserved.",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WebsiteSettings", websiteSettingsSchema);
