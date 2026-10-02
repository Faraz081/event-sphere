import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
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
  fetchBooths,
  createBooth,
  updateBooth,
  deleteBooth,
  fetchExposForSelect,
} from "@/api/boothService";
import { fetchExhibitors } from "@/api/exhibitorService";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  AlertCircle,
  Building2,
  UserPlus,
  UserMinus,
  LayoutGrid,
  List,
} from "lucide-react";

const statusStyles = {
  available: "bg-gold/20 text-gold border border-gold/40",
  reserved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  occupied: "bg-muted/20 text-muted border border-muted/30",
};

const statusCardStyles = {
  available: "border-gold/50 bg-gold/5 hover:bg-gold/10",
  reserved: "border-emerald/50 bg-emerald/5 hover:bg-emerald/10",
  occupied: "border-muted/40 bg-muted/5",
};

const initialFormState = {
  expo: "",
  boothNumber: "",
  size: "",
  price: "",
  status: "available",
  location: "",
};

const AdminBooths = () => {
  const [booths, setBooths] = useState([]);
  const [expos, setExpos] = useState([]);
  const [approvedExhibitors, setApprovedExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expoFilter, setExpoFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table | grid

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [boothToDelete, setBoothToDelete] = useState(null);

  const [assignBooth, setAssignBooth] = useState(null);
  const [selectedExhibitor, setSelectedExhibitor] = useState("");
  const [assigning, setAssigning] = useState(false);

  const loadBooths = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (expoFilter !== "all") params.expo = expoFilter;

      const data = await fetchBooths(params);
      setBooths(data.booths || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load booths");
      toast.error("Failed to load booths");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, expoFilter]);

  const loadExpos = async () => {
    try {
      const data = await fetchExposForSelect();
      setExpos(data.expos || []);
    } catch (err) {
      console.error("Failed to load expos:", err);
    }
  };

  const loadApprovedExhibitors = async () => {
    try {
      const data = await fetchExhibitors({ exhibitorStatus: "approved" });
      setApprovedExhibitors(data.exhibitors || []);
    } catch (err) {
      console.error("Failed to load exhibitors:", err);
    }
  };

  useEffect(() => {
    loadExpos();
    loadApprovedExhibitors();
  }, []);

  useEffect(() => {
    loadBooths();
  }, [loadBooths]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (booth) => {
    setFormData({
      expo: booth.expo?._id || booth.expo || "",
      boothNumber: booth.boothNumber || "",
      size: booth.size || "",
      price: booth.price || "",
      status: booth.status || "available",
      location: booth.location || "",
    });
    setEditingId(booth._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSave = async () => {
    if (!formData.expo || !formData.boothNumber.trim()) {
      toast.error("Expo and Booth Number are required");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...formData, price: Number(formData.price) || 0 };
      if (editingId) {
        await updateBooth(editingId, payload);
        toast.success("Booth updated successfully");
      } else {
        await createBooth(payload);
        toast.success("Booth created successfully");
      }
      closeModal();
      loadBooths();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save booth");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!boothToDelete) return;
    try {
      await deleteBooth(boothToDelete._id);
      toast.success(`Booth "${boothToDelete.boothNumber}" deleted`);
      setBoothToDelete(null);
      loadBooths();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete booth");
    }
  };

  const openAssignModal = (booth) => {
    setAssignBooth(booth);
    setSelectedExhibitor("");
  };

  const closeAssignModal = () => {
    setAssignBooth(null);
    setSelectedExhibitor("");
  };

  const handleAssign = async () => {
    if (!selectedExhibitor) {
      toast.error("Please select an exhibitor");
      return;
    }
    try {
      setAssigning(true);
      await updateBooth(assignBooth._id, {
        exhibitor: selectedExhibitor,
        status: "reserved",
      });
      toast.success("Booth assigned successfully");
      closeAssignModal();
      loadBooths();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to assign booth");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (booth) => {
    try {
      await updateBooth(booth._id, { exhibitor: null, status: "available" });
      toast.success(`Booth "${booth.boothNumber}" unassigned`);
      loadBooths();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to unassign booth");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              Booths
            </h1>
            <p className="text-muted text-sm md:text-base">
              Manage booth allocations · Table or Floor grid view
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View toggle */}
            <div className="inline-flex rounded-xl border border-border bg-surface p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "table"
                    ? "bg-gold text-background font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <List size={16} /> Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "grid"
                    ? "bg-gold text-background font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <LayoutGrid size={16} /> Floor
              </button>
            </div>

            <button
              onClick={loadBooths}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-border bg-surface text-muted hover:text-foreground px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-gold text-background font-semibold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              Add Booth
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search booth number, size, location..."
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
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Occupied</option>
          </select>

          <select
            value={expoFilter}
            onChange={(e) => setExpoFilter(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 min-w-[180px]"
          >
            <option value="all">All Expos</option>
            {expos.map((expo) => (
              <option key={expo._id} value={expo._id}>
                {expo.title}
              </option>
            ))}
          </select>
        </div>

        {/* Legend for floor view */}
        {viewMode === "grid" && (
          <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gold/40 border border-gold/60" /> Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald/40 border border-emerald/60" /> Reserved
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-muted/40 border border-muted/60" /> Occupied
            </span>
            <span className="text-muted/80">Tip: Filter by Expo for a clear floor map</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ========== TABLE VIEW ========== */}
        {viewMode === "table" && (
          <ResponsiveTable>
            <thead className="border-b border-border">
              <tr>
                <th className="px-6 py-3 text-sm text-muted font-medium">Booth #</th>
                <th className="px-6 py-3 text-sm text-muted font-medium">Expo</th>
                <th className="px-6 py-3 text-sm text-muted font-medium">Size</th>
                <th className="px-6 py-3 text-sm text-muted font-medium">Price</th>
                <th className="px-6 py-3 text-sm text-muted font-medium">Exhibitor</th>
                <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
                <th className="px-6 py-3 text-sm text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    Loading booths...
                  </td>
                </tr>
              ) : booths.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <Building2 className="mx-auto mb-2 opacity-40" size={32} />
                    No booths found. Create your first booth.
                  </td>
                </tr>
              ) : (
                booths.map((booth) => (
                  <tr key={booth._id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td data-label="Booth #" className="px-6 py-4 text-foreground font-mono font-medium">
                      {booth.boothNumber}
                    </td>
                    <td data-label="Expo" className="px-6 py-4 text-muted">
                      {booth.expo?.title || "—"}
                    </td>
                    <td data-label="Size" className="px-6 py-4 text-muted">
                      {booth.size || "—"}
                    </td>
                    <td data-label="Price" className="px-6 py-4 text-muted">
                      {booth.price ? `$${booth.price}` : "—"}
                    </td>
                    <td data-label="Exhibitor" className="px-6 py-4 text-muted">
                      {booth.exhibitor?.name || booth.exhibitor?.companyName || "—"}
                    </td>
                    <td data-label="Status" className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusStyles[booth.status] || statusStyles.available
                        }`}
                      >
                        {booth.status}
                      </span>
                    </td>
                    <td data-label="Actions" className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {booth.status === "available" ? (
                          <button
                            onClick={() => openAssignModal(booth)}
                            className="p-2 rounded-lg text-muted hover:text-emerald-300 hover:bg-emerald/10 transition-colors"
                            title="Assign Exhibitor"
                          >
                            <UserPlus size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnassign(booth)}
                            className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                            title="Unassign Exhibitor"
                          >
                            <UserMinus size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(booth)}
                          className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setBoothToDelete(booth)}
                          className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </ResponsiveTable>
        )}

        {/* ========== FLOOR / GRID VIEW ========== */}
        {viewMode === "grid" && (
          <div>
            {loading ? (
              <div className="py-16 text-center text-muted">Loading floor plan...</div>
            ) : booths.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <Building2 className="mx-auto mb-2 opacity-40" size={40} />
                <p>No booths to show. Create booths or change filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {booths.map((booth) => (
                  <div
                    key={booth._id}
                    className={`relative rounded-xl border-2 p-3 min-h-[120px] flex flex-col transition-colors ${
                      statusCardStyles[booth.status] || statusCardStyles.available
                    }`}
                  >
                    <div className="font-mono font-bold text-foreground text-lg">
                      {booth.boothNumber}
                    </div>
                    <div className="text-xs text-muted mt-0.5 truncate">
                      {booth.expo?.title || "—"}
                    </div>
                    <div className="text-xs text-muted mt-1 capitalize">
                      {booth.status}
                      {booth.size ? ` · ${booth.size}` : ""}
                    </div>
                    <div className="text-xs text-foreground mt-auto pt-2 truncate">
                      {booth.exhibitor?.name ||
                        booth.exhibitor?.companyName ||
                        "Unassigned"}
                    </div>

                    <div className="flex gap-1 mt-2">
                      {booth.status === "available" ? (
                        <button
                          onClick={() => openAssignModal(booth)}
                          className="flex-1 text-xs py-1 rounded-lg bg-emerald/20 text-emerald-300 hover:bg-emerald/30"
                        >
                          Assign
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnassign(booth)}
                          className="flex-1 text-xs py-1 rounded-lg bg-gold/20 text-gold hover:bg-gold/30"
                        >
                          Unassign
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(booth)}
                        className="px-2 text-xs py-1 rounded-lg bg-surface border border-border text-muted hover:text-foreground"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingId ? "Edit Booth" : "Add New Booth"}
                </h2>
                <button onClick={closeModal} className="text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Expo *</label>
                  <select
                    name="expo"
                    value={formData.expo}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
                  >
                    <option value="">Select Expo</option>
                    {expos.map((expo) => (
                      <option key={expo._id} value={expo._id}>
                        {expo.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Booth Number *</label>
                  <input
                    name="boothNumber"
                    value={formData.boothNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. A-12"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Size</label>
                    <input
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g. 10x10"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Price</label>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Location / Hall</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Hall A, Near Entrance"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gold text-background font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Booth" : "Create Booth"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {assignBooth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Assign Booth {assignBooth.boothNumber}
                </h2>
                <button onClick={closeAssignModal} className="text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted mb-3">
                  Expo:{" "}
                  <span className="text-foreground">{assignBooth.expo?.title || "—"}</span>
                </p>
                <label className="block text-sm text-muted mb-1.5">
                  Select Approved Exhibitor *
                </label>
                <select
                  value={selectedExhibitor}
                  onChange={(e) => setSelectedExhibitor(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
                >
                  <option value="">Choose exhibitor...</option>
                  {approvedExhibitors.length === 0 ? (
                    <option disabled>No approved exhibitors found</option>
                  ) : (
                    approvedExhibitors.map((ex) => (
                      <option key={ex._id} value={ex._id}>
                        {ex.name} {ex.companyName ? `(${ex.companyName})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 rounded-xl text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !selectedExhibitor}
                  className="bg-gold text-background font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Booth"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!boothToDelete}
          onOpenChange={(open) => !open && setBoothToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this booth?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete booth "{boothToDelete?.boothNumber}". This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-border text-muted hover:text-foreground">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-gold text-background hover:opacity-90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminBooths;