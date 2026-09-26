import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "@/dashboard/layouts/AdminLayout";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import StatGrid from "@/components/ui/StatGrid";
import StatCard from "@/dashboard/StatCard";
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
  fetchUsers,
  fetchUserStats,
  createUser,
  updateUser,
  deleteUser,
} from "@/api/userService";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  X,
  Shield,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Role & Status Badge Styling adhering to Tailwind v4 theme
const roleBadgeStyles = {
  admin: "bg-gold/20 text-gold border border-gold/40",
  organizer: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  attendee: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  exhibitor: "bg-emerald/20 text-emerald-300 border border-emerald/40",
};

const statusBadgeStyles = {
  active: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  inactive: "bg-muted/20 text-muted border border-muted/30",
  suspended: "bg-red-500/20 text-red-300 border border-red-500/30",
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
  name: "",
  email: "",
  phone: "",
  companyName: "",
  role: "attendee",
  status: "active",
  password: "",
};

const AdminUsers = () => {
  const { user: authUser, currentUser } = useSelector((state) => state.auth);
  const currentLoggedInAdmin = authUser || currentUser;

  // State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    organizers: 0,
    attendees: 0,
    exhibitors: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userToView, setUserToView] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetchUserStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load user stats:", err);
      toast.error(err.response?.data?.error || "Failed to load user statistics.");
    }
  }, []);

  // Load users with search and filters
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedRole !== "all") params.role = selectedRole;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const res = await fetchUsers(params);
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error(err.response?.data?.error || "Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole, selectedStatus]);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Debounced search / filter reload
  useEffect(() => {
    const handler = setTimeout(() => {
      loadUsers();
    }, 250);
    return () => clearTimeout(handler);
  }, [loadUsers]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (user) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      companyName: user.companyName || "",
      role: user.role || "attendee",
      status: user.status || "active",
      password: "", // blank indicates keep existing
    });
    setIsFormModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  // Form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required.");
      return;
    }

    if (!editingUserId && !formData.password) {
      toast.error("Password is required when creating a new user.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUserId) {
        // Edit existing user
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          companyName: formData.companyName.trim(),
          role: formData.role,
          status: formData.status,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await updateUser(editingUserId, payload);
        toast.success(res.msg || "User updated successfully.");
      } else {
        // Create new user
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          companyName: formData.companyName.trim(),
          role: formData.role,
          status: formData.status,
          password: formData.password,
        };

        const res = await createUser(payload);
        toast.success(res.msg || "User created successfully.");
      }

      setIsFormModalOpen(false);
      setEditingUserId(null);
      setFormData(initialFormState);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error(err.response?.data?.error || "Failed to save user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    if (currentLoggedInAdmin?._id && userToDelete._id === currentLoggedInAdmin._id) {
      toast.error("You cannot delete your own currently logged-in account.");
      setUserToDelete(null);
      return;
    }

    try {
      const res = await deleteUser(userToDelete._id);
      toast.success(res.msg || "User deleted successfully.");
      setUserToDelete(null);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data?.error || "Failed to delete user.");
      setUserToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header & Primary Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-1">
              User Management
            </h1>
            <p className="text-muted text-sm md:text-base">
              Manage all platform users, roles, statuses, and account authorizations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-gold text-background font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity self-start sm:self-auto shadow-md shadow-gold/10"
          >
            <UserPlus size={18} />
            <span>Add User</span>
          </button>
        </div>

        {/* Statistics Cards using existing StatGrid & StatCard */}
        <StatGrid>
          <StatCard label="Total Users" value={stats.total} />
          <StatCard label="Total Attendees" value={stats.attendees} />
          <StatCard label="Total Organizers" value={stats.organizers} />
          <StatCard label="Total Exhibitors" value={stats.exhibitors} />
        </StatGrid>

        {/* Search & Filter Controls */}
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="organizer">Organizer</option>
                <option value="attendee">Attendee</option>
                <option value="exhibitor">Exhibitor</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="lg:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset Filters"
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-background text-muted hover:text-foreground hover:bg-surface transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Quick Active Filter Badges */}
          {(searchTerm || selectedRole !== "all" || selectedStatus !== "all") && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted">
              <span>Active Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-0.5 text-foreground">
                  Query: "{searchTerm}"
                  <button type="button" onClick={() => setSearchTerm("")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedRole !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-0.5 text-foreground capitalize">
                  Role: {selectedRole}
                  <button type="button" onClick={() => setSelectedRole("all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedStatus !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-0.5 text-foreground capitalize">
                  Status: {selectedStatus}
                  <button type="button" onClick={() => setSelectedStatus("all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-gold hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <ResponsiveTable minWidth="860px">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Registered Date
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                    <p className="text-sm">Loading users directory...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={32} className="text-muted/60" />
                    <p className="font-medium text-foreground">No users found</p>
                    <p className="text-xs text-muted">
                      {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                        ? "Try adjusting your search criteria or clearing filters."
                        : "No users exist in the platform yet."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-border hover:bg-surface/60 transition-colors last:border-0"
                >
                  {/* Name & Avatar */}
                  <td data-label="User" className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-gold font-semibold text-sm">
                        {item.name ? item.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        {item.companyName && (
                          <p className="text-xs text-muted truncate flex items-center gap-1">
                            <Building2 size={12} />
                            {item.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td
                    data-label="Email"
                    className="px-6 py-4 text-sm text-muted font-mono truncate"
                  >
                    {item.email}
                  </td>

                  {/* Phone */}
                  <td
                    data-label="Phone"
                    className="px-6 py-4 text-sm text-muted font-mono"
                  >
                    {item.phone || "—"}
                  </td>

                  {/* Role */}
                  <td data-label="Role" className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        roleBadgeStyles[item.role] || "bg-muted/20 text-muted"
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td data-label="Status" className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusBadgeStyles[item.status] || "bg-muted/20 text-muted"
                      }`}
                    >
                      {item.status || "active"}
                    </span>
                  </td>

                  {/* Registered Date */}
                  <td
                    data-label="Registered"
                    className="px-6 py-4 text-sm text-muted font-mono"
                  >
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenViewModal(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-muted hover:text-foreground hover:bg-surface transition-colors"
                        title="View User Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-muted hover:text-gold hover:bg-surface transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToDelete(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-muted hover:text-red-400 hover:bg-surface transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </ResponsiveTable>

        {/* View User Modal */}
        {isViewModalOpen && userToView && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold font-bold text-lg">
                    {userToView.name ? userToView.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {userToView.name}
                    </h2>
                    <p className="text-xs text-muted font-mono">{userToView._id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-muted hover:text-foreground hover:bg-background transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Mail size={13} className="text-gold" />
                    Email
                  </p>
                  <p className="font-mono text-foreground break-all">{userToView.email}</p>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Phone size={13} className="text-gold" />
                    Phone
                  </p>
                  <p className="font-mono text-foreground">{userToView.phone || "Not provided"}</p>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Shield size={13} className="text-gold" />
                    Assigned Role
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${
                      roleBadgeStyles[userToView.role] || "bg-muted/20 text-muted"
                    }`}
                  >
                    {userToView.role}
                  </span>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-gold" />
                    Account Status
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${
                      statusBadgeStyles[userToView.status] || "bg-muted/20 text-muted"
                    }`}
                  >
                    {userToView.status || "active"}
                  </span>
                </div>

                <div className="bg-background border border-border rounded-xl p-3 sm:col-span-2">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Building2 size={13} className="text-gold" />
                    Company / Organization
                  </p>
                  <p className="text-foreground">
                    {userToView.companyName || "No organization associated"}
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-3 sm:col-span-2">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gold" />
                    Registered On
                  </p>
                  <p className="font-mono text-foreground">
                    {formatDate(userToView.createdAt)} (
                    {new Date(userToView.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(userToView);
                  }}
                  className="inline-flex items-center gap-2 border border-border bg-background text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
                >
                  <Edit2 size={14} />
                  Edit User
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gold text-background px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit User Form Modal */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50 my-8">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {editingUserId ? "Edit User Account" : "Create New User"}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-muted hover:text-foreground hover:bg-background transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@example.com"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Phone & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="03001234567"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Company / Org
                    </label>
                    <input
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Organization name"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                {/* Role & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      User Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="admin">Admin</option>
                      <option value="organizer">Organizer</option>
                      <option value="attendee">Attendee</option>
                      <option value="exhibitor">Exhibitor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Account Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    {editingUserId
                      ? "Password (Leave blank to keep unchanged)"
                      : "Password (Min. 6 characters) *"}
                  </label>
                  <input
                    name="password"
                    type="password"
                    required={!editingUserId}
                    minLength={editingUserId ? undefined : 6}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      editingUserId
                        ? "Enter new password only if changing"
                        : "Create a secure password"
                    }
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gold text-background font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingUserId
                      ? "Update User"
                      : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={(open) => !open && setUserToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove{" "}
                <span className="text-foreground font-semibold">
                  "{userToDelete?.name}"
                </span>{" "}
                ({userToDelete?.email}) and their permissions. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border border-border text-muted hover:text-foreground">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500/90 text-white hover:bg-red-600 transition-colors"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
