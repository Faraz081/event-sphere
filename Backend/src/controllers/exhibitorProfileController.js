import mongoose from "mongoose";
import ExhibitorApplication from "../models/ExhibitorApplication.js";
import Expo from "../models/Expo.js";
import cloudinary from "../config/cloudinary.js";

const uploadLogoToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "eventsphere/exhibitor-logos",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(file.buffer);
  });
};

const applyForExpo = async (req, res) => {
  try {
    const { expo, companyName, productsServices, description, email, phone, address } = req.body;

    if (!expo || !companyName || !productsServices) {
      return res.status(400).json({ error: "Expo, company name and products/services are required" });
    }

    if (!mongoose.isValidObjectId(expo) || !(await Expo.exists({ _id: expo }))) {
      return res.status(404).json({ error: "Expo not found" });
    }

    const exists = await ExhibitorApplication.findOne({ userId: req.user._id, expo });

    if (exists) {
      return res.status(409).json({ error: "You have already applied for this expo" });
    }

    const logo = req.files?.logo?.[0];
    const docs = req.files?.documents ?? [];

    let logoUrl = "";

    if (logo) {
      const uploadResult = await uploadLogoToCloudinary(logo);
      logoUrl = uploadResult.secure_url;
    }

    const application = await ExhibitorApplication.create({
      userId: req.user._id,
      expo,
      companyName,
      productsServices,
      description,
      email,
      phone,
      address,
      logo: logoUrl,
      documents: docs.map((f) => `/uploads/${f.filename}`),
    });

    return res.status(201).json({ msg: "Application submitted successfully", application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "You have already applied for this expo" });
    }

    console.error("Apply error:", error);
    res.status(500).json({ error: error.message });
  }
};

// all applications of the logged-in exhibitor
const getMyApplications = async (req, res) => {
  try {
    const applications = await ExhibitorApplication.find({ userId: req.user._id })
      .populate("expo")
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// latest application (ExhibitorProfile page ke liye same shape)
const getProfile = async (req, res) => {
  try {
    const application = await ExhibitorApplication.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({ error: "No application found" });
    }

    return res.status(200).json({ application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { description, email, phone, address } = req.body;
    const update = { description, email, phone, address };

    if (req.file) {
      const uploadResult = await uploadLogoToCloudinary(req.file);
      update.logo = uploadResult.secure_url;
    }

    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const application = await ExhibitorApplication.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true, sort: { createdAt: -1 } }
    );

    if (!application) {
      return res.status(404).json({ error: "No application found" });
    }

    return res.status(200).json({ msg: "Profile updated successfully", application });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

// expos list for the apply dropdown (exhibitor-safe)
const getExpos = async (req, res) => {
  try {
    const expos = await Expo.find().sort({ createdAt: -1 });
    return res.status(200).json({ expos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { applyForExpo, getMyApplications, getProfile, updateProfile, getExpos };