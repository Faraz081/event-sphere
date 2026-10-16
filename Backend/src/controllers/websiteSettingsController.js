import WebsiteSettings from "../models/WebsiteSettings.js";

const getWebsiteSettings = async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();

    if (!settings) {
      settings = await WebsiteSettings.create({});
    }

    return res.status(200).json({
      msg: "Website settings fetched successfully",
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const updateWebsiteSettings = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        error: "Website settings must be sent as an object",
      });
    }

    const scalarFields = [
      "websiteName",
      "logo",
      "favicon",
      "tagline",
    ];
    const settingsToUpdate = Object.fromEntries(
      scalarFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    for (const section of ["hero", "about", "contact", "socialLinks", "footer"]) {
      if (!Object.prototype.hasOwnProperty.call(req.body, section)) {
        continue;
      }

      const sectionValues = req.body[section];
      if (!sectionValues || typeof sectionValues !== "object" || Array.isArray(sectionValues)) {
        return res.status(400).json({
          error: `Website settings field "${section}" must be an object`,
        });
      }

      for (const [field, value] of Object.entries(sectionValues)) {
        settingsToUpdate[`${section}.${field}`] = value;
      }
    }

    if (Object.keys(settingsToUpdate).length === 0) {
      return res.status(400).json({
        error: "No editable website settings were provided",
      });
    }

    const settings = await WebsiteSettings.findOneAndUpdate(
      {},
      { $set: settingsToUpdate },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      msg: "Website settings updated successfully",
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export {
  getWebsiteSettings,
  updateWebsiteSettings,
};
