import cloudinary from "../config/cloudinary.js";

const getPublicIdFromCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const uploadMarker = "/upload/";

    const uploadIndex = url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    let path = url.substring(uploadIndex + uploadMarker.length);

    const parts = path.split("/");

    if (parts[0] && /^v\d+$/.test(parts[0])) {
      parts.shift();
    }

    path = parts.join("/");

    const lastDot = path.lastIndexOf(".");

    if (lastDot !== -1) {
      path = path.substring(0, lastDot);
    }

    return path;
  } catch (error) {
    console.error("Failed to extract Cloudinary public ID:", error);
    return null;
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        msg: "Image file is required",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "eventsphere/website",
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

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      msg: "Image uploaded successfully",
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return res.status(500).json({
      msg: "Image upload failed",
      error: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { url, publicId } = req.body;

    let imagePublicId = publicId;

    if (!imagePublicId && url) {
      imagePublicId = getPublicIdFromCloudinaryUrl(url);
    }

    if (!imagePublicId) {
      return res.status(400).json({
        msg: "Image information is required",
      });
    }

    const deleteResult = await cloudinary.uploader.destroy(imagePublicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (
      deleteResult.result !== "ok" &&
      deleteResult.result !== "not found"
    ) {
      return res.status(400).json({
        msg: "Cloudinary could not delete the image",
        result: deleteResult.result,
      });
    }

    return res.status(200).json({
      msg: "Image deleted successfully",
      result: deleteResult.result,
    });
  } catch (error) {
    console.error("Image delete error:", error);

    return res.status(500).json({
      msg: "Image delete failed",
      error: error.message,
    });
  }
};

export { uploadImage, deleteImage };