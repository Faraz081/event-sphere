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
    const settings = await WebsiteSettings.findOneAndUpdate(
      {},
      req.body,
      {
        new: true,
        upsert: true,
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
