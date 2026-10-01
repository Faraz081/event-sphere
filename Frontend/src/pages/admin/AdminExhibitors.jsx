import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/layouts/DashboardLayout/AdminLayout";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  fetchExhibitors,
  approveExhibitor,
  rejectExhibitor,
} from "@/api/exhibitorService";
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
} from "lucide-react";

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

const AdminExhibitors = () => {
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const [actionExhibitor, setActionExhibitor] = useState(null); // { exhibitor, type: 'approve' | 'reject' }
  const [actionLoading, setActionLoading] = useState(false);

  const loadExhibitors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.exhibitorStatus = statusFilter;

      const data = await fetchExhibitors(params);
      setExhibitors(data.exhibitors || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load exhibitors");
      toast.error("Failed to load exhibitors");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadExhibitors();
  }, [loadExhibitors]);

  const handleAction = async () => {
    if (!actionExhibitor) return;
    const { exhibitor, type } = actionExhibitor;

    try {
      setActionLoading(true);
      if (type === "approve") {
        await approveExhibitor(exhibitor._id);
        toast.success(`${exhibitor.name || exhibitor.companyName} approved`);
      } else {
        await rejectExhibitor(exhibitor._id);
        toast.success(`${exhibitor.name || exhibitor.companyName} rejected`);
      }
      setActionExhibitor(null);
      loadExhibitors();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${type} exhibitor`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              Exhibitors
            </h1>
            <p className="text-muted text-sm md:text-base">
              Review and manage exhibitor applications.
            </p>
          </div>

          <button
            onClick={loadExhibitors}
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
              placeholder="Search by name, email, company..."
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
              <th className="px-6 py-3 text-sm text-muted font-medium">Name / Company</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Contact</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Applied On</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-sm text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  Loading exhibitors...
                </td>
              </tr>
            ) : exhibitors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  <Building2 className="mx-auto mb-2 opacity-40" size={32} />
                  No exhibitors found for this filter.
                </td>
              </tr>
            ) : (
              exhibitors.map((ex) => (
                <tr key={ex._id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td data-label="Name / Company" className="px-6 py-4">
                    <div className="text-foreground font-medium">{ex.name}</div>
                    {ex.companyName && (
                      <div className="text-muted text-sm">{ex.companyName}</div>
                    )}
                  </td>
                  <td data-label="Contact" className="px-6 py-4 text-muted text-sm">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} /> {ex.email}
                    </div>
                    {ex.phone && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone size={14} /> {ex.phone}
                      </div>
                    )}
                  </td>
                  <td data-label="Applied On" className="px-6 py-4 text-muted">
                    {formatDate(ex.createdAt)}
                  </td>
                  <td data-label="Status" className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyles[ex.exhibitorStatus] || statusStyles.pending
                      }`}
                    >
                      {ex.exhibitorStatus || "pending"}
                    </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {ex.exhibitorStatus === "pending" && (
                        <>
                          <button
                            onClick={() => setActionExhibitor({ exhibitor: ex, type: "approve" })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald/15 text-emerald-300 hover:bg-emerald/25 transition-colors"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => setActionExhibitor({ exhibitor: ex, type: "reject" })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}
                      {ex.exhibitorStatus === "approved" && (
                        <button
                          onClick={() => setActionExhibitor({ exhibitor: ex, type: "reject" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors"
                        >
                          <XCircle size={14} />
                          Suspend
                        </button>
                      )}
                      {ex.exhibitorStatus === "rejected" && (
                        <button
                          onClick={() => setActionExhibitor({ exhibitor: ex, type: "approve" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald/15 text-emerald-300 hover:bg-emerald/25 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Re-approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </ResponsiveTable>

        {/* Confirm Dialog */}
        <AlertDialog
          open={!!actionExhibitor}
          onOpenChange={(open) => !open && setActionExhibitor(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionExhibitor?.type === "approve" ? "Approve Exhibitor?" : "Reject Exhibitor?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionExhibitor?.type === "approve"
                  ? `This will approve "${actionExhibitor?.exhibitor?.name}" and allow them to be assigned booths.`
                  : `This will reject/suspend "${actionExhibitor?.exhibitor?.name}" and unassign any booths they have.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-border text-muted hover:text-foreground">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAction}
                disabled={actionLoading}
                className="bg-gold text-background hover:opacity-90"
              >
                {actionLoading
                  ? "Processing..."
                  : actionExhibitor?.type === "approve"
                  ? "Approve"
                  : "Reject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminExhibitors;