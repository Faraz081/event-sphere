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
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  fetchAttendees,
  createAttendee,
  updateAttendee,
  deleteAttendee,
} from "@/api/attendeeService";
import { fetchUsers } from "@/api/userService";
import { mockExpos } from "@/data/mockData";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  X,
  Ticket,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

// Status Badge styles strictly adhering to existing theme tokens
const registrationStatusStyles = {
  registered: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  attended: "bg-gold/20 text-gold border border-gold/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const bookingStatusStyles = {
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  pending: "bg-gold/20 text-gold border border-gold/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const passStatusStyles = {
  issued: "bg-gold/20 text-gold border border-gold/40",
  claimed: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  scanned: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  revoked: "bg-red-500/20 text-red-300 border border-red-500/30",
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
  userId: "",
  expoId: "",
  eventName: "General Platform Event",
  registrationStatus: "registered",
  bookingStatus: "confirmed",
  passStatus: "issued",
  ticketType: "Standard Pass",
  passCode: "",
  notes: "",
};

const AdminAttendees = () => {
  // State
  const [attendees, setAttendees] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegStatus, setSelectedRegStatus] = useState("all");
  const [selectedBookingStatus, setSelectedBookingStatus] = useState("all");
  const [selectedPassStatus, setSelectedPassStatus] = useState("all");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingAttendeeId, setEditingAttendeeId] = useState(null);
  const [attendeeToView, setAttendeeToView] = useState(null);
  const [attendeeToDelete, setAttendeeToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing users for attendee dropdown selection
  const loadUsersForSelection = useCallback(async () => {
    try {
      const res = await fetchUsers();
      if (res.success && Array.isArray(res.users)) {
        setUsersList(res.users);
      }
    } catch (err) {
      console.error("Failed to load users for attendee selection:", err);
    }
  }, []);

  // Load attendees with search and status filters
  const loadAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedRegStatus !== "all") params.registrationStatus = selectedRegStatus;
      if (selectedBookingStatus !== "all") params.bookingStatus = selectedBookingStatus;
      if (selectedPassStatus !== "all") params.passStatus = selectedPassStatus;

      const res = await fetchAttendees(params);
      if (res.success && Array.isArray(res.attendees)) {
        setAttendees(res.attendees);
      }
    } catch (err) {
      console.error("Failed to load attendees:", err);
      toast.error(err.response?.data?.error || "Failed to load attendees directory.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRegStatus, selectedBookingStatus, selectedPassStatus]);

  // Initial load
  useEffect(() => {
    loadUsersForSelection();
  }, [loadUsersForSelection]);

  // Debounced search & filter load
  useEffect(() => {
    const handler = setTimeout(() => {
      loadAttendees();
    }, 250);
    return () => clearTimeout(handler);
  }, [loadAttendees]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRegStatus("all");
    setSelectedBookingStatus("all");
    setSelectedPassStatus("all");
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingAttendeeId(null);
    setFormData(initialFormState);
    loadUsersForSelection();
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingAttendeeId(item._id);
    setFormData({
      userId: item.user?._id || "",
      expoId: item.expo?._id || "",
      eventName: item.eventName || item.expo?.title || "",
      registrationStatus: item.registrationStatus || "registered",
      bookingStatus: item.bookingStatus || "confirmed",
      passStatus: item.passStatus || "issued",
      ticketType: item.ticketType || "Standard Pass",
      passCode: item.passCode || "",
      notes: item.notes || "",
    });
    setIsFormModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (item) => {
    setAttendeeToView(item);
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

    if (!editingAttendeeId && !formData.userId) {
      toast.error("Please select a User account to associate with this attendee record.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAttendeeId) {
        // Edit existing attendee
        const payload = {
          registrationStatus: formData.registrationStatus,
          bookingStatus: formData.bookingStatus,
          passStatus: formData.passStatus,
          ticketType: formData.ticketType.trim(),
          passCode: formData.passCode.trim(),
          eventName: formData.eventName.trim() || "General Platform Event",
          notes: formData.notes.trim(),
        };

        const res = await updateAttendee(editingAttendeeId, payload);
        toast.success(res.msg || "Attendee record updated successfully.");
      } else {
        // Register new attendee
        const payload = {
          user: formData.userId,
          eventName: formData.eventName.trim() || "General Platform Event",
          registrationStatus: formData.registrationStatus,
          bookingStatus: formData.bookingStatus,
          passStatus: formData.passStatus,
          ticketType: formData.ticketType.trim(),
          passCode: formData.passCode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };

        const res = await createAttendee(payload);
        toast.success(res.msg || "Attendee registered successfully.");
      }

      setIsFormModalOpen(false);
      setEditingAttendeeId(null);
      setFormData(initialFormState);
      loadAttendees();
    } catch (err) {
      console.error("Error saving attendee:", err);
      toast.error(err.response?.data?.error || "Failed to save attendee record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!attendeeToDelete) return;

    try {
      const res = await deleteAttendee(attendeeToDelete._id);
      toast.success(res.msg || "Attendee registration removed successfully.");
      setAttendeeToDelete(null);
      loadAttendees();
    } catch (err) {
      console.error("Error deleting attendee:", err);
      toast.error(err.response?.data?.error || "Failed to delete attendee.");
      setAttendeeToDelete(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8 space-y-6">
        {/* Header & Primary Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-1">
              Attendees
            </h1>
            <p className="text-muted text-sm md:text-base">
              Manage event attendees, registration workflows, booking statuses, and entry passes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-gold text-background font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity self-start sm:self-auto shadow-md shadow-gold/10"
          >
            <UserPlus size={18} />
            <span>Register Attendee</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or pass code..."
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

            {/* Registration Status Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedRegStatus}
                onChange={(e) => setSelectedRegStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              >
                <option value="all">All Registration Statuses</option>
                <option value="registered">Registered</option>
                <option value="confirmed">Confirmed</option>
                <option value="attended">Attended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Booking Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedBookingStatus}
                onChange={(e) => setSelectedBookingStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Pass Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedPassStatus}
                onChange={(e) => setSelectedPassStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              >
                <option value="all">All Pass Statuses</option>
                <option value="issued">Issued</option>
                <option value="claimed">Claimed</option>
                <option value="scanned">Scanned</option>
                <option value="revoked">Revoked</option>
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

          {/* Active Filter Chips */}
          {(searchTerm ||
            selectedRegStatus !== "all" ||
            selectedBookingStatus !== "all" ||
            selectedPassStatus !== "all") && (
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
              {selectedRegStatus !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-0.5 text-foreground capitalize">
                  Registration: {selectedRegStatus}
                  <button type="button" onClick={() => setSelectedRegStatus("all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedBookingStatus !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-0.5 text-foreground capitalize">
                  Booking: {selectedBookingStatus}
                  <button type="button" onClick={() => setSelectedBookingStatus("all")}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedPassStatus !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-0.5 text-foreground capitalize">
                  Pass: {selectedPassStatus}
                  <button type="button" onClick={() => setSelectedPassStatus("all")}>
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

        {/* Attendees Responsive Table */}
        <ResponsiveTable minWidth="860px">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Attendee
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Event / Expo
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Registration
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Booking
              </th>
              <th className="px-6 py-3.5 text-xs text-muted font-semibold uppercase tracking-wider">
                Pass Status
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
                    <p className="text-sm">Loading attendees directory...</p>
                  </div>
                </td>
              </tr>
            ) : attendees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={32} className="text-muted/60" />
                    <p className="font-medium text-foreground">No attendees found</p>
                    <p className="text-xs text-muted">
                      {searchTerm ||
                      selectedRegStatus !== "all" ||
                      selectedBookingStatus !== "all" ||
                      selectedPassStatus !== "all"
                        ? "Try adjusting your search criteria or clearing filters."
                        : "No attendee registrations have been created yet."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              attendees.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-border hover:bg-surface/60 transition-colors last:border-0"
                >
                  {/* Attendee Name & Details */}
                  <td data-label="Attendee" className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-gold font-semibold text-sm">
                        {item.user?.name ? item.user.name[0].toUpperCase() : "A"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-muted truncate font-mono">
                          {item.user?.email || "No email"}
                        </p>
                        {item.user?.phone && (
                          <p className="text-xs text-muted/80 truncate font-mono">
                            {item.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Event / Expo */}
                  <td data-label="Event" className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gold shrink-0" />
                      <span className="truncate">
                        {item.eventName || item.expo?.title || "General Platform Event"}
                      </span>
                    </div>
                    {item.ticketType && (
                      <p className="text-xs text-muted pl-5 font-mono">{item.ticketType}</p>
                    )}
                  </td>

                  {/* Registration Status */}
                  <td data-label="Registration" className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        registrationStatusStyles[item.registrationStatus] || "bg-muted/20 text-muted"
                      }`}
                    >
                      {item.registrationStatus}
                    </span>
                  </td>

                  {/* Booking Status */}
                  <td data-label="Booking" className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        bookingStatusStyles[item.bookingStatus] || "bg-muted/20 text-muted"
                      }`}
                    >
                      {item.bookingStatus}
                    </span>
                  </td>

                  {/* Pass Status & Pass Code */}
                  <td data-label="Pass" className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          passStatusStyles[item.passStatus] || "bg-muted/20 text-muted"
                        }`}
                      >
                        {item.passStatus}
                      </span>
                      {item.passCode && (
                        <span className="text-xs text-muted font-mono flex items-center gap-1">
                          <Ticket size={12} className="text-gold" />
                          {item.passCode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Registered Date */}
                  <td
                    data-label="Registered Date"
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
                        title="View Attendee"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-muted hover:text-gold hover:bg-surface transition-colors"
                        title="Edit Attendee"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendeeToDelete(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-muted hover:text-red-400 hover:bg-surface transition-colors"
                        title="Delete Attendee"
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

        {/* View Attendee Modal */}
        {isViewModalOpen && attendeeToView && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold font-bold text-lg">
                    {attendeeToView.user?.name ? attendeeToView.user.name[0].toUpperCase() : "A"}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {attendeeToView.user?.name || "Attendee Profile"}
                    </h2>
                    <p className="text-xs text-muted font-mono">{attendeeToView._id}</p>
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
                  <p className="font-mono text-foreground break-all">
                    {attendeeToView.user?.email || "—"}
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Phone size={13} className="text-gold" />
                    Phone
                  </p>
                  <p className="font-mono text-foreground">
                    {attendeeToView.user?.phone || "Not provided"}
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Registration Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${
                      registrationStatusStyles[attendeeToView.registrationStatus] ||
                      "bg-muted/20 text-muted"
                    }`}
                  >
                    {attendeeToView.registrationStatus}
                  </span>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Booking Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${
                      bookingStatusStyles[attendeeToView.bookingStatus] || "bg-muted/20 text-muted"
                    }`}
                  >
                    {attendeeToView.bookingStatus}
                  </span>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Pass Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${
                      passStatusStyles[attendeeToView.passStatus] || "bg-muted/20 text-muted"
                    }`}
                  >
                    {attendeeToView.passStatus}
                  </span>
                </div>

                <div className="bg-background border border-border rounded-xl p-3">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Ticket size={13} className="text-gold" />
                    Pass Code
                  </p>
                  <p className="font-mono text-gold font-semibold">
                    {attendeeToView.passCode || "None issued"}
                  </p>
                </div>

                <div className="bg-background border border-border rounded-xl p-3 sm:col-span-2">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gold" />
                    Associated Event / Expo
                  </p>
                  <p className="text-foreground font-medium">
                    {attendeeToView.eventName ||
                      attendeeToView.expo?.title ||
                      "General Platform Event"}
                  </p>
                  {attendeeToView.ticketType && (
                    <p className="text-xs text-muted mt-0.5">
                      Pass Type: {attendeeToView.ticketType}
                    </p>
                  )}
                </div>

                <div className="bg-background border border-border rounded-xl p-3 sm:col-span-2">
                  <p className="text-xs text-muted mb-1">Registered Date</p>
                  <p className="font-mono text-foreground">
                    {formatDate(attendeeToView.createdAt)} (
                    {new Date(attendeeToView.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </p>
                </div>

                {attendeeToView.notes && (
                  <div className="bg-background border border-border rounded-xl p-3 sm:col-span-2">
                    <p className="text-xs text-muted mb-1">Internal Notes</p>
                    <p className="text-foreground text-xs">{attendeeToView.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(attendeeToView);
                  }}
                  className="inline-flex items-center gap-2 border border-border bg-background text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
                >
                  <Edit2 size={14} />
                  Edit Attendee
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

        {/* Add / Edit Attendee Form Modal */}
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50 my-8">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {editingAttendeeId ? "Edit Attendee Registration" : "Register New Attendee"}
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
                {/* Associated User Account */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    User Account *
                  </label>
                  {editingAttendeeId ? (
                    <input
                      type="text"
                      disabled
                      value={
                        usersList.find((u) => u._id === formData.userId)?.name ||
                        "Selected User Account"
                      }
                      className="w-full bg-background/50 border border-border rounded-xl px-3.5 py-2.5 text-sm text-muted cursor-not-allowed"
                    />
                  ) : (
                    <select
                      name="userId"
                      required
                      value={formData.userId}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">-- Select an Existing User Account --</option>
                      {usersList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email} — {u.role})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Event Association */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Associated Event / Expo
                  </label>
                  <select
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="General Platform Event">General Platform Event</option>
                    {mockExpos.map((expo) => (
                      <option key={expo.id} value={expo.title}>
                        {expo.title} ({expo.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registration & Booking Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Registration Status *
                    </label>
                    <select
                      name="registrationStatus"
                      value={formData.registrationStatus}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="registered">Registered</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="attended">Attended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Booking Status *
                    </label>
                    <select
                      name="bookingStatus"
                      value={formData.bookingStatus}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Pass Status & Pass Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Pass Status *
                    </label>
                    <select
                      name="passStatus"
                      value={formData.passStatus}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="issued">Issued</option>
                      <option value="claimed">Claimed</option>
                      <option value="scanned">Scanned</option>
                      <option value="revoked">Revoked</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Pass Code (Optional)
                    </label>
                    <input
                      name="passCode"
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={formData.passCode}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                {/* Ticket Type & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Ticket Type
                    </label>
                    <input
                      name="ticketType"
                      type="text"
                      placeholder="e.g. Standard Pass, VIP"
                      value={formData.ticketType}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Notes
                    </label>
                    <input
                      name="notes"
                      type="text"
                      placeholder="Optional internal remarks"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
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
                      : editingAttendeeId
                      ? "Update Attendee"
                      : "Register Attendee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog
          open={!!attendeeToDelete}
          onOpenChange={(open) => !open && setAttendeeToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Attendee Record?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the registration record for{" "}
                <span className="text-foreground font-semibold">
                  "{attendeeToDelete?.user?.name || "this attendee"}"
                </span>{" "}
                and revoke their pass ({attendeeToDelete?.passCode || "N/A"}). This action
                cannot be undone.
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
                Delete Attendee
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminAttendees;
