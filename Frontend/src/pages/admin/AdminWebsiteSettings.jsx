import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import DashboardLayout from "@/layouts/DashboardLayout";
import api from "@/api/api";
import { replaceWebsiteSettings } from "@/store/slices/websiteSettingsSlice";

const emptySettings = {
  websiteName: "",
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

const normalizeSettings = (data = {}) => ({
  websiteName: data.websiteName ?? "",
  logo: data.logo ?? "",
  favicon: data.favicon ?? "",
  tagline: data.tagline ?? "",
  hero: {
    title: data.hero?.title ?? "",
    description: data.hero?.description ?? "",
    buttonText: data.hero?.buttonText ?? "",
    image: data.hero?.image ?? "",
  },
  about: {
    title: data.about?.title ?? "",
    description: data.about?.description ?? "",
    image: data.about?.image ?? "",
  },
  contact: {
    email: data.contact?.email ?? "",
    phone: data.contact?.phone ?? "",
    address: data.contact?.address ?? "",
    officeHours: data.contact?.officeHours ?? "",
  },
  socialLinks: {
    facebook: data.socialLinks?.facebook ?? "",
    instagram: data.socialLinks?.instagram ?? "",
    linkedin: data.socialLinks?.linkedin ?? "",
    youtube: data.socialLinks?.youtube ?? "",
    twitter: data.socialLinks?.twitter ?? "",
  },
  footer: {
    description: data.footer?.description ?? "",
    copyright: data.footer?.copyright ?? "",
  },
});

const getSettingsPayload = (settings) => ({
  websiteName: settings.websiteName,
  logo: settings.logo,
  favicon: settings.favicon,
  tagline: settings.tagline,
  hero: settings.hero,
  about: settings.about,
  contact: settings.contact,
  socialLinks: settings.socialLinks,
  footer: settings.footer,
});

const AdminWebsiteSettings = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/website-settings");

      if (response.data && response.data.settings) {
        const savedSettings = normalizeSettings(response.data.settings);
        setSettings(savedSettings);
        dispatch(replaceWebsiteSettings(savedSettings));
      } else {
        setSettings(emptySettings);
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
  }, [dispatch]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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

      const settingsToSave = getSettingsPayload(settings);
      const response = await api.put("/api/website-settings", settingsToSave);

      if (!response.data?.settings) {
        throw new Error("Updated website settings were not returned by the server");
      }

      const savedSettings = normalizeSettings(response.data.settings);
      setSettings(savedSettings);
      dispatch(replaceWebsiteSettings(savedSettings));
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

      if (!currentValue.startsWith("/")) {
        await api.delete("/api/upload/image", {
          data: {
            url: currentValue,
          },
        });
      }

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

      const settingsToSave = getSettingsPayload(updatedSettings);
      const response = await api.put("/api/website-settings", settingsToSave);
      if (!response.data?.settings) {
        throw new Error("Updated website settings were not returned by the server");
      }
      const savedSettings = normalizeSettings(response.data.settings);
      setSettings(savedSettings);
      dispatch(replaceWebsiteSettings(savedSettings));

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
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleImageUpload(event, fieldType)}
          disabled={uploading === fieldType}
          className="block w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-gold file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground file:hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {uploading === fieldType && (
          <p className="text-sm text-gold">
            Please wait...
          </p>
        )}

        {currentValue ? (
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-xs text-muted">
              Current Image
            </p>

            <img
              src={currentValue}
              alt={label}
              className={
                fieldType === "logo"
                  ? "mr-2 h-8 max-h-9 w-auto max-w-30 shrink-0 rounded-md object-contain shadow-[0_1px_3px_rgba(0,0,0,0.3)] md:h-9 md:max-w-40"
                  : fieldType === "favicon"
                    ? "h-8 w-8 object-contain"
                  : "max-h-48 w-auto max-w-full rounded-lg object-contain"
              }
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
          <p className="text-xs text-muted">
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
          <div className="text-sm text-muted">
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
          <h1 className="text-2xl font-semibold text-foreground">
            Website Settings
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage the public website content and general information.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
       

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                General Settings
              </h2>

              <p className="mt-1 text-sm text-muted">
                Basic website information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
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

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Main Banner Settings
              </h2>

              <p className="mt-1 text-sm text-muted">
                Content saved here can be used by the public website.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
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

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                About Section
              </h2>

              <p className="mt-1 text-sm text-muted">
                Manage the public About section content.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
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

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Contact Information
              </h2>

              <p className="mt-1 text-sm text-muted">
                Contact details displayed on the public website.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Social Links
              </h2>

              <p className="mt-1 text-sm text-muted">
                Add the social media URLs for the public website.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Footer Settings
              </h2>

              <p className="mt-1 text-sm text-muted">
                Manage footer information shown on the public website.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
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
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
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