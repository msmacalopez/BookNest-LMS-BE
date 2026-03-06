import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const uploadBookCoverController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image file uploaded",
      });
    }

    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const cldStream = cloudinary.uploader.upload_stream(
          {
            folder: "booknest/books",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(cldStream);
      });

    const result = await uploadFromBuffer();

    return res.status(200).json({
      status: "success",
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
