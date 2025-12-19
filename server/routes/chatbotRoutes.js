import express from "express";
import { askChatbot, chatbotWelcome } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/ask", askChatbot);     // Chat hỏi – embed + Gemini
router.get("/welcome", chatbotWelcome); // Tự chào

export default router;
