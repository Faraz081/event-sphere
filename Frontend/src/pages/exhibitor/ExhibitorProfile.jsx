import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "@/api/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import { toast } from "sonner";

const inputClass = "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-[#d4a62a]";
const labelClass = "mb-1 block text-sm text-muted";

const statusStyles = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const ExhibitorProfile = () => {
  const { user } = useSelector((state) => state.auth);

  const [applications, setApplications] = useState([]);
  const application = applications[0] ?? null;
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email: "", phone: "", address: "" });
  const [logo, setLogo] = useState(null);

  const fillForm = (app) =>
    setForm({
      email: app.email ?? "",
      phone: app.phone ?? "",
      address: app.address ?? "",
    });

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await api.get("/api/exhibitor-profile/profile");
        const profileApplications = res.data.applications ?? [res.data.application].filter(Boolean);
        setApplications(profileApplications);
        fillForm(profileApplications[0]);
      } catch (err) {
        if (err.response?.status !== 404) {
          toast.error(err.response?.data?.error || "Could not load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCancel = () => {
    fillForm(application);
    setLogo(null);
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    if (logo) formData.append("logo", logo);

    try {
      const res = await api.put("/api/exhibitor-profile/profile", formData);
      const profileApplications = res.data.applications ?? [res.data.application].filter(Boolean);
      setApplications(profileApplications);
      fillForm(profileApplications[0]);
      setLogo(null);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const header = application && (
    <div className="mb-6 flex items-center gap-4">
      {application.logo ? (
        <img
          src={application.logo}
          alt="Company logo"
          className="h-20 w-20 rounded-2xl border border-border object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border text-xs text-muted">
          No logo
        </div>
      )}

      <div>
        <p className="text-lg font-semibold text-foreground">{application.companyName}</p>
        <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold capitalize text-black ${statusStyles[application.status]}`}>
          {application.status}
        </span>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
        title="Profile"
        description="Edit company and contact details from the shared exhibitor area."
      >
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : !user?._id ? (
          <p className="text-sm text-red-500">Please login again.</p>
        ) : !application ? (
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Company profile</h2>
            <p className="mt-2 text-sm text-muted">
              You have not applied yet. Please submit your registration first.
            </p>
            <Link
              to="/exhibitor/registration"
              className="mt-4 inline-block rounded-xl bg-[#d4a62a] px-5 py-2 text-sm font-bold text-black"
            >
              Go to Registration
            </Link>
          </div>
        ) : !editing ? (
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Company profile</h2>
              <button
                onClick={() => {
                  setSuccess("");
                  setEditing(true);
                }}
                className="rounded-xl bg-[#d4a62a] px-5 py-2 text-sm font-bold text-black"
              >
                Edit Profile
              </button>
            </div>

            {header}

            <div className="mb-6 space-y-2 text-sm text-muted">
              <p><b className="text-foreground">Email:</b> {application.email || "-"}</p>
              <p><b className="text-foreground">Phone:</b> {application.phone || "-"}</p>
              <p><b className="text-foreground">Address:</b> {application.address || "-"}</p>
            </div>
            <div className="space-y-4">
              {applications.map((item) => (
                <div key={item._id} className="rounded-2xl border border-border bg-background p-4">
                  <h3 className="font-semibold text-foreground">{item.expo?.title ?? "Expo registration"}</h3>
                  <p className="mt-2 text-sm text-muted"><b className="text-foreground">Products/Services:</b> {item.productsServices}</p>
                  <p className="mt-1 text-sm text-muted"><b className="text-foreground">Description:</b> {item.description || "-"}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Edit profile</h2>

            {header}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  className={inputClass}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className={`${labelClass} mt-4`}>Address</label>
            <input
              className={`${inputClass} mb-4`}
              name="address"
              value={form.address}
              onChange={handleChange}
            />

            <label className={labelClass}>Change logo</label>
            <input
              className={`${inputClass} mb-4`}
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files[0])}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#d4a62a] px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorProfile;
