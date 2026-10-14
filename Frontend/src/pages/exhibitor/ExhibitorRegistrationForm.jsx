import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "@/api/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";

const inputClass = "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-[#d4a62a]";
const labelClass = "mb-1 block text-sm text-muted";

const getList = (data, key) => (Array.isArray(data) ? data : data?.[key] ?? data?.data ?? []);
const expoName = (e) => e?.title ?? e?.name ?? "Expo";

const ExhibitorRegistrationForm = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    expo: "",
    companyName: user?.companyName ?? "",
    productsServices: "",
    description: "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
  });
  const [logo, setLogo] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [appsRes, exposRes] = await Promise.allSettled([
        api.get("/api/exhibitor-profile/applications"),
        api.get("/api/exhibitor-profile/expos"),
      ]);

      if (appsRes.status === "fulfilled") setApplications(getList(appsRes.value.data, "applications"));
      else toast.error("Could not load your applications");

      if (exposRes.status === "fulfilled") setExpos(getList(exposRes.value.data, "expos"));
      else toast.error("Could not load expos");

      setLoading(false);
    };

    loadData();
  }, []);

  const appliedExpoIds = applications.map((a) => a.expo?._id ?? a.expo);
  const availableExpos = expos.filter((e) => !appliedExpoIds.includes(e._id));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logo) formData.append("logo", logo);
    documents.forEach((file) => formData.append("documents", file));

    try {
      await api.post("/api/exhibitor-profile/apply", formData);
      toast.success("Application submitted");
      setLogo(null);
      setDocuments([]);
      navigate("/exhibitor/registration");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage title="Exhibitor Registration" description="Submit your application to participate in an expo.">
        <button type="button" onClick={() => navigate("/exhibitor/registration")} className="mb-5 rounded-xl border border-border px-5 py-2 text-sm text-muted hover:text-foreground">
          Back to applications
        </button>

        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Exhibitor application</h2>

            <label className={labelClass}>Expo *</label>
            <select className={`${inputClass} mb-4`} name="expo" value={form.expo} onChange={handleChange} required>
              <option value="">Select an expo</option>
              {availableExpos.map((ex) => (
                <option key={ex._id} value={ex._id} className="bg-background">{expoName(ex)}</option>
              ))}
            </select>

            <label className={labelClass}>Company name *</label>
            <input className={`${inputClass} mb-4`} name="companyName" value={form.companyName} onChange={handleChange} required />

            <label className={labelClass}>Products / Services *</label>
            <input className={`${inputClass} mb-4`} name="productsServices" value={form.productsServices} onChange={handleChange} placeholder="e.g. Laptops, Printers" required />

            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} mb-4 min-h-20`} name="description" value={form.description} onChange={handleChange} />

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

            <div className="flex gap-3">
              <button type="submit" disabled={submitting || availableExpos.length === 0} className="rounded-xl bg-[#d4a62a] px-6 py-3 text-sm font-bold text-black disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit application"}
              </button>
              <button type="button" onClick={() => navigate("/exhibitor/registration")} className="rounded-xl border border-border px-6 py-3 text-sm text-muted hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        )}
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorRegistrationForm;