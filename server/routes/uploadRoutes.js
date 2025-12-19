import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/image", requireAuth(), uploadImage);

export default router;
