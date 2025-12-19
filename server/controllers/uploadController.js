import cloudinary from "../configs/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body; // base64

    if (!image) {
      return res.json({ success: false, message: "No image provided" });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "comments",  
    });

    res.json({
      success: true,
      url: uploadResult.secure_url, 
    });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Upload failed" });
  }
};
