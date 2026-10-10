import crypto from "crypto";
import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import { notify, PROFILE_LINK } from "../utils/notify.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomPart = (len) =>
  Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("");

const generateEntryPassId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `ESP-${new Date().getFullYear()}-${randomPart(8)}`;
    if (!(await Attendee.exists({ entryPassId: candidate }))) return candidate;
  }
  return null;
};

const populateTicket = [
  { path: "user", select: "name email phone" },
  { path: "expo", select: "title date location" },
  { path: "event", select: "title date" },
];

export const getExpoTicketRequests = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) filter.bookingStatus = req.query.status;
    if (req.query.userId && mongoose.isValidObjectId(req.query.userId)) {
      filter.user = req.query.userId;
    }
    if (req.query.expo && mongoose.isValidObjectId(req.query.expo)) {
      filter.expo = req.query.expo;
    }
    if (req.query.type === "expo") {
      filter.expo = { $ne: null };
      filter.event = null;
    } else if (req.query.type === "event") {
      filter.event = { $ne: null };
    }

    if (req.query.search && req.query.search.trim()) {
      const regex = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { eventName: regex },
        { ticketType: regex },
        { entryPassId: regex },
        { passCode: regex },
      ];
    }

    let tickets = await Attendee.find(filter)
      .populate(populateTicket)
      .sort({ createdAt: -1 });

    if (req.query.search && req.query.search.trim()) {
      const q = req.query.search.trim().toLowerCase();
      tickets = tickets.filter((t) => {
        const name = t.user?.name?.toLowerCase() || "";
        const email = t.user?.email?.toLowerCase() || "";
        const expoTitle = t.expo?.title?.toLowerCase() || "";
        const eventTitle = t.event?.title?.toLowerCase() || "";
        const eventName = t.eventName?.toLowerCase() || "";
        return (
          name.includes(q) ||
          email.includes(q) ||
          expoTitle.includes(q) ||
          eventTitle.includes(q) ||
          eventName.includes(q) ||
          (t.entryPassId || "").toLowerCase().includes(q)
        );
      });
    }

    return res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveExpoTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid ticket ID" });

    const entryPassId = await generateEntryPassId();
    if (!entryPassId) return res.status(503).json({ error: "Could not generate entry pass. Please try again" });

    const ticket = await Attendee.findOneAndUpdate(
      { _id: id, bookingStatus: "pending" },
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
      const exists = await Attendee.exists({ _id: id });
      return exists
        ? res.status(409).json({ error: "This ticket has already been reviewed" })
        : res.status(404).json({ error: "Ticket not found" });
    }

    const name = ticket.expo?.title ?? ticket.event?.title ?? ticket.eventName;

    await notify(ticket.user._id, {
      type: "ticket_approved",
      title: "Ticket approved",
      message: ticket.expo
        ? `Your ticket for "${name}" has been approved. Your entry pass is ready.`
        : `Your booking for "${name}" has been approved.`,
      link: PROFILE_LINK,
    });

    return res.status(200).json({ msg: "Ticket approved", ticket });
  } catch (error) {
    if (error.code === 11000) return res.status(503).json({ error: "Entry pass clash, please try again" });
    res.status(500).json({ error: error.message });
  }
};

export const rejectExpoTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body.note?.trim();
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid ticket ID" });
    if (!note) return res.status(400).json({ error: "Please add a reason for rejection" });

    const ticket = await Attendee.findOneAndUpdate(
      { _id: id, bookingStatus: "pending" },
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
      const exists = await Attendee.exists({ _id: id });
      return exists
        ? res.status(409).json({ error: "This ticket has already been reviewed" })
        : res.status(404).json({ error: "Ticket not found" });
    }

    const name = ticket.expo?.title ?? ticket.event?.title ?? ticket.eventName;

    await notify(ticket.user._id, {
      type: "ticket_rejected",
      title: "Ticket rejected",
      message: `Your ticket for "${name}" was rejected. Reason: ${note}`,
      link: PROFILE_LINK,
    });

    return res.status(200).json({ msg: "Ticket rejected", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelExpoTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body.note?.trim() || "Cancelled by admin";

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    const ticket = await Attendee.findOneAndUpdate(
      {
        _id: id,
        bookingStatus: { $in: ["pending", "confirmed"] },
      },
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
      const exists = await Attendee.exists({ _id: id });
      return exists
        ? res.status(409).json({ error: "Ticket already cancelled or not eligible" })
        : res.status(404).json({ error: "Ticket not found" });
    }

    const name = ticket.expo?.title ?? ticket.event?.title ?? ticket.eventName;

    await notify(ticket.user._id, {
      type: "ticket_rejected",
      title: "Ticket cancelled",
      message: `Your ticket for "${name}" was cancelled. Reason: ${note}`,
      link: PROFILE_LINK,
    });

    return res.status(200).json({ msg: "Ticket cancelled", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};