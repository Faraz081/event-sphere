import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { fetchBookmarks, toggleBookmark, toggleExpoBookmark } from "@/store/slices/bookmarkSlice";

// page par ek baar call karo, attendee ke bookmarks load ho jayenge
export const useLoadBookmarks = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loadedFor = useSelector((state) => state.bookmark.loadedFor);
  const userId = user?._id ?? user?.id;

  useEffect(() => {
    if (user?.role === "attendee" && userId && loadedFor !== userId) dispatch(fetchBookmarks(userId));
  }, [dispatch, user, userId, loadedFor]);
};

// <BookmarkButton event={ev} /> ya <BookmarkButton expo={expo} />
const BookmarkButton = ({ event, expo, className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isExpo = !!expo;
  const target = expo ?? event;
  const saved = useSelector((state) =>
    (isExpo ? state.bookmark.expoItems : state.bookmark.items).some((item) => item._id === target._id)
  );

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error(`Please login to bookmark ${isExpo ? "expos" : "events"}`);
      navigate("/login");
      return;
    }

    if (user.role !== "attendee") {
      toast.error("Only attendee accounts can bookmark");
      return;
    }

    const result = await dispatch(isExpo ? toggleExpoBookmark(target) : toggleBookmark(target));

    if (result.type.endsWith("/fulfilled")) {
      toast.success(result.payload.bookmarked ? "Bookmarked" : "Bookmark removed");
    } else {
      toast.error(result.payload?.error || "Could not update bookmark");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove bookmark" : "Add bookmark"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110 ${className}`}
    >
      <Bookmark size={18} className="text-[#c49424]" fill={saved ? "currentColor" : "none"} />
    </button>
  );
};

export default BookmarkButton;