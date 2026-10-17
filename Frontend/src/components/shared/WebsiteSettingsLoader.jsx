import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWebsiteSettings } from "@/store/slices/websiteSettingsSlice";

export default function WebsiteSettingsLoader() {
  const dispatch = useDispatch();
  const { settings, loaded } = useSelector((state) => state.websiteSettings);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchWebsiteSettings());
    }
  }, [dispatch, loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    document.title = settings?.websiteName?.trim() || "";

    const faviconUrl = settings?.favicon?.trim();
    let favicon = document.querySelector('link[rel="icon"]');

    if (!faviconUrl) {
      favicon?.remove();
      return;
    }

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = faviconUrl;
  }, [loaded, settings]);

  return null;
}