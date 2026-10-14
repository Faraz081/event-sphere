import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

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