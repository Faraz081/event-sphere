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
      default: "",
      trim: true,
    },

    favicon: {
      type: String,
      default: "",
      trim: true,
    },

    tagline: {
      type: String,
      default: "",
      trim: true,
    },

    hero: {
      title: {
        type: String,
        default: "",
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      buttonText: {
        type: String,
        default: "",
        trim: true,
      },
      image: {
        type: String,
        default: "",
        trim: true,
      },
    },

    about: {
      title: {
        type: String,
        default: "",
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      image: {
        type: String,
        default: "",
        trim: true,
      },
    },

    contact: {
      email: {
        type: String,
        default: "",
        trim: true,
      },
      phone: {
        type: String,
        default: "",
        trim: true,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
      officeHours: {
        type: String,
        default: "",
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
        default: "",
        trim: true,
      },
      copyright: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WebsiteSettings", websiteSettingsSchema);
