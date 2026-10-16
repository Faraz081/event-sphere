import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import websiteDefaults from "@/data/websiteDefaults";
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

    document.title =
      settings?.websiteName?.trim() || websiteDefaults.websiteName;

    const faviconUrl = settings?.favicon?.trim() || websiteDefaults.favicon;
    let favicon = document.querySelector('link[rel="icon"]');

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = faviconUrl;
  }, [loaded, settings]);

  return null;
}
