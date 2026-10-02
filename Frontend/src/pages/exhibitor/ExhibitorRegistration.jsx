import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:3200"}/api/exhibitor-profile`;

const statusStyles = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const inputClass =
  "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-[#d4a62a]";
const labelClass = "mb-1 block text-sm text-muted";

const ExhibitorRegistration = () => {
  const { user } = useSelector((state) => state.auth);

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    productsServices: "",
    description: "",
    email: "",
    phone: "",
    address: "",
  });
  const [logo, setLogo] = useState(null);
  const [documents, setDocuments] = useState([]);

  const headers = { "x-user-id": user?._id };
  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/profile`, { headers });
        const data = await res.json();
        if (res.ok) setApplication(data.application);
      } catch {
        setError("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logo) formData.append("logo", logo);
    documents.forEach((file) => formData.append("documents", file));

    try {
      const res = await fetch(`${API}/apply`, { method: "POST", headers, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setApplication(data.application);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
        title="Registration"
        description="Apply for the expo and track your approval status."
      >
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : !user?._id ? (
          <p className="text-sm text-red-500">Please login again.</p>
        ) : application ? (
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Approval status</h2>
            <span
              className={`mt-3 inline-block rounded-full px-4 py-1 text-sm font-bold capitalize text-black ${statusStyles[application.status]}`}
            >
              {application.status}
            </span>

            <div className="mt-5 space-y-2 text-sm text-muted">
              <p><b className="text-foreground">Company:</b> {application.companyName}</p>
              <p><b className="text-foreground">Products/Services:</b> {application.productsServices}</p>
              {application.description && <p><b className="text-foreground">Description:</b> {application.description}</p>}
              {application.email && <p><b className="text-foreground">Email:</b> {application.email}</p>}
              {application.phone && <p><b className="text-foreground">Phone:</b> {application.phone}</p>}
              {application.address && <p><b className="text-foreground">Address:</b> {application.address}</p>}
              <p><b className="text-foreground">Documents uploaded:</b> {application.documents?.length || 0}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Exhibitor application</h2>

            <label className={labelClass}>Company name *</label>
            <input className={`${inputClass} mb-4`} name="companyName" value={form.companyName} onChange={handleChange} required />

            <label className={labelClass}>Products / Services *</label>
            <input className={`${inputClass} mb-4`} name="productsServices" value={form.productsServices} onChange={handleChange} placeholder="e.g. Laptops, Printers" required />

            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} mb-4 min-h-[80px]`} name="description" value={form.description} onChange={handleChange} />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <label className={`${labelClass} mt-4`}>Address</label>
            <input className={`${inputClass} mb-4`} name="address" value={form.address} onChange={handleChange} />

            <label className={labelClass}>Company logo</label>
            <input className={`${inputClass} mb-4`} type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />

            <label className={labelClass}>Documents (max 5)</label>
            <input className={`${inputClass} mb-4`} type="file" multiple onChange={(e) => setDocuments(Array.from(e.target.files).slice(0, 5))} />

            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#d4a62a] px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorRegistration;
