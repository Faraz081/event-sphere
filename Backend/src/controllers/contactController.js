import ContactMessage from "../models/ContactMessage.js";

export const createContactMessage = async (req, res) => {
  try {
    const body = req.body ?? {};
    const { name, email, message } = body;
    const phone = body.phone ?? "";
    const subject = body.subject ?? "";

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: "Name, email, and message are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (
      typeof phone !== "string" ||
      typeof subject !== "string" ||
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      phone.trim().length > 40 ||
      subject.trim().length > 200 ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        error: "One or more fields exceed the allowed length",
      });
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully",
      contactMessage,
    });
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return res.status(500).json({ error: "Failed to submit your message" });
  }
};

export const getContactMessages = async (_req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Failed to load contact messages:", error);
    return res.status(500).json({ error: "Failed to load contact messages" });
  }
};
