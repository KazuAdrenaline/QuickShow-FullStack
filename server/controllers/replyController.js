import Comment from "../models/Comment.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { clerkClient } from "@clerk/express";
import { classifyComment } from "../utils/sentiment.js";
import { v4 as uuidv4 } from "uuid";

import { uploadBufferToCloudinary } from "../utils/uploadBuffer.js";

/* ======================================================
   📌 ADD REPLY (1 IMAGE ONLY)
====================================================== */
export async function replyComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content, lang = "vi" } = req.body;
    const { userId } = req.auth();

    let imageUrl = null;

    // req.file ONLY works when using upload.single()
    if (req.file) {
      imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const user = await clerkClient.users.getUser(userId);
    const sentiment = await classifyComment(content);

    const hiddenText =
      lang === "vi"
        ? "**** (Phản hồi đã bị ẩn vì tiêu cực)"
        : "**** (Reply hidden due to negativity)";

    // PUSH đầy đủ field
    comment.replies.push({
      _id: uuidv4(),
      userId,
      userName: user.fullName,
      userImage: user.imageUrl,
      content: sentiment === "negative" ? hiddenText : content,
      originalContent: content,
      sentiment,
      imageUrl,
      createdAt: new Date(),
      likes: [],
      dislikes: []
    });

    await comment.save();

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}

/* ======================================================
   📌 UPDATE REPLY (1 IMAGE ONLY)
====================================================== */
export async function updateReply(req, res) {
  try {
    const { commentId, replyId } = req.params;
    const { content, lang = "vi" } = req.body;
    const { userId } = req.auth();

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const reply = comment.replies.find((r) => r._id === replyId);
    if (!reply) return res.json({ success: false });

    if (reply.userId !== userId)
      return res.json({ success: false, message: "Not authorized" });

    let imageUrl = reply.imageUrl;

    if (req.file) {
      imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    }

    const sentiment = await classifyComment(content);

    reply.originalContent = content;
    reply.sentiment = sentiment;
    reply.content =
      sentiment === "negative"
        ? lang === "vi"
          ? "**** (Phản hồi đã bị ẩn vì tiêu cực)"
          : "**** (Reply hidden due to negativity)"
        : content;

    reply.imageUrl = imageUrl;

    await comment.save();

    return res.json({
      success: true,
      message:
        lang === "vi" ? "Cập nhật phản hồi thành công!" : "Reply updated!"
    });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}

/* ======================================================
   📌 DELETE REPLY
====================================================== */
export async function deleteReply(req, res) {
  try {
    const { commentId, replyId } = req.params;
    const { userId } = req.auth();

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const reply = comment.replies.find((r) => r._id === replyId);
    if (!reply) return res.json({ success: false });

    if (reply.userId !== userId)
      return res.json({ success: false, message: "Not authorized" });

    comment.replies = comment.replies.filter((r) => r._id !== replyId);

    await comment.save();
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}

/* ======================================================
   📌 LIKE / DISLIKE
====================================================== */
export async function likeReply(req, res) {
  try {
    const { commentId, replyId } = req.params;
    const { userId } = req.auth();

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const reply = comment.replies.find((r) => r._id === replyId);
    if (!reply) return res.json({ success: false });

    reply.dislikes = reply.dislikes.filter((id) => id !== userId);

    if (reply.likes.includes(userId)) {
      reply.likes = reply.likes.filter((id) => id !== userId);
    } else {
      reply.likes.push(userId);
    }

    await comment.save();
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}

export async function dislikeReply(req, res) {
  try {
    const { commentId, replyId } = req.params;
    const { userId } = req.auth();

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const reply = comment.replies.find((r) => r._id === replyId);
    if (!reply) return res.json({ success: false });

    reply.likes = reply.likes.filter((id) => id !== userId);

    if (reply.dislikes.includes(userId)) {
      reply.dislikes = reply.dislikes.filter((id) => id !== userId);
    } else {
      reply.dislikes.push(userId);
    }

    await comment.save();
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}
