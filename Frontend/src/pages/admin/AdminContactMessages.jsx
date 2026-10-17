import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Inbox, Mail, Phone, RotateCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { fetchContactMessages } from "@/api/contactService";
import DashboardLayout from "@/layouts/DashboardLayout";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const formatShortDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—"
    : date.toLocaleDateString(undefined, { dateStyle: "medium" });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="contact-message-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold">
              Contact message
            </p>
            <h2 id="contact-message-title" className="break-words text-xl font-semibold text-foreground">
              {message.subject || "No subject"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Submitted {formatDate(message.createdAt)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close message details" className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Name</dt>
            <dd className="mt-1 break-words text-sm font-medium text-foreground">{message.name}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-1 break-all text-sm text-foreground">{message.email}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Phone</dt>
            <dd className="mt-1 break-words text-sm text-foreground">{message.phone || "—"}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Subject</dt>
            <dd className="mt-1 break-words text-sm text-foreground">{message.subject || "—"}</dd>
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

const MessagePreview = ({ message }) => (
  <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-5 text-muted">
    {message}
  </p>
);

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredMessages = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!query) return messages;

    return messages.filter((message) =>
      [message.name, message.email, message.phone, message.subject]
        .some((value) => value?.toLocaleLowerCase().includes(query)),
    );
  }, [messages, searchTerm]);

  const hasSearch = Boolean(searchTerm.trim());
  const showEmptyState = !loading && !error && filteredMessages.length === 0;

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              Contact Messages
            </h1>
            <p className="mt-2 text-sm text-muted md:text-base">
              Review and respond to messages submitted through Contact Us.
            </p>
          </div>
          <button type="button" onClick={loadMessages} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50">
            <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="mb-5 rounded-xl border border-border bg-surface p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xl">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="search" aria-label="Search contact messages" placeholder="Search by name, email, phone, or subject..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted focus:border-gold focus:outline-none" />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground">
                  <X size={16} />
                </button>
              )}
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
              {loading
                ? "Loading"
                : `${filteredMessages.length} ${
                    filteredMessages.length === 1 ? "message" : "messages"
                  }`}
            </span>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-14 text-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <p className="text-sm">Loading contact messages...</p>
          </div>
        ) : showEmptyState ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-12 text-center">
            {hasSearch ? (
              <Search className="mb-1 text-muted/60" size={32} />
            ) : (
              <Inbox className="mb-1 text-muted/60" size={32} />
            )}
            <p className="font-medium text-foreground">
              {hasSearch ? "No messages found" : "No messages yet"}
            </p>
            <p className="px-4 text-sm text-muted">
              {hasSearch
                ? "Try another name, email, phone number, or subject."
                : "Messages submitted through the Contact Us page will appear here."}
            </p>
          </div>
        ) : error && filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-12 text-center">
            <AlertCircle className="text-muted/60" size={32} />
            <p className="font-medium text-foreground">Messages could not be loaded</p>
            <button type="button" onClick={loadMessages} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-gold hover:text-gold">
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 xl:hidden">
              {filteredMessages.map((message) => (
                <article key={message._id} className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-gold/40 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold text-foreground">{message.name}</h2>
                      <p className="mt-1 break-all text-sm text-muted">{message.email}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedMessage(message)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-gold hover:text-gold">
                      <Eye size={15} />
                      View
                    </button>
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                      Message
                    </p>
                    <MessagePreview message={message.message} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{message.subject || "No subject"}</span>
                    </span>
                    <time className="shrink-0" dateTime={message.createdAt}>
                      {formatShortDate(message.createdAt)}
                    </time>
                  </div>
                  {message.phone && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
                      <Phone size={14} />
                      {message.phone}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface xl:block">
              <table className="w-full table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[21%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="border-b border-border bg-background/60">
                  <tr>
                    {["Name", "Email", "Phone", "Subject", "Message", "Date", "Actions"].map(
                      (label) => (
                        <th key={label} scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted xl:px-4">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={message._id} className="border-b border-border last:border-0 transition-colors hover:bg-background/50">
                      <td className="break-words px-3 py-4 text-sm font-medium text-foreground xl:px-4">
                        {message.name}
                      </td>
                      <td className="break-all px-3 py-4 text-sm text-muted xl:px-4">
                        {message.email}
                      </td>
                      <td className="break-words px-3 py-4 text-sm text-muted xl:px-4">
                        {message.phone || "—"}
                      </td>
                      <td className="break-words px-3 py-4 text-sm text-foreground xl:px-4">
                        {message.subject || "—"}
                      </td>
                      <td className="px-3 py-4 xl:px-4">
                        <MessagePreview message={message.message} />
                      </td>
                      <td className="px-3 py-4 text-xs text-muted xl:px-4">
                        <time dateTime={message.createdAt} title={formatDate(message.createdAt)}>
                          {formatShortDate(message.createdAt)}
                        </time>
                      </td>
                      <td className="px-3 py-4 xl:px-4">
                        <button type="button" onClick={() => setSelectedMessage(message)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-sm font-medium text-foreground transition hover:border-gold hover:text-gold xl:gap-2 xl:px-3">
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {selectedMessage && (
        <ContactMessageDialog message={selectedMessage} onClose={() => setSelectedMessage(null)} />
      )}
    </DashboardLayout>
  );
};

export default AdminContactMessages;
