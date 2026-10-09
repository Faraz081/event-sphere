import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

// event load karo, sirf uska owner aur active exhibitor
const loadMyEvent = async (req, res) => {
  const exhibitor = getMyId(req);
  const { id } = req.params;

  if (!mongoose.isValidObjectId(exhibitor)) { res.status(401).json({ error: "Please login again" }); return null; }
  if (!mongoose.isValidObjectId(id)) { res.status(400).json({ error: "Invalid event ID" }); return null; }

  const user = await User.findById(exhibitor).select("status");
  if (!user || user.status !== "active") { res.status(403).json({ error: "Your account is not active. Please contact the admin" }); return null; }

  const event = await Event.findOne({ _id: id, exhibitor });
  if (!event) { res.status(404).json({ error: "Event not found or not yours" }); return null; }

  return event;
};

const cleanStall = (body) => ({
  stallNumber: body.stallNumber?.trim() ?? "",
  name: body.name?.trim() ?? "",
  size: body.size?.trim() ?? "",
  description: body.description?.trim() ?? "",
});

const isDuplicate = (event, stallNumber, ignoreId) =>
  event.stalls.some((s) => String(s._id) !== String(ignoreId) && s.stallNumber.toLowerCase() === stallNumber.toLowerCase());

const addStall = async (req, res) => {
  try {
    const event = await loadMyEvent(req, res);
    if (!event) return;

    const data = cleanStall(req.body);

    if (!data.stallNumber) return res.status(400).json({ error: "Stall number is required" });

    if (event.stalls.length >= (event.boothCapacity ?? 0)) {
      return res.status(400).json({ error: `Stall capacity reached (${event.boothCapacity})` });
    }

    if (isDuplicate(event, data.stallNumber)) {
      return res.status(409).json({ error: "This stall number already exists in this event" });
    }

    event.stalls.push(data);
    await event.save({ validateModifiedOnly: true });

    return res.status(201).json({ msg: "Stall added", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStall = async (req, res) => {
  try {
    const event = await loadMyEvent(req, res);
    if (!event) return;

    const stall = event.stalls.id(req.params.stallId);
    if (!stall) return res.status(404).json({ error: "Stall not found" });

    const data = cleanStall(req.body);

    if (!data.stallNumber) return res.status(400).json({ error: "Stall number is required" });

    if (isDuplicate(event, data.stallNumber, stall._id)) {
      return res.status(409).json({ error: "This stall number already exists in this event" });
    }

    stall.set(data);
    await event.save({ validateModifiedOnly: true });

    return res.status(200).json({ msg: "Stall updated", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStall = async (req, res) => {
  try {
    const event = await loadMyEvent(req, res);
    if (!event) return;

    const stall = event.stalls.id(req.params.stallId);
    if (!stall) return res.status(404).json({ error: "Stall not found" });

    const inUse = await Attendee.exists({
      event: event._id,
      stalls: stall._id,
      bookingStatus: { $in: ["pending", "confirmed"] },
    });

    if (inUse) {
      return res.status(409).json({ error: "This stall has an active booking request, so it cannot be deleted" });
    }

    event.stalls.pull({ _id: stall._id });
    await event.save({ validateModifiedOnly: true });

    return res.status(200).json({ msg: "Stall deleted", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { addStall, updateStall, deleteStall };