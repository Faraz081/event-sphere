import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Eye, Inbox, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { fetchContactMessages } from "@/api/contactService";
import DashboardLayout from "@/layouts/DashboardLayout";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const ContactMessageDialog = ({ message, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-message-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="contact-message-title" className="text-xl font-semibold text-foreground">
              {message.subject || "Contact message"}
            </h2>
            <p className="mt-1 text-sm text-muted">Submitted {formatDate(message.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message details"
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Name</dt>
            <dd className="mt-1 text-sm text-foreground">{message.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-1 break-all text-sm text-foreground">{message.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Phone</dt>
            <dd className="mt-1 text-sm text-foreground">{message.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Subject</dt>
            <dd className="mt-1 text-sm text-foreground">{message.subject || "—"}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Message</h3>
          <p className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
            {message.message}
          </p>
        </div>
      </section>
    </div>
  );
};

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchContactMessages();
      setMessages(data.messages ?? []);
    } catch (loadError) {
      const message =
        loadError.response?.data?.error || "Failed to load contact messages";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              Contact Messages
            </h1>
            <p className="mt-2 text-sm text-muted md:text-base">
              Messages submitted from the public Contact Us page.
            </p>
          </div>
          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-muted">Loading contact messages...</p>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface py-12 text-center text-muted">
            <Inbox className="mx-auto mb-2 opacity-40" size={32} />
            No messages yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="border-b border-border bg-background/60">
                <tr>
                  {["Name", "Email", "Phone", "Subject", "Message", "Date", "Actions"].map((label) => (
                    <th key={label} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 text-sm font-medium text-foreground">{message.name}</td>
                    <td className="max-w-48 truncate px-4 py-4 text-sm text-muted">{message.email}</td>
                    <td className="px-4 py-4 text-sm text-muted">{message.phone || "—"}</td>
                    <td className="max-w-48 truncate px-4 py-4 text-sm text-foreground">{message.subject || "—"}</td>
                    <td className="max-w-64 truncate px-4 py-4 text-sm text-muted">{message.message}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-muted">{formatDate(message.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedMessage(message)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:border-gold hover:text-gold"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedMessage && (
        <ContactMessageDialog
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminContactMessages;
