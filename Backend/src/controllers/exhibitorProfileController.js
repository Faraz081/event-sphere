import ExhibitorApplication from "../models/ExhibitorApplication.js";

const applyForExpo = async (req, res) => {
  try {
    const { companyName, productsServices, description, email, phone, address } = req.body;

    if (!companyName || !productsServices) {
      return res.status(400).json({ error: "Company name and products/services are required" });
    }

    const exists = await ExhibitorApplication.findOne({ userId: req.user._id });
    if (exists) {
      return res.status(409).json({ error: "You have already applied" });
    }

    const logo = req.files?.logo?.[0];
    const docs = req.files?.documents || [];

    const application = await ExhibitorApplication.create({
      userId: req.user._id,
      companyName,
      productsServices,
      description,
      email,
      phone,
      address,
      logo: logo ? `/uploads/${logo.filename}` : "",
      documents: docs.map((f) => `/uploads/${f.filename}`),
    });

    return res.status(201).json({ msg: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const application = await ExhibitorApplication.findOne({ userId: req.user._id });
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
    if (req.file) update.logo = `/uploads/${req.file.filename}`;

    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const application = await ExhibitorApplication.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: "No application found" });
    }
    return res.status(200).json({ msg: "Profile updated successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { applyForExpo, getProfile, updateProfile };