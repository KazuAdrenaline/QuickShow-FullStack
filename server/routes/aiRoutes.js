import express from "express";
import { buildIndex } from "../controllers/aiBuildController.js";
import { askChatbot } from "../controllers/chatbotController.js";

const router = express.Router();

// tạo vector database
router.get("/build-index", buildIndex);

// chatbot query
router.post("/ask", askChatbot);

export default router;
