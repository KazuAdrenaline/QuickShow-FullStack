import cloudinary from "../configs/cloudinary.js";

export async function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "replies" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
}
