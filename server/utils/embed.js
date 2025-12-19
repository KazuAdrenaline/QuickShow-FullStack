import fetch from "node-fetch";

const KEY = "AIzaSyDiaSIauvjhIvq-F4Lj2Hy0RcQs8q_NY_M";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${KEY}`;

export async function embed(text) {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/embedding-001",
        input: text
      })
    });

    const data = await res.json();

    return data.embedding?.values ?? [];
  } catch (err) {
    console.error("Embedding error:", err);
    return [];
  }
}
