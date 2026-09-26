import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminLayout from "@/dashboard/layouts/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/api/api";

const AdminWebsiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/api/website-settings");

      if (response.data?.settings) {
        setFormData(response.data.settings);
      }
    } catch (error) {
      console.error("Website settings fetch error:", error);
      toast.error("Failed to load website settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await api.put(
        "/api/website-settings",
        formData
      );

      if (response.data?.settings) {
        setFormData(response.data.settings);
      }

      toast.success("Website settings saved successfully");
    } catch (error) {
      console.error("Website settings update error:", error);

      const message =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "Failed to save website settings";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-8">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
            Website Settings
          </h1>

          <p className="text-muted mt-2">
            Loading website settings...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
            Website Settings
          </h1>

          <p className="text-muted mt-2 text-sm md:text-base">
            Manage your website content and contact information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* General Settings */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              General Settings
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Website Name
                </label>

                <Input
                  name="websiteName"
                  value={formData.websiteName}
                  onChange={handleChange}
                  placeholder="EventSphere"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tagline
                </label>

                <Input
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="Your event management platform"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Logo URL
                </label>

                <Input
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Favicon URL
                </label>

                <Input
                  name="favicon"
                  value={formData.favicon}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* Hero Settings */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Hero Section
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Hero Title
                </label>

                <Input
                  value={formData.hero.title}
                  onChange={(e) =>
                    handleNestedChange(
                      "hero",
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Welcome to EventSphere"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Hero Description
                </label>

                <textarea
                  value={formData.hero.description}
                  onChange={(e) =>
                    handleNestedChange(
                      "hero",
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                  placeholder="Enter hero description..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Button Text
                  </label>

                  <Input
                    value={formData.hero.buttonText}
                    onChange={(e) =>
                      handleNestedChange(
                        "hero",
                        "buttonText",
                        e.target.value
                      )
                    }
                    placeholder="Explore Events"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Hero Image URL
                  </label>

                  <Input
                    value={formData.hero.image}
                    onChange={(e) =>
                      handleNestedChange(
                        "hero",
                        "image",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* About Settings */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              About Section
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  About Title
                </label>

                <Input
                  value={formData.about.title}
                  onChange={(e) =>
                    handleNestedChange(
                      "about",
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="About EventSphere"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  About Description
                </label>

                <textarea
                  value={formData.about.description}
                  onChange={(e) =>
                    handleNestedChange(
                      "about",
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                  placeholder="Enter about description..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  About Image URL
                </label>

                <Input
                  value={formData.about.image}
                  onChange={(e) =>
                    handleNestedChange(
                      "about",
                      "image",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* Contact Settings */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Contact Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>

                <Input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    handleNestedChange(
                      "contact",
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="info@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Phone
                </label>

                <Input
                  value={formData.contact.phone}
                  onChange={(e) =>
                    handleNestedChange(
                      "contact",
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="+92..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Address
                </label>

                <Input
                  value={formData.contact.address}
                  onChange={(e) =>
                    handleNestedChange(
                      "contact",
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Office address"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Office Hours
                </label>

                <Input
                  value={formData.contact.officeHours}
                  onChange={(e) =>
                    handleNestedChange(
                      "contact",
                      "officeHours",
                      e.target.value
                    )
                  }
                  placeholder="Mon - Fri, 9 AM - 5 PM"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Social Links
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.keys(formData.socialLinks).map((platform) => (
                <div key={platform}>
                  <label className="mb-2 block text-sm font-medium capitalize text-foreground">
                    {platform}
                  </label>

                  <Input
                    value={formData.socialLinks[platform]}
                    onChange={(e) =>
                      handleNestedChange(
                        "socialLinks",
                        platform,
                        e.target.value
                      )
                    }
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Footer Settings */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Footer
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Footer Description
                </label>

                <textarea
                  value={formData.footer.description}
                  onChange={(e) =>
                    handleNestedChange(
                      "footer",
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                  placeholder="Enter footer description..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Copyright
                </label>

                <Input
                  value={formData.footer.copyright}
                  onChange={(e) =>
                    handleNestedChange(
                      "footer",
                      "copyright",
                      e.target.value
                    )
                  }
                  placeholder="© 2026 EventSphere"
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminWebsiteSettings;