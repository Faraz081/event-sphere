const DAY_MS = 24 * 60 * 60 * 1000;

// Completed/cancelled, or the date has passed (1-day grace so a same-day expo isn't "ended" at 9am).
export const isExpoEnded = (expo) =>
  !expo ||
  expo.status === "completed" ||
  expo.status === "cancelled" ||
  new Date(expo.date).getTime() + DAY_MS < Date.now();

// Exhibitors can reserve only when the expo is published AND not ended.
export const isExpoOpenForExhibitors = (expo) =>
  expo?.status === "published" && !isExpoEnded(expo);