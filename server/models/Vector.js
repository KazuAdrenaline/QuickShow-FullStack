import mongoose from "mongoose";

const vectorSchema = new mongoose.Schema({
  type: String,       // "movie" | "show"
  refId: String,      // movieId hoặc showId
  content: String,    // mô tả để RAG
  embedding: [Number]
});

export default mongoose.model("Vector", vectorSchema);
