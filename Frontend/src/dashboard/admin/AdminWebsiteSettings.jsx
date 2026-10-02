import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import api from "@/api/api";

const defaultSettings = {
  websiteName: "EventSphere",
  logo: "",
  favicon: "",
  tagline: "",

  hero: {
    title: "",
    description: "",
    buttonText: "",
    image: "",
  },

  about: {
    title: "",
    description: "",
    image: "",
  },

  contact: {
    email: "",
    phone: "",
    address: "",
    officeHours: "",
  },

  socialLinks: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    twitter: "",
  },

  footer: {
    description: "",
    copyright: "",
  },
};

const AdminWebsiteSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/website-settings");

      if (response.data && response.data.settings) {
        const data = response.data.settings;

        setSettings({
          ...defaultSettings,
          ...data,

          hero: {
            ...defaultSettings.hero,
            ...(data.hero || {}),
          },

          about: {
            ...defaultSettings.about,
            ...(data.about || {}),
          },

          contact: {
            ...defaultSettings.contact,
            ...(data.contact || {}),
          },

          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(data.socialLinks || {}),
          },

          footer: {
            ...defaultSettings.footer,
            ...(data.footer || {}),
          },
        });
      }
    } catch (error) {
      console.error("Failed to load website settings:", error);

      toast.error(
        error.response?.data?.msg ||
          error.response?.data?.error ||
          "Failed to load website settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRootField = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateNestedField = (section, field, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await api.put("/api/website-settings", settings);

      if (response.data && response.data.settings) {
        const data = response.data.settings;

        setSettings({
          ...defaultSettings,
          ...data,

          hero: {
            ...defaultSettings.hero,
            ...(data.hero || {}),
          },

          about: {
            ...defaultSettings.about,
            ...(data.about || {}),
          },

          contact: {
            ...defaultSettings.contact,
            ...(data.contact || {}),
          },

          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(data.socialLinks || {}),
          },

          footer: {
            ...defaultSettings.footer,
            ...(data.footer || {}),
          },
        });
      }

      toast.success("Website settings saved successfully");
    } catch (error) {
      console.error("Failed to save website settings:", error);

      toast.error(
        error.response?.data?.msg ||
          error.response?.data?.error ||
          "Failed to save website settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event, fieldType) => {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5 MB or less");
      event.target.value = "";
      return;
    }

    try {
      setUploading(fieldType);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/api/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl =
        response.data &&
        response.data.image &&
        response.data.image.url
          ? response.data.image.url
          : "";

      if (!uploadedUrl) {
        throw new Error("Upload URL was not returned by server");
      }

      if (fieldType === "logo") {
        updateRootField("logo", uploadedUrl);
      }

      if (fieldType === "favicon") {
        updateRootField("favicon", uploadedUrl);
      }

      if (fieldType === "hero") {
        updateNestedField("hero", "image", uploadedUrl);
      }

      if (fieldType === "about") {
        updateNestedField("about", "image", uploadedUrl);
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload failed:", error);

      toast.error(
        error.response?.data?.msg ||
          error.response?.data?.error ||
          error.message ||
          "Image upload failed"
      );
    } finally {
      setUploading("");
      event.target.value = "";
    }
  };

  const handleImageDelete = async (fieldType, currentValue) => {
    if (!currentValue) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUploading(fieldType);

      await api.delete("/api/upload/image", {
        data: {
          url: currentValue,
        },
      });

      let updatedSettings;

      if (fieldType === "logo") {
        updatedSettings = {
          ...settings,
          logo: "",
        };
      } else if (fieldType === "favicon") {
        updatedSettings = {
          ...settings,
          favicon: "",
        };
      } else if (fieldType === "hero") {
        updatedSettings = {
          ...settings,
          hero: {
            ...settings.hero,
            image: "",
          },
        };
      } else if (fieldType === "about") {
        updatedSettings = {
          ...settings,
          about: {
            ...settings.about,
            image: "",
          },
        };
      } else {
        updatedSettings = settings;
      }

      setSettings(updatedSettings);

      await api.put("/api/website-settings", updatedSettings);

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Image delete failed:", error);

      toast.error(
        error.response?.data?.msg ||
          error.response?.data?.error ||
          "Image delete failed"
      );
    } finally {
      setUploading("");
    }
  };

  const renderImageUpload = (label, fieldType, currentValue) => {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          {label}
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event, fieldType)}
          disabled={uploading === fieldType}
          className="block w-full rounded-xl border border-white/10 bg-[#11151f] px-3 py-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#c49424] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#b18420] disabled:cursor-not-allowed disabled:opacity-50"
        />

        {uploading === fieldType && (
          <p className="text-sm text-yellow-400">
            Please wait...
          </p>
        )}

        {currentValue ? (
          <div className="rounded-xl border border-white/10 bg-[#11151f] p-4">
            <p className="mb-3 text-xs text-gray-400">
              Current Image
            </p>

            <img
              src={currentValue}
              alt={label}
              className="max-h-48 w-auto max-w-full rounded-lg object-contain"
            />

            <button
              type="button"
              onClick={() =>
                handleImageDelete(fieldType, currentValue)
              }
              disabled={uploading === fieldType}
              className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Image
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            No image uploaded.
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm text-gray-400">
            Loading website settings...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Website Settings
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage the public website content and general information.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Settings */}
          <section className="rounded-2xl border border-white/10 bg-[#181c26] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                General Settings
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Basic website information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Website Name
                </label>

                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(event) =>
                    updateRootField(
                      "websiteName",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="EventSphere"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Tagline
                </label>

                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(event) =>
                    updateRootField(
                      "tagline",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Your event management platform"
                />
              </div>

              <div className="md:col-span-2">
                {renderImageUpload(
                  "Website Logo",
                  "logo",
                  settings.logo
                )}
              </div>

              <div className="md:col-span-2">
                {renderImageUpload(
                  "Favicon",
                  "favicon",
                  settings.favicon
                )}
              </div>
            </div>
          </section>

          {/* Main Banner */}
          <section className="rounded-2xl border border-white/10 bg-[#181c26] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Main Banner Settings
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Content saved here can be used by the public website.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Main Banner Title
                </label>

                <input
                  type="text"
                  value={settings.hero.title}
                  onChange={(event) =>
                    updateNestedField(
                      "hero",
                      "title",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Create unforgettable events"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Main Banner Description
                </label>

                <textarea
                  rows={4}
                  value={settings.hero.description}
                  onChange={(event) =>
                    updateNestedField(
                      "hero",
                      "description",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Write your main banner description..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Button Text
                </label>

                <input
                  type="text"
                  value={settings.hero.buttonText}
                  onChange={(event) =>
                    updateNestedField(
                      "hero",
                      "buttonText",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Book Now"
                />
              </div>

              <div>
                {renderImageUpload(
                  "Main Banner Image",
                  "hero",
                  settings.hero.image
                )}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="rounded-2xl border border-white/10 bg-[#181c26] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                About Section
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Manage the public About section content.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  About Title
                </label>

                <input
                  type="text"
                  value={settings.about.title}
                  onChange={(event) =>
                    updateNestedField(
                      "about",
                      "title",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="About EventSphere"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  About Description
                </label>

                <textarea
                  rows={5}
                  value={settings.about.description}
                  onChange={(event) =>
                    updateNestedField(
                      "about",
                      "description",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Write your About section description..."
                />
              </div>

              <div>
                {renderImageUpload(
                  "About Image",
                  "about",
                  settings.about.image
                )}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-white/10 bg-[#181c26] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Contact Information
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Contact details displayed on the public website.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Email
                </label>

                <input
                  type="email"
                  value={settings.contact.email}
                  onChange={(event) =>
                    updateNestedField(
                      "contact",
                      "email",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="info@eventsphere.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Phone
                </label>

                <input
                  type="text"
                  value={settings.contact.phone}
                  onChange={(event) =>
                    updateNestedField(
                      "contact",
                      "phone",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-white">
                  Address
                </label>

                <input
                  type="text"
                  value={settings.contact.address}
                  onChange={(event) =>
                    updateNestedField(
                      "contact",
                      "address",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Karachi, Pakistan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-white">
                  Office Hours
                </label>

                <input
                  type="text"
                  value={settings.contact.officeHours}
                  onChange={(event) =>
                    updateNestedField(
                      "contact",
                      "officeHours",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Monday - Friday, 9:00 AM - 6:00 PM"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="rounded-2xl border border-white/10 bg-[#181c26] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Social Links
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Add the social media URLs for the public website.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Facebook
                </label>

                <input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(event) =>
                    updateNestedField(
                      "socialLinks",
                      "facebook",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Instagram
                </label>

                <input
                  type="url"
                  value={settings.socialLinks.instagram}
                  onChange={(event) =>
                    updateNestedField(
                      "socialLinks",
                      "instagram",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  LinkedIn
                </label>

                <input
                  type="url"
                  value={settings.socialLinks.linkedin}
                  onChange={(event) =>
                    updateNestedField(
                      "socialLinks",
                      "linkedin",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  YouTube
                </label>

                <input
                  type="url"
                  value={settings.socialLinks.youtube}
                  onChange={(event) =>
                    updateNestedField(
                      "socialLinks",
                      "youtube",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Twitter / X
                </label>

                <input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(event) =>
                    updateNestedField(
                      "socialLinks",
                      "twitter",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="https://x.com/..."
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="rounded-2xl border border-white/10 bg-[#181c26] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Footer Settings
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Manage footer information shown on the public website.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Footer Description
                </label>

                <textarea
                  rows={4}
                  value={settings.footer.description}
                  onChange={(event) =>
                    updateNestedField(
                      "footer",
                      "description",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="Footer description..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Copyright Text
                </label>

                <input
                  type="text"
                  value={settings.footer.copyright}
                  onChange={(event) =>
                    updateNestedField(
                      "footer",
                      "copyright",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-white outline-none transition focus:border-[#c49424]"
                  placeholder="© 2026 EventSphere. All rights reserved."
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#c49424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b18420] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Website Settings"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminWebsiteSettings;