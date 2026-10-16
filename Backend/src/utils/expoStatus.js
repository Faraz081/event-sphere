const DAY_MS = 24 * 60 * 60 * 1000;

export const isExpoEnded = (expo) =>
  !expo ||
  expo.status === "completed" ||
  expo.status === "cancelled" ||
  new Date(expo.date).getTime() + DAY_MS < Date.now();

export const isExpoOpenForExhibitors = (expo) =>
  expo?.status === "published" && !isExpoEnded(expo);