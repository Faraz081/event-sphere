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
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/api/scheduleService";
import { fetchExpos } from "@/api/expoService";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RotateCcw,
  AlertCircle,
  Clock,
  MapPin,
  User,
} from "lucide-react";

const toDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  const pad = (num) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTimeRange = (startIso, endIso) => {
  if (!startIso || !endIso) return "-";
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

  const dateStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startTimeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeStr = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    return (
      <div className="flex flex-col text-xs">
        <span className="text-foreground font-medium">{dateStr}</span>
        <span className="text-muted font-mono">{startTimeStr} - {endTimeStr}</span>
      </div>
    );
  }

  const endDateStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col text-xs">
      <span className="text-foreground font-medium">{dateStr} {startTimeStr}</span>
      <span className="text-muted font-mono">to {endDateStr} {endTimeStr}</span>
    </div>
  );
};

const initialFormState = {
  expo: "",
  title: "",
  speaker: "",
  topic: "",
  location: "",
  startTime: "",
  endTime: "",
};

const MAX_EXPO_SCHEDULE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_SESSION_DURATION_MS = 48 * 60 * 60 * 1000;

const AdminSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedExpoFilter, setSelectedExpoFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const selectedExpo = expos.find((expo) => expo._id === formData.expo);
  const expoStart = selectedExpo?.date ? new Date(selectedExpo.date) : null;
  const expoEnd = expoStart
    ? new Date(expoStart.getTime() + MAX_EXPO_SCHEDULE_WINDOW_MS)
    : null;
  const currentMinute = new Date(Math.ceil(Date.now() / 60000) * 60000);
  const expoStartMinute = expoStart
    ? new Date(Math.ceil(expoStart.getTime() / 60000) * 60000)
    : null;
  const minimumStart = expoStartMinute && expoStartMinute > currentMinute
    ? expoStartMinute
    : currentMinute;
  const selectedStart = formData.startTime ? new Date(formData.startTime) : null;
  const maximumEnd = selectedStart && expoEnd
    ? new Date(Math.min(expoEnd.getTime(), selectedStart.getTime() + MAX_SESSION_DURATION_MS))
    : expoEnd;

  const loadExpos = useCallback(async () => {
    try {
      const data = await fetchExpos({ limit: "all" });
      setExpos(data.expos || []);
    } catch (err) {
      console.error("Failed to load expos for schedule select:", err);
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedExpoFilter && selectedExpoFilter !== "all") {
        params.expo = selectedExpoFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const data = await fetchSchedules(params);
      setSchedules(data.schedules || []);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to load schedules";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [selectedExpoFilter, search]);

  useEffect(() => {
    loadExpos();
  }, [loadExpos]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "expo") {
        return { ...prev, expo: value, startTime: "", endTime: "" };
      }

      if (name === "startTime") {
        const nextStart = new Date(value);
        const currentEnd = prev.endTime ? new Date(prev.endTime) : null;
        const keepEnd = currentEnd && currentEnd > nextStart &&
          currentEnd - nextStart <= MAX_SESSION_DURATION_MS;
        return { ...prev, startTime: value, endTime: keepEnd ? prev.endTime : "" };
      }

      return { ...prev, [name]: value };
    });
  };

  const openCreateModal = () => {
    setFormData({
      ...initialFormState,
      expo: selectedExpoFilter !== "all" ? selectedExpoFilter : (expos[0]?._id || ""),
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (session) => {
    const expoId = session.expo?._id || session.expo || "";
    setFormData({
      expo: expoId,
      title: session.title || "",
      speaker: session.speaker || "",
      topic: session.topic || "",
      location: session.location || "",
      startTime: toDatetimeLocal(session.startTime),
      endTime: toDatetimeLocal(session.endTime),
    });
    setEditingId(session._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSave = async () => {
    if (!formData.expo) {
      toast.error("Please select an expo");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Session title is required");
      return;
    }
    if (!formData.startTime) {
      toast.error("Start time is required");
      return;
    }
    if (!formData.endTime) {
      toast.error("End time is required");
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const expoDate = selectedExpo?.date ? new Date(selectedExpo.date) : null;

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || !expoDate || isNaN(expoDate.getTime())) {
      toast.error("Please provide valid start and end dates/times");
      return;
    }

    if (start < new Date()) {
      toast.error("Session start time cannot be in the past");
      return;
    }
    if (start < expoDate) {
      toast.error("Session cannot start before the selected Expo begins");
      return;
    }
    if (start >= end) {
      toast.error("Start time must be before end time");
      return;
    }
    if (end - start > MAX_SESSION_DURATION_MS) {
      toast.error("A session cannot last longer than 48 hours");
      return;
    }
    if (end > new Date(expoDate.getTime() + MAX_EXPO_SCHEDULE_WINDOW_MS)) {
      toast.error("Session must finish within 30 days of the Expo start");
      return;
    }

    try {
      setSaving(true);
      const scheduleData = {
        ...formData,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
      if (editingId) {
        await updateSchedule(editingId, scheduleData);
        toast.success("Session updated successfully");
      } else {
        await createSchedule(scheduleData);
        toast.success("Session added successfully");
      }
      closeModal();
      loadSchedules();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to save schedule session");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    try {
      setDeleting(true);
      await deleteSchedule(sessionToDelete._id);
      toast.success(`Session "${sessionToDelete.title}" deleted`);
      setSessionToDelete(null);
      loadSchedules();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to delete session");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              Schedule
            </h1>
            <p className="text-muted text-sm md:text-base">
              Manage sessions, keynote speakers, agendas, and time slots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSchedules}
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
              Add Session
            </button>
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search sessions, speakers, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
            />
          </div>

          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted hidden sm:inline">Expo:</span>
            <select
              value={selectedExpoFilter}
              onChange={(e) => setSelectedExpoFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 max-w-xs"
            >
              <option value="all">All Expos</option>
              {expos.map((expo) => (
                <option key={expo._id} value={expo._id}>
                  {expo.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        
        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={loadSchedules}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg text-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

      <div className="space-y-3 md:hidden">
  {loading ? (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface py-10 text-muted">
      <RotateCcw size={24} className="animate-spin text-gold" />
      <span className="text-sm">Loading schedule sessions...</span>
    </div>
  ) : schedules.length === 0 ? (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-4 py-10 text-center">
      <Clock size={36} className="text-muted/50" />
      <p className="text-base font-medium text-foreground">No sessions found</p>
      <p className="text-sm text-muted">
        {search || selectedExpoFilter !== "all"
          ? "No sessions match your search or expo filter. Try changing your filters."
          : "No schedule sessions have been created yet. Add your first session."}
      </p>
      {search || selectedExpoFilter !== "all" ? (
        <button
          onClick={() => {
            setSearch("");
            setSelectedExpoFilter("all");
          }}
          className="text-sm text-gold hover:underline"
        >
          Reset filters
        </button>
      ) : (
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-background"
        >
          <Plus size={16} />
          Add First Session
        </button>
      )}
    </div>
  ) : (
    schedules.map((session) => (
      <div key={session._id} className="rounded-xl border border-border bg-surface p-4">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{session.title}</p>
          {session.topic && <p className="mt-0.5 text-xs text-muted">{session.topic}</p>}
          <p className="mt-1 truncate text-xs text-gold">{session.expo?.title || "-"}</p>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted">
          <div className="flex items-start gap-2">
            <Clock size={12} className="mt-0.5 shrink-0 text-gold" />
            {formatDateTimeRange(session.startTime, session.endTime)}
          </div>
          {session.speaker && (
            <p className="flex items-center gap-2">
              <User size={12} className="shrink-0 text-gold" />
              <span className="truncate">{session.speaker}</span>
            </p>
          )}
          {session.location && (
            <p className="flex items-center gap-2">
              <MapPin size={12} className="shrink-0 text-gold" />
              <span className="truncate">{session.location}</span>
            </p>
          )}
        </div>

        <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => openEditModal(session)}
            title="Edit Session"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted hover:text-gold"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setSessionToDelete(session)}
            title="Delete Session"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    ))
  )}
</div>

        
        <div className="hidden md:block">
        <ResponsiveTable>
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-3 text-sm text-muted font-medium">Session</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Speaker</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Expo</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Time</th>
              <th className="px-6 py-3 text-sm text-muted font-medium">Location</th>
              <th className="px-6 py-3 text-sm text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <RotateCcw size={24} className="animate-spin text-gold" />
                    <span>Loading schedule sessions...</span>
                  </div>
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Clock size={36} className="text-muted/50" />
                    <p className="text-base font-medium text-foreground">No sessions found</p>
                    <p className="text-sm text-muted max-w-sm">
                      {search || selectedExpoFilter !== "all"
                        ? "No sessions match your search or expo filter. Try changing your filters."
                        : "No schedule sessions have been created yet. Add your first session."}
                    </p>
                    {search || selectedExpoFilter !== "all" ? (
                      <button
                        onClick={() => {
                          setSearch("");
                          setSelectedExpoFilter("all");
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
                        Add First Session
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              schedules.map((session) => (
                <tr
                  key={session._id}
                  className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td data-label="Session" className="px-6 py-4">
                    <div className="text-foreground font-medium">{session.title}</div>
                    {session.topic && (
                      <div className="text-xs text-muted mt-0.5">{session.topic}</div>
                    )}
                  </td>

                  <td data-label="Speaker" className="px-6 py-4 text-muted">
                    {session.speaker ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <User size={14} className="text-muted/70" />
                        <span>{session.speaker}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted/60">-</span>
                    )}
                  </td>

                  <td data-label="Expo" className="px-6 py-4 text-muted">
                    <span className="text-sm text-foreground/90 font-medium">
                      {session.expo?.title || "-"}
                    </span>
                  </td>

                  <td data-label="Time" className="px-6 py-4 text-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-muted/70 flex-shrink-0" />
                      {formatDateTimeRange(session.startTime, session.endTime)}
                    </div>
                  </td>

                  <td data-label="Location" className="px-6 py-4 text-muted">
                    {session.location ? (
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin size={14} className="text-muted/70" />
                        <span>{session.location}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted/60">-</span>
                    )}
                  </td>

                  <td data-label="Actions" className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(session)}
                        className="p-2 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                        title="Edit Session"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setSessionToDelete(session)}
                        className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Session"
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
        </div>

        
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingId ? "Edit Session" : "Add New Session"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-muted hover:text-foreground transition-colors"
                >
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
                    required
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  >
                    <option value="" disabled>
                      Select an Expo
                    </option>
                    {expos.map((expo) => (
                      <option key={expo._id} value={expo._id}>
                        {expo.title}
                      </option>
                    ))}
                  </select>
                </div>

                
                <div>
                  <label className="block text-sm text-muted mb-1.5">Session Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Opening Keynote: AI in Global Trade"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>

                
                <div>
                  <label className="block text-sm text-muted mb-1.5">Speaker</label>
                  <input
                    name="speaker"
                    value={formData.speaker}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Ayesha Raza"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>

                
                <div>
                  <label className="block text-sm text-muted mb-1.5">Topic</label>
                  <input
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g. Future of Generative Agents & Automation"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>

                
                <div>
                  <label className="block text-sm text-muted mb-1.5">Location / Room</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Main Hall A, Stage 2"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  />
                </div>

                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Start Time *</label>
                    <input
                      name="startTime"
                      type="datetime-local"
                      min={toDatetimeLocal(minimumStart)}
                      max={expoEnd ? toDatetimeLocal(expoEnd) : undefined}
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">End Time *</label>
                    <input
                      name="endTime"
                      type="datetime-local"
                      min={formData.startTime || (expoStart ? toDatetimeLocal(minimumStart) : undefined)}
                      max={maximumEnd ? toDatetimeLocal(maximumEnd) : undefined}
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                    />
                  </div>
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
                  disabled={saving}
                  className="bg-gold text-background font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving..." : editingId ? "Update Session" : "Add Session"}
                </button>
              </div>
            </div>
          </div>
        )}

        
        <AlertDialog
          open={!!sessionToDelete}
          onOpenChange={(open) => !open && setSessionToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the session "{sessionToDelete?.title}" from the
                schedule. This action cannot be undone.
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
                {deleting ? "Deleting..." : "Delete Session"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminSchedule;
