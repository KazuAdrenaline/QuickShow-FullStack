import Vector from "../models/Vector.js";
import { embed } from "../utils/embed.js";
import { cosineSimilarity } from "../utils/vectorMath.js";
import fetch from "node-fetch";

const GEMINI_KEY = process.env.GOOGLE_API_KEY;

if (!GEMINI_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing in .env");
}

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;


// Bộ từ khóa nhận diện phim
const MOVIE_KEYWORDS = [
  "legend", "a legend",
  "kimetsu", "demon", "slayer",
  "chainsaw", "reze",
  "caramelo",
  "conjuring",
  "princess",
  "frankenstein",
  "jujutsu", "execution",
];
export const chatbotWelcome = async (req, res) => {
  return res.json({
    success: true,
    reply:
      "👋 Xin chào! Mình là **QuickShow Assistant** – trợ lý hỗ trợ đặt vé, xem thông tin phim, lịch chiếu và tất cả câu hỏi về ứng dụng QuickShow.\n\nBạn muốn hỏi về phim nào hoặc cần mình giúp gì không?"
  });
};

export const askChatbot = async (req, res) => {
  const { message } = req.body;
  const lower = message.toLowerCase();

  // 1) embed câu hỏi
  const qVec = await embed(message);

  // 2) lấy vector trong DB
  let items = await Vector.find();

  // 3) fuzzy match theo tên phim/người dùng gõ
  let directMatches = items.filter(v =>
    MOVIE_KEYWORDS.some(k => v.content.toLowerCase().includes(k) &&
      lower.includes(k))
  );

  // 4) similarity ranking
  let ranked = items
    .map(v => ({
      ...v._doc,
      score: cosineSimilarity(qVec, v.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // 5) Ưu tiên phim match theo từ khóa
  if (directMatches.length > 0) {
    ranked = [...directMatches, ...ranked];
  }

  // 6) build context
  const context = ranked
    .map(r => `• ${r.content}`)
    .join("\n");

  // 7) prompt gửi Gemini
  const prompt = `
Bạn là trợ lý QuickShow. Chỉ trả lời dựa trên thông tin sau:

${context}

User hỏi: "${message}"

→ Nếu có dữ liệu thì trả lời chính xác.  
→ Nếu không có,  thì mày bịa ra mà nói dùm tao  
Trả lời rõ ràng, tự nhiên.
  `;

  const resp = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await resp.json();

  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Không có dữ liệu phù hợp.";

  res.json({ success: true, reply });
};
