import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, X } from "lucide-react";
import { addStall, updateStall, deleteStall } from "@/store/slices/eventSlice";

const emptyForm = { stallNumber: "", name: "", size: "", description: "",  price: "" };

const EventStalls = ({ event }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const stalls = event.stalls ?? [];
  const capacity = event.boothCapacity ?? 0;
  const full = stalls.length >= capacity;
  const field = "w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground";

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(false);
  };

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onEdit = (stall) => {
    setEditingId(stall._id);
    setForm({
      stallNumber: stall.stallNumber,
      name: stall.name ?? "",
      size: stall.size ?? "",
      description: stall.description ?? "",
      price: String(stall.price ?? 0),
    });
    setFormOpen(true);
  };

  const onSave = async () => {
    if (!form.stallNumber.trim()) {
      toast.error("Stall number is required");
      return;
    }

    const price = Number(form.price);
    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setBusy(true);

    try {
      const result = editingId? await dispatch(updateStall({ eventId: event._id, stallId: editingId, data: form })) : await dispatch(addStall({ eventId: event._id, data: form }));

      const ok = editingId ? updateStall.fulfilled.match(result) : addStall.fulfilled.match(result);

      if (ok) {
        toast.success(result.payload?.msg || "Saved");
        reset();
      } else {
        toast.error(result.payload?.error || "Could not save stall");
      }
    } catch {
      toast.error("Could not save stall");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (stallId) => {
    if (!window.confirm("Delete this stall?")) return;

    try {
      const result = await dispatch(deleteStall({ eventId: event._id, stallId }));

      if (deleteStall.fulfilled.match(result)) {
        toast.success("Stall deleted");
        if (editingId === stallId) reset();
      } else {
        toast.error(result.payload?.error || "Could not delete stall");
      }
    } catch {
      toast.error("Could not delete stall");
    }
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-medium text-foreground">
        <span>Stalls <span className="font-mono text-gold">({stalls.length}/{capacity})</span></span>
        <ChevronDown size={16} className={`text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {stalls.length === 0 && <p className="text-xs text-muted">No stalls added yet.</p>}

          {stalls.map((s) => (
            <div key={s._id} className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <span className="font-mono text-gold">{s.stallNumber}</span>{s.name ? ` · ${s.name}` : ""}
                </p>
                {s.size && <p className="text-xs text-muted">{s.size}</p>}
                <p className="text-xs text-gold">Rs. {(s.price ?? 0).toLocaleString()}</p>
                {s.description && <p className="mt-1 text-xs text-muted">{s.description}</p>}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button type="button" onClick={() => onEdit(s)} aria-label="Edit stall">
                  <Pencil size={14} className="text-muted hover:text-gold" />
                </button>
                <button type="button" onClick={() => onDelete(s._id)} aria-label="Delete stall">
                  <Trash2 size={14} className="text-muted hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}

          {full ? (
            <p className="text-xs text-gold">Capacity reached. Increase the event capacity to add more stalls.</p>
          ) : (
            <button type="button" onClick={() => setFormOpen(true)} className="flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-sm font-medium text-background">
              <Plus size={14} /> Add stall
            </button>
          )}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => !busy && reset()}>
          <div role="dialog" aria-modal="true" aria-labelledby={`stall-form-title-${event._id}`} className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 id={`stall-form-title-${event._id}`} className="font-semibold text-foreground">{editingId ? "Edit stall" : "Add stall"}</h3>
              <button type="button" onClick={reset} disabled={busy} aria-label="Close stall form" className="rounded p-1 text-muted hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input name="stallNumber" value={form.stallNumber} onChange={onChange} placeholder="Stall no. * (e.g. F1)" className={field} />
              <input name="size" value={form.size} onChange={onChange} placeholder="Size (optional)" className={field} />
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} placeholder="Price (Rs.) *" className={field} />
            </div>
            <input name="name" value={form.name} onChange={onChange} placeholder="Name (e.g. Food Stall)" className={field} />
            <textarea name="description" value={form.description} onChange={onChange} placeholder="Description (optional)" rows={3} className={field} />

            <div className="flex justify-end gap-2">
              <button type="button" onClick={reset} disabled={busy} className="rounded-lg border border-border px-4 py-2 text-sm text-muted">Cancel</button>
              <button type="button" onClick={onSave} disabled={busy} className="flex items-center gap-1 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background disabled:opacity-60">
                <Plus size={14} /> {busy ? "Saving..." : editingId ? "Save" : "Add stall"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStalls;
