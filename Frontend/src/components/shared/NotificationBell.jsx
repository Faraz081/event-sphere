import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, BellRing, CheckCircle2, XCircle, MessageSquare, Ticket } from "lucide-react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/store/slices/notificationSlice";

const POLL_MS = 30 * 1000;

const typeStyle = {
  booking_approved: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  ticket_approved: { icon: Ticket, color: "text-emerald-600 bg-emerald-50" },
  booking_rejected: { icon: XCircle, color: "text-rose-600 bg-rose-50" },
  ticket_rejected: { icon: XCircle, color: "text-rose-600 bg-rose-50" },
  reminder: { icon: BellRing, color: "text-[#c49424] bg-[#fff4d9]" },
  message: { icon: MessageSquare, color: "text-sky-600 bg-sky-50" },
};

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;

  return `${Math.floor(mins / (60 * 24))}d ago`;
};

// har notification ki pehchan: id + last update (message wali notification wahi id rakh ke update hoti hai)
const keyOf = (n) => `${n._id}:${n.updatedAt}`;

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { items, unreadCount, loaded } = useSelector((state) => state.notification);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const seenRef = useRef(null);

  const isAttendee = user?.role === "attendee";

  // polling + tab pe wapas aate hi refresh
  useEffect(() => {
    if (!isAttendee) return;

    const refresh = () => dispatch(fetchNotifications());
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dispatch, isAttendee]);

  // nayi notification aaye to toast (pehli load pe nahi)
  useEffect(() => {
    if (!loaded) return;

    const keys = new Set(items.map(keyOf));

    if (seenRef.current === null) {
      seenRef.current = keys;
      return;
    }

    items
      .filter((n) => !n.isRead && !seenRef.current.has(keyOf(n)))
      .forEach((n) => {
        toast(n.title, {
          description: n.message,
          action: {
            label: "View",
            onClick: () => {
              dispatch(markNotificationRead(n._id));
              if (n.link) navigate(n.link);
            },
          },
        });
      });

    seenRef.current = keys;
  }, [items, loaded, dispatch, navigate]);

  // tab ke title mein unread count
  useEffect(() => {
    if (!isAttendee) return;

    const base = document.title.replace(/^\(\d+\)\s/, "");
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;

    return () => {
      document.title = base;
    };
  }, [unreadCount, isAttendee]);

  // bahar click karne pe band
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAttendee) return null;

  const handleClick = (n) => {
    if (!n.isRead) dispatch(markNotificationRead(n._id));
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfc9] bg-white text-[#c49424] shadow-sm transition hover:bg-[#fff4d9]"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-[#eadfc9] bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[#f0e8d8] px-4 py-3">
            <p className="font-serif text-base font-bold text-[#2f2a24]">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="text-xs font-semibold text-[#b48620] hover:text-[#8f6b18]"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!items.length && (
              <p className="px-4 py-10 text-center text-sm text-[#8a8379]">No notifications yet.</p>
            )}

            {items.map((n) => {
              const style = typeStyle[n.type] ?? typeStyle.reminder;
              const Icon = style.icon;

              return (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 border-b border-[#f6f0e3] px-4 py-3 text-left transition hover:bg-[#fffdf9] ${n.isRead ? "" : "bg-[#fff9ec]"}`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.color}`}>
                    <Icon size={15} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-[#2f2a24]">{n.title}</span>
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c49424]" />}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[#5d574f]">{n.message}</span>
                    <span className="mt-1 block text-[10px] text-[#8a8379]">{timeAgo(n.updatedAt ?? n.createdAt)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;