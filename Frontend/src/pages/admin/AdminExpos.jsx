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
  fetchExpos,
  createExpo,
  updateExpo,
  deleteExpo,
} from "@/api/expoService";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, X, RotateCcw, AlertCircle } from "lucide-react";

const statusStyles = {
  draft: "bg-muted/20 text-muted border border-muted/30",
  published: "bg-gold/20 text-gold border border-gold/40",
  completed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-US", {
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
};

const AdminExpos = () => {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expoToDelete, setExpoToDelete] = useState(null);

  const loadExpos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();

      const data = await fetchExpos(params);
      setExpos(data.expos || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load expos");
      toast.error("Failed to load expos");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadExpos();
  }, [loadExpos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.title.trim() || !formData.date || !formData.location.trim() || !formData.description.trim()) {
      toast.error("Title, date, location and description are required");
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

  const handleDelete = async () => {
    if (!expoToDelete) return;
    try {
      await deleteExpo(expoToDelete._id);
      toast.success(`"${expoToDelete.title}" deleted successfully`);
      setExpoToDelete(null);
      loadExpos();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete expo");
    }
  };

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
              Create and manage your expo events.
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

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search expos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
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
              <th className="px-6 py-3 text-sm text-muted font-medium">Title</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Date</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Location</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-sm text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  Loading expos...
                </td>
              </tr>
            ) : expos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
                  No expos found. Create your first expo.
                </td>
              </tr>
            ) : (
              expos.map((expo) => (
                <tr key={expo._id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td data-label="Title" className="px-6 py-4 text-foreground font-medium">
                    {expo.title}
                  </td>
                  <td data-label="Date" className="px-6 py-4 text-muted">
                    {formatDate(expo.date)}
                  </td>
                  <td data-label="Location" className="px-6 py-4 text-muted">
                    {expo.location}
                  </td>
                  <td data-label="Status" className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyles[expo.status] || statusStyles.draft
                      }`}
                    >
                      {expo.status}
                    </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(expo)}
                        className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setExpoToDelete(expo)}
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

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingId ? "Edit Expo" : "Create New Expo"}
                </h2>
                <button onClick={closeModal} className="text-muted hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Expo Title"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Short description..."
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Date *</label>
                    <input
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
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
                    placeholder="e.g. Karachi Expo Centre"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Theme</label>
                  <input
                    name="theme"
                    value={formData.theme}
                    onChange={handleInputChange}
                    placeholder="e.g. Technology, Health..."
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
                  {saving ? "Saving..." : editingId ? "Update Expo" : "Create Expo"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!expoToDelete} onOpenChange={(open) => !open && setExpoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this expo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{expoToDelete?.title}". This action cannot be undone.
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

export default AdminExpos;