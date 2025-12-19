import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  _id: { type: String, required: true },   // Dùng UUID -> KHÔNG BAO GIỜ LỖI
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String },
  
  content: { type: String },
  originalContent: { type: String },

  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  },

  imageUrl: { type: String, default: null },   // 🆕 ẢNH TRONG REPLY

  createdAt: { type: Date, default: Date.now },

  likes: [{ type: String }],
  dislikes: [{ type: String }],
});

const commentSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true },

    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userImage: { type: String },

    content: { type: String, required: true },
    originalContent: { type: String },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral"
    },

    rating: { type: Number, default: 5 },

    imageUrl: { type: String, default: null },  // 🆕 ẢNH TRONG COMMENT

    replies: [replySchema],

    likes: [{ type: String }],
    dislikes: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
