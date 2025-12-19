import fetch from "node-fetch";

const API_KEY = "AIzaSyDiaSIauvjhIvq-F4Lj2Hy0RcQs8q_NY_M";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function classifyComment(text) {
  try {
    const lower = text.toLowerCase();

    // --- RULE 1: Các từ ngữ trung tính nhưng KHÔNG tiêu cực ---
    const softPositive = [
      "tạm", "tạm được", "cũng được", "cũng ổn",
      "ổn", "coi tạm", "xem tạm", "khá ổn", "khá được",
      "ok", "oke", "okela"
    ];
    if (softPositive.some(word => lower.includes(word))) {
      return "positive";
    }

    // --- RULE 2: Nhận diện điểm số ---
    const score = lower.match(/(\d+)\/10/);
    if (score) {
      const val = parseInt(score[1], 10);
      if (val <= 4) return "negative"; 
      return "positive"; // 5–10 là ổn hoặc tốt
    }

    // --- RULE 3: Gọi AI ---
    const prompt = `
      Nhiệm vụ: phân loại cảm xúc bình luận tiếng Việt về phim.
      Chỉ trả về: "positive" hoặc "negative".
      Bình luận: "${text}"
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    const output =
      result?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.trim()
        ?.toLowerCase() || "";

    if (output.includes("negative")) return "negative";

    return "positive";

  } catch (error) {
    console.error("Sentiment Error:", error);
    return "positive"; // fallback an toàn
  }
}
