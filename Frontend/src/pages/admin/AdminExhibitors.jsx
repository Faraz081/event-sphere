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
import { fetchExpoTickets, cancelExpoTicket } from "@/api/adminTicketService";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Eye,
  FileText,
  Ticket,
  Ban,
} from "lucide-react";

const FILE_BASE = import.meta.env.VITE_API_URL || "http://localhost:3200";

const statusStyles = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  const [relatedTickets, setRelatedTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

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

  const openReview = async (app) => {
    setSelected(app);
    setRejecting(false);
    setNote("");
    setRelatedTickets([]);

    const userId = app.userId?._id || app.userId;
    const expoId = app.expo?._id || app.expo;

    if (!userId && !expoId) return;

    try {
      setTicketsLoading(true);
      const params = {};
      if (userId) params.userId = userId;
      if (expoId) params.expo = expoId;

      const data = await fetchExpoTickets(params);
      setRelatedTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load related tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  const closeReview = () => {
    setSelected(null);
    setRejecting(false);
    setNote("");
    setRelatedTickets([]);
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

  const handleCancelTicket = async (ticketId) => {
    try {
      setCancellingId(ticketId);
      await cancelExpoTicket(ticketId, "Cancelled by admin from exhibitor view");
      setRelatedTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? {
                ...t,
                bookingStatus: "cancelled",
                registrationStatus: "cancelled",
                passStatus: "revoked",
              }
            : t
        )
      );
      toast.success("Ticket cancelled");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel ticket");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              Exhibitor Applications
            </h1>
            <p className="text-muted text-sm md:text-base">
              Review exhibitor applications for each expo.
            </p>
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
                <td colSpan={6} className="px-6 py-12 text-center text-muted">
                  Loading applications...
                </td>
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

                  <td data-label="Expo" className="px-6 py-4 text-muted">
                    {expoTitle(a)}
                  </td>

                  <td data-label="Contact" className="px-6 py-4 text-muted text-sm">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} /> {a.email || a.userId?.email}
                    </div>

                    {(a.phone || a.userId?.phone) && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone size={14} /> {a.phone || a.userId?.phone}
                      </div>
                    )}
                  </td>

                  <td data-label="Applied On" className="px-6 py-4 text-muted">
                    {formatDate(a.createdAt)}
                  </td>

                  <td data-label="Status" className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyles[a.status] ?? statusStyles.pending
                      }`}
                    >
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

        <AlertDialog open={!!selected} onOpenChange={(open) => !open && closeReview()}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-2xl border border-[#eadfc9] bg-[#f8f5ef] text-[#2f2a24] shadow-2xl shadow-black/20 p-0 overflow-hidden">
            <AlertDialogHeader className="border-b border-[#eadfc9] bg-[#fffdf9] px-6 py-5">
              <AlertDialogTitle className="text-lg font-semibold text-[#2f2a24]">
                {selected?.companyName}
              </AlertDialogTitle>

              <AlertDialogDescription className="text-sm text-[#5d574f]">
                Application for {expoTitle(selected)}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {selected && (
              <div className="max-h-[55vh] space-y-3 overflow-y-auto bg-[#f8f5ef] px-6 py-5 text-sm text-[#5d574f]">
                {selected.logo && (
                  <img
                    src={`${FILE_BASE}${selected.logo}`}
                    alt="logo"
                    className="mb-3 h-16 w-16 rounded-lg border border-[#eadfc9] bg-[#fffdf9] object-cover"
                  />
                )}

                <p>
                  <b className="text-[#2f2a24]">Exhibitor:</b> {selected.userId?.name}
                </p>

                <p>
                  <b className="text-[#2f2a24]">Products/Services:</b> {selected.productsServices}
                </p>

                {selected.description && (
                  <p>
                    <b className="text-[#2f2a24]">Description:</b> {selected.description}
                  </p>
                )}

                {selected.email && (
                  <p>
                    <b className="text-[#2f2a24]">Email:</b> {selected.email}
                  </p>
                )}

                {selected.phone && (
                  <p>
                    <b className="text-[#2f2a24]">Phone:</b> {selected.phone}
                  </p>
                )}

                {selected.address && (
                  <p>
                    <b className="text-[#2f2a24]">Address:</b> {selected.address}
                  </p>
                )}

                {selected.adminNote && (
                  <p>
                    <b className="text-[#2f2a24]">Previous note:</b> {selected.adminNote}
                  </p>
                )}

                <div>
                  <b className="text-[#2f2a24]">Documents:</b>

                  {selected.documents?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.documents.map((d, i) => (
                        <a
                          key={d}
                          href={`${FILE_BASE}${d}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#eadfc9] bg-[#fffdf9] px-2.5 py-1.5 text-xs text-[#9a7412] hover:border-[#c49424] hover:bg-[#f8f5ef]"
                        >
                          <FileText size={12} />
                          Document {i + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-1">none</span>
                  )}
                </div>

                <div className="mt-6 border-t border-[#eadfc9] pt-4">
                  <h4 className="text-sm font-semibold text-[#2f2a24] mb-3 flex items-center gap-2">
                    <Ticket size={16} />
                    Related Tickets
                  </h4>

                  {ticketsLoading ? (
                    <p className="text-sm text-[#5d574f]">Loading tickets...</p>
                  ) : relatedTickets.length === 0 ? (
                    <p className="text-sm text-[#5d574f]">
                      No tickets found for this exhibitor / expo.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {relatedTickets.map((t) => (
                        <div
                          key={t._id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-[#eadfc9] bg-[#fffdf9] px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-[#2f2a24] truncate">
                              {t.user?.name || "—"} · {t.user?.email || ""}
                            </div>
                            <div className="text-[#5d574f] text-xs">
                              {t.expo?.title || "—"} · {t.bookingStatus}
                            </div>
                          </div>

                          {["pending", "confirmed"].includes(t.bookingStatus) && (
                            <button
                              type="button"
                              onClick={() => handleCancelTicket(t._id)}
                              disabled={cancellingId === t._id}
                              className="shrink-0 inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-500/25 disabled:opacity-50"
                            >
                              <Ban size={12} />
                              {cancellingId === t._id ? "..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {rejecting && (
              <div className="bg-[#f8f5ef] px-6 pb-5">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason for rejection (exhibitor will see this)"
                  rows={3}
                  className="w-full rounded-xl border border-[#eadfc9] bg-[#fffdf9] p-3 text-sm text-[#2f2a24] placeholder:text-[#5d574f] focus:outline-none focus:ring-2 focus:ring-[#c49424]/40"
                />
              </div>
            )}

            <AlertDialogFooter className="border-t border-[#eadfc9] bg-[#fffdf9] px-6 py-4">
              <AlertDialogCancel className="border-[#eadfc9] bg-transparent text-[#5d574f] hover:bg-[#f8f5ef] hover:text-[#2f2a24]">
                Close
              </AlertDialogCancel>

              {!rejecting ? (
                <>
                  {selected?.status !== "rejected" && (
                    <button
                      onClick={() => setRejecting(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/25"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  )}

                  {selected?.status !== "approved" && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#c49424] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                    >
                      <CheckCircle size={14} />
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setRejecting(false)}
                    className="rounded-lg border border-[#eadfc9] bg-transparent px-4 py-2 text-sm text-[#5d574f] hover:bg-[#f8f5ef] hover:text-[#2f2a24]"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
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