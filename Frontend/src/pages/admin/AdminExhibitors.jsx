import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ResponsiveTable from "@/components/shared/ResponsiveTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { fetchApplications, approveApplication, rejectApplication } from "@/api/exhibitorService";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, RotateCcw, AlertCircle, Building2, Mail, Phone, Eye, FileText } from "lucide-react";

const FILE_BASE = import.meta.env.VITE_API_URL || "http://localhost:3200";

const statusStyles = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const expoTitle = (a) => a?.expo?.title ?? a?.expo?.name ?? "—";

const AdminExhibitors = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const data = await fetchApplications(params);
      setApplications(data.applications ?? []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load applications");
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const openReview = (app) => {
    setSelected(app);
    setRejecting(false);
    setNote("");
  };

  const closeReview = () => {
    setSelected(null);
    setRejecting(false);
    setNote("");
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveApplication(selected._id);
      toast.success(`${selected.companyName} approved`);
      closeReview();
      loadApplications();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      toast.error("Please add a reason for rejection");
      return;
    }
    try {
      setActionLoading(true);
      await rejectApplication(selected._id, note.trim());
      toast.success(`${selected.companyName} rejected`);
      closeReview();
      loadApplications();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reject application");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">Exhibitor Applications</h1>
            <p className="text-muted text-sm md:text-base">Review exhibitor applications for each expo.</p>
          </div>

          <button
            onClick={loadApplications}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-border bg-surface text-muted hover:text-foreground px-3.5 py-2 rounded-xl text-sm font-medium transition-colors self-start"
          >
            <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by company, email, products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <ResponsiveTable>
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-3 text-sm text-muted font-medium">Company / Exhibitor</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Expo</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Contact</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Applied On</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-sm text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted">Loading applications...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted">
                  <Building2 className="mx-auto mb-2 opacity-40" size={32} />
                  No applications found for this filter.
                </td>
              </tr>
            ) : (
              applications.map((a) => (
                <tr key={a._id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td data-label="Company" className="px-6 py-4">
                    <div className="text-foreground font-medium">{a.companyName}</div>
                    <div className="text-muted text-sm">{a.userId?.name}</div>
                  </td>
                  <td data-label="Expo" className="px-6 py-4 text-muted">{expoTitle(a)}</td>
                  <td data-label="Contact" className="px-6 py-4 text-muted text-sm">
                    <div className="flex items-center gap-1.5"><Mail size={14} /> {a.email || a.userId?.email}</div>
                    {(a.phone || a.userId?.phone) && (
                      <div className="flex items-center gap-1.5 mt-1"><Phone size={14} /> {a.phone || a.userId?.phone}</div>
                    )}
                  </td>
                  <td data-label="Applied On" className="px-6 py-4 text-muted">{formatDate(a.createdAt)}</td>
                  <td data-label="Status" className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[a.status] ?? statusStyles.pending}`}>
                      {a.status}
                    </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => openReview(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/15 text-gold hover:bg-gold/25 transition-colors"
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </ResponsiveTable>

        {/* Review Dialog */}
        <AlertDialog open={!!selected} onOpenChange={(open) => !open && closeReview()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{selected?.companyName}</AlertDialogTitle>
              <AlertDialogDescription>Application for {expoTitle(selected)}</AlertDialogDescription>
            </AlertDialogHeader>

            {selected && (
              <div className="max-h-[50vh] space-y-2 overflow-y-auto text-sm text-muted">
                {selected.logo && (
                  <img src={`${FILE_BASE}${selected.logo}`} alt="logo" className="mb-2 h-16 w-16 rounded-lg border border-border object-cover" />
                )}
                <p><b className="text-foreground">Exhibitor:</b> {selected.userId?.name}</p>
                <p><b className="text-foreground">Products/Services:</b> {selected.productsServices}</p>
                {selected.description && <p><b className="text-foreground">Description:</b> {selected.description}</p>}
                {selected.email && <p><b className="text-foreground">Email:</b> {selected.email}</p>}
                {selected.phone && <p><b className="text-foreground">Phone:</b> {selected.phone}</p>}
                {selected.address && <p><b className="text-foreground">Address:</b> {selected.address}</p>}
                {selected.adminNote && <p><b className="text-foreground">Previous note:</b> {selected.adminNote}</p>}
                <div>
                  <b className="text-foreground">Documents:</b>
                  {selected.documents?.length ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selected.documents.map((d, i) => (
                        <a key={d} href={`${FILE_BASE}${d}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-gold hover:underline">
                          <FileText size={12} /> Document {i + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span> none</span>
                  )}
                </div>
              </div>
            )}

            {rejecting && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for rejection (exhibitor will see this)"
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            )}

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-border text-muted hover:text-foreground">Close</AlertDialogCancel>

              {!rejecting ? (
                <>
                  {selected?.status !== "rejected" && (
                    <button onClick={() => setRejecting(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/25">
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                  {selected?.status !== "approved" && (
                    <button onClick={handleApprove} disabled={actionLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60">
                      <CheckCircle size={14} /> {actionLoading ? "Processing..." : "Approve"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={() => setRejecting(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground">Back</button>
                  <button onClick={handleReject} disabled={actionLoading} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
                    {actionLoading ? "Processing..." : "Confirm reject"}
                  </button>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminExhibitors;