import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary";
import { isAdmin } from "./adminRoutes";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "annaya-boutique/products",
    });

    res.json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export default router;
