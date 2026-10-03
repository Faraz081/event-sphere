import React, { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
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
  fetchExpos,
  createExpo,
  updateExpo,
  updateExpoStatus,
  deleteExpo,
  uploadExpoBanner,
} from "@/api/expoService";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
} from "lucide-react";
import ResponsiveTable from "@/components/shared/ResponsiveTable";

const statusStyles = {
  draft: "bg-muted/20 text-muted border border-muted/30",
  published: "bg-gold/20 text-gold border border-gold/40",
  completed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const formatDate = (isoDate) => {
  if (!isoDate) return "-";
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return "-";
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const initialFormState = {
  title: "",
  date: "",
  location: "",
  description: "",
  theme: "",
  status: "draft",
  banner: "",
};

const AdminExpos = () => {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 8;

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const fileInputRef = useRef(null);

  // Delete modal state
  const [expoToDelete, setExpoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating inline tracker
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const loadExpos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      const data = await fetchExpos(params);
      setExpos(data.expos || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to load expos";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    loadExpos();
  }, [loadExpos]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must not exceed 5MB");
      return;
    }

    try {
      setUploadingBanner(true);
      const res = await uploadExpoBanner(file);
      if (res?.image?.url) {
        setFormData((prev) => ({ ...prev, banner: res.image.url }));
        toast.success("Banner uploaded successfully");
      } else {
        toast.error("Failed to get uploaded banner URL");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || err.response?.data?.error || "Banner upload failed");
    } finally {
      setUploadingBanner(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveBanner = () => {
    setFormData((prev) => ({ ...prev, banner: "" }));
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expo) => {
    setFormData({
      title: expo.title || "",
      date: expo.date ? expo.date.split("T")[0] : "",
      location: expo.location || "",
      description: expo.description || "",
      theme: expo.theme || "",
      status: expo.status || "draft",
      banner: expo.banner || "",
    });
    setEditingId(expo._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Expo title is required");
      return;
    }
    if (!formData.date) {
      toast.error("Expo date is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Expo location is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Expo description is required");
      return;
    }

    // Future / today date check
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!editingId && selectedDate < today) {
      toast.error("Expo date must be today or in the future");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateExpo(editingId, formData);
        toast.success("Expo updated successfully");
      } else {
        await createExpo(formData);
        toast.success("Expo created successfully");
      }
      closeModal();
      loadExpos();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save expo");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (expoId, newStatus) => {
    try {
      setUpdatingStatusId(expoId);
      await updateExpoStatus(expoId, newStatus);
      toast.success(`Expo status updated to ${newStatus}`);
      setExpos((prev) =>
        prev.map((item) => (item._id === expoId ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update expo status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async () => {
    if (!expoToDelete) return;
    try {
      setDeleting(true);
      await deleteExpo(expoToDelete._id);
      toast.success(`"${expoToDelete.title}" deleted successfully`);
      setExpoToDelete(null);
      // If we deleted the last item on the page, go to prev page if possible
      if (expos.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadExpos();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete expo");
    } finally {
      setDeleting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              Expos
            </h1>
            <p className="text-muted text-sm md:text-base">
              Create and manage your expo events with banners, scheduling, and live status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadExpos}
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
              Create Expo
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search expos by title..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={loadExpos}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg text-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <ResponsiveTable>
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-3 text-sm text-muted font-medium">Expo</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Date</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Location</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-sm text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <RotateCcw size={24} className="animate-spin text-gold" />
                    <span>Loading expos...</span>
                  </div>
                </td>
              </tr>
            ) : expos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Calendar size={36} className="text-muted/50" />
                    <p className="text-base font-medium text-foreground">No expos found</p>
                    <p className="text-sm text-muted max-w-sm">
                      {search || statusFilter !== "all"
                        ? "No expos match your active search or status filter. Try clearing filters."
                        : "No expos have been created yet. Create your first expo to get started."}
                    </p>
                    {search || statusFilter !== "all" ? (
                      <button
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                          setCurrentPage(1);
                        }}
                        className="mt-2 text-sm text-gold hover:underline"
                      >
                        Reset filters
                      </button>
                    ) : (
                      <button
                        onClick={openCreateModal}
                        className="mt-2 inline-flex items-center gap-2 bg-gold text-background font-semibold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
                      >
                        <Plus size={16} />
                        Create First Expo
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              expos.map((expo) => (
                <tr
                  key={expo._id}
                  className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td data-label="Expo" className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {expo.banner ? (
                        <img
                          src={expo.banner}
                          alt={expo.title}
                          className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center text-muted flex-shrink-0">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <div className="text-foreground font-medium">{expo.title}</div>
                        {expo.theme && (
                          <div className="text-xs text-muted mt-0.5">Theme: {expo.theme}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td data-label="Date" className="px-6 py-4 text-muted whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={14} className="text-muted/70" />
                      <span>{formatDate(expo.date)}</span>
                    </div>
                  </td>

                  <td data-label="Location" className="px-6 py-4 text-muted">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin size={14} className="text-muted/70" />
                      <span>{expo.location}</span>
                    </div>
                  </td>

                  <td data-label="Status" className="px-6 py-4">
                    <div className="inline-flex items-center">
                      <select
                        value={expo.status}
                        disabled={updatingStatusId === expo._id}
                        onChange={(e) => handleQuickStatusChange(expo._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors border focus:outline-none ${
                          statusStyles[expo.status] || statusStyles.draft
                        }`}
                        title="Click to change status"
                      >
                        <option value="draft" className="bg-background text-foreground">
                          Draft
                        </option>
                        <option value="published" className="bg-background text-foreground">
                          Published
                        </option>
                        <option value="completed" className="bg-background text-foreground">
                          Completed
                        </option>
                        <option value="cancelled" className="bg-background text-foreground">
                          Cancelled
                        </option>
                      </select>
                    </div>
                  </td>

                  <td data-label="Actions" className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(expo)}
                        className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                        title="Edit Expo"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setExpoToDelete(expo)}
                        className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Expo"
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

        {/* Pagination bar */}
        {!loading && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border text-sm text-muted">
            <div>
              Showing {expos.length} of {totalCount} expos (Page {currentPage} of {totalPages})
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="px-2 text-xs font-medium text-foreground">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingId ? "Edit Expo" : "Create New Expo"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Banner Upload */}
                <div>
                  <label className="block text-sm text-muted mb-1.5">Banner Image</label>
                  {formData.banner ? (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-background">
                      <img
                        src={formData.banner}
                        alt="Expo Banner"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-surface/90 text-foreground px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-surface"
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveBanner}
                          className="bg-red-500/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !uploadingBanner && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-gold/50 bg-background/50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-muted" />
                        <span className="text-sm font-medium text-foreground">
                          {uploadingBanner ? "Uploading banner..." : "Click to upload banner image"}
                        </span>
                        <span className="text-xs text-muted">PNG, JPG or WEBP (Max 5MB)</span>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Future Tech Expo 2026"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the expo event..."
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Date *</label>
                    <input
                      name="date"
                      type="date"
                      min={!editingId ? todayStr : undefined}
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Location *</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Karachi Expo Centre, Hall 1"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Theme</label>
                  <input
                    name="theme"
                    value={formData.theme}
                    onChange={handleInputChange}
                    placeholder="e.g. Artificial Intelligence & Robotics"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-muted hover:text-foreground transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploadingBanner}
                  className="bg-gold text-background font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving..." : editingId ? "Update Expo" : "Create Expo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!expoToDelete}
          onOpenChange={(open) => !open && setExpoToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this expo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{expoToDelete?.title}". Any associated booths or
                schedules will be affected. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleting}
                className="bg-transparent border border-border text-muted hover:text-foreground"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {deleting ? "Deleting..." : "Delete Expo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminExpos;