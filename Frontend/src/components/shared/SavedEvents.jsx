import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Bookmark, MapPin, CalendarDays, ArrowUpRight, X } from "lucide-react";
import { toggleBookmark, toggleExpoBookmark } from "@/store/slices/bookmarkSlice";
import { useLoadBookmarks } from "@/components/shared/BookmarkButton";
import { API_BASE_URL } from "@/api/api";

const imgUrl = (url) => (!url ? "" : url.startsWith("http") ? url : `${API_BASE_URL}${url}`);

const SavedEvents = () => {
  useLoadBookmarks();

  const dispatch = useDispatch();
  const events = useSelector((state) => state.bookmark.items);
  const expos = useSelector((state) => state.bookmark.expoItems);

  const handleRemove = async (thunk, item) => {
    const result = await dispatch(thunk(item));

    if (result.type.endsWith("/fulfilled")) toast.success("Bookmark removed");
    else toast.error(result.payload?.error || "Could not remove bookmark");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Bookmark size={20} className="text-[#c49424]" />
          <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">Saved Events</h2>
        </div>

        {!events.length && (
          <div className="rounded-3xl border border-dashed border-[#d9c9a3] bg-white/80 p-10 text-center">
            <p className="font-serif text-base font-semibold text-[#2f2a24]">No saved events yet</p>
            <p className="text-xs text-[#736c62]">Tap the bookmark icon on any event to save it here.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div key={ev._id} className="overflow-hidden rounded-2xl border border-[#eadfc9] bg-[#fffdf9] shadow-sm">
              {ev.images?.[0] && <img src={ev.images[0]} alt={ev.title} className="h-36 w-full object-cover" />}

              <div className="space-y-1.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2f2a24]">{ev.title}</h3>
                  <button type="button" onClick={() => handleRemove(toggleBookmark, ev)} aria-label="Remove bookmark">
                    <X size={16} className="text-[#8a8379] hover:text-rose-600" />
                  </button>
                </div>

                {(ev.companyName || ev.exhibitor?.name) && (
                  <p className="text-xs text-[#8d681b]">by {ev.companyName ?? ev.exhibitor?.name}</p>
                )}

                {ev.location && (
                  <p className="flex items-center gap-1.5 text-xs text-[#736c62]">
                    <MapPin size={12} className="text-[#c49424]" />
                    {ev.location}
                  </p>
                )}

                <Link
                  to={`/book-now?event=${ev._id}`}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#c49424] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#b48620]"
                >
                  Book Now <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Bookmark size={20} className="text-[#c49424]" />
          <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">Saved Expos</h2>
        </div>

        {!expos.length && (
          <div className="rounded-3xl border border-dashed border-[#d9c9a3] bg-white/80 p-10 text-center">
            <p className="font-serif text-base font-semibold text-[#2f2a24]">No saved expos yet</p>
            <p className="text-xs text-[#736c62]">Tap the bookmark icon on any expo to save it here.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expos.map((expo) => (
            <div key={expo._id} className="overflow-hidden rounded-2xl border border-[#eadfc9] bg-[#fffdf9] shadow-sm">
              {expo.banner && <img src={imgUrl(expo.banner)} alt={expo.title} className="h-36 w-full object-cover" />}

              <div className="space-y-1.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#2f2a24]">{expo.title}</h3>
                  <button type="button" onClick={() => handleRemove(toggleExpoBookmark, expo)} aria-label="Remove bookmark">
                    <X size={16} className="text-[#8a8379] hover:text-rose-600" />
                  </button>
                </div>

                {expo.date && (
                  <p className="flex items-center gap-1.5 text-xs text-[#736c62]">
                    <CalendarDays size={12} className="text-[#c49424]" />
                    {new Date(expo.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}

                {expo.location && (
                  <p className="flex items-center gap-1.5 text-xs text-[#736c62]">
                    <MapPin size={12} className="text-[#c49424]" />
                    {expo.location}
                  </p>
                )}

                <div className="mt-2 flex gap-2">
                  <Link
                    to={`/expos/${expo._id}`}
                    className="rounded-full border border-[#c49424] px-4 py-2 text-xs font-semibold text-[#8d681b] transition hover:bg-[#fffdf9]"
                  >
                    Details
                  </Link>
                  <Link
                    to={`/book-ticket?expo=${expo._id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#c49424] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#b48620]"
                  >
                    Book Ticket <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedEvents;