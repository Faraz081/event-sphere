import crypto from "crypto";
import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0/O, 1/I jaisi confusing chars nahi

const randomPart = (len) =>
  Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("");

const generateEntryPassId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `ESP-${new Date().getFullYear()}-${randomPart(8)}`; // e.g. ESP-2026-K7M3Q9XP
    if (!(await Attendee.exists({ entryPassId: candidate }))) return candidate;
  }
  return null;
};

// sirf expo tickets: expo hai, event nahi
const expoTicketFilter = { expo: { $ne: null }, event: null };

const populateTicket = [
  { path: "user", select: "name email phone" },
  { path: "expo", select: "title date location" },
];

// GET /  ?status=pending|confirmed|cancelled
export const getExpoTicketRequests = async (req, res) => {
  try {
    const filter = { ...expoTicketFilter };
    if (req.query.status) filter.bookingStatus = req.query.status;

    const tickets = await Attendee.find(filter).populate(populateTicket).sort({ createdAt: -1 });
    return res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /:id/approve
export const approveExpoTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid ticket ID" });

    const entryPassId = await generateEntryPassId();
    if (!entryPassId) return res.status(503).json({ error: "Could not generate entry pass. Please try again" });

    // atomic: sirf pending ticket approve hoga, double click par dusra pass nahi banega
    const ticket = await Attendee.findOneAndUpdate(
      { _id: id, ...expoTicketFilter, bookingStatus: "pending" },
      {
        $set: {
          bookingStatus: "confirmed",
          registrationStatus: "confirmed",
          passStatus: "issued",
          entryPassId,
          decisionNote: "",
          reviewedAt: new Date(),
        },
      },
      { new: true }
    ).populate(populateTicket);

    if (!ticket) {
      const exists = await Attendee.exists({ _id: id, ...expoTicketFilter });
      return exists
        ? res.status(409).json({ error: "This ticket has already been reviewed" })
        : res.status(404).json({ error: "Ticket not found" });
    }

    return res.status(200).json({ msg: "Ticket approved", ticket });
  } catch (error) {
    if (error.code === 11000) return res.status(503).json({ error: "Entry pass clash, please try again" });
    res.status(500).json({ error: error.message });
  }
};

// PUT /:id/reject  { note }
export const rejectExpoTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body.note?.trim();
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid ticket ID" });
    if (!note) return res.status(400).json({ error: "Please add a reason for rejection" });

    const ticket = await Attendee.findOneAndUpdate(
      { _id: id, ...expoTicketFilter, bookingStatus: "pending" },
      {
        $set: {
          bookingStatus: "cancelled",
          registrationStatus: "cancelled",
          passStatus: "revoked",
          decisionNote: note,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    ).populate(populateTicket);

    if (!ticket) {
      const exists = await Attendee.exists({ _id: id, ...expoTicketFilter });
      return exists
        ? res.status(409).json({ error: "This ticket has already been reviewed" })
        : res.status(404).json({ error: "Ticket not found" });
    }

    return res.status(200).json({ msg: "Ticket rejected", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};