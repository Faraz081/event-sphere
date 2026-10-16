const DAY_MS = 24 * 60 * 60 * 1000;

export const getExpoEndedLabel = (expo) => {
  if (!expo || typeof expo === "string") return expo ? null : "Expo removed";
  if (expo.status === "cancelled") return "Expo cancelled";
  if (expo.status === "completed") return "Expo completed";
  if (expo.date && new Date(expo.date).getTime() + DAY_MS < Date.now()) return "Expo ended";
  return null;
};