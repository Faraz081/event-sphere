import crypto from "node:crypto";
import Attendee from "../models/Attendee.js";

export const generatePassCode = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `ESP-${new Date().getFullYear()}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const exists = await Attendee.exists({
      $or: [{ passCode: code }, { entryPassId: code }],
    });
    if (!exists) return code;
  }

  return null;
};
