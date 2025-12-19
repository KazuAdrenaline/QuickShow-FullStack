import Comment from "../models/Comment.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { clerkClient } from "@clerk/express";
import { classifyComment } from "../utils/sentiment.js";
import { uploadBufferToCloudinary } from "../utils/uploadBuffer.js";

export async function addComment(req, res) {
  try {
    const { movieId, content, rating, lang = "vi" } = req.body;
    const { userId } = req.auth();

    // UPLOAD ẢNH (1 ảnh) 🔥
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    }

    const texts = {
      need_ticket: {
        vi: "Bạn phải mua vé trước khi bình luận.",
        en: "You must purchase a ticket before commenting.",
      },
      added_success: {
        vi: "Đăng bình luận thành công!",
        en: "Comment added successfully!",
      },
      hidden: {
        vi: "**** (Bình luận đã bị ẩn vì tiêu cực)",
        en: "**** (Comment hidden due to negativity)",
      },
    };

    // CHECK PURCHASED
    const shows = await Show.find({ movie: movieId }).select("_id");
    const showIds = shows.map((s) => s._id.toString());

    const purchased = await Booking.findOne({
      user: userId,
      show: { $in: showIds },
    });

    if (!purchased) {
      return res.json({ success: false, message: texts.need_ticket[lang] });
    }

    const user = await clerkClient.users.getUser(userId);
    const sentiment = await classifyComment(content);

    const displayContent =
      sentiment === "negative" ? texts.hidden[lang] : content;

    await Comment.create({
      movieId,
      userId,
      userName: user.fullName,
      userImage: user.imageUrl,
      content: displayContent,
      originalContent: content,
      sentiment,
      rating,
      imageUrl, // 🔥 ẢNH LƯU TỪ CLOUDINARY
    });

    return res.json({ success: true, message: texts.added_success[lang] });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   📌 GET COMMENTS
====================================================== */
export async function getComments(req, res) {
  try {
    const { movieId } = req.params;
    const lang = req.query.lang || "vi";

    const comments = await Comment.find({ movieId }).sort({ createdAt: -1 });

    const mapped = comments.map((c) => ({
      ...c._doc,
      timeText:
        lang === "en"
          ? c.createdAt.toLocaleString("en-US")
          : c.createdAt.toLocaleString("vi-VN"),
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

/* ======================================================
   📌 UPDATE COMMENT (1 IMAGE ONLY)
====================================================== */
export async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content, rating, imageUrl = null, lang = "vi" } = req.body;
    const { userId } = req.auth();

    const texts = {
      updated: {
        vi: "Cập nhật bình luận thành công!",
        en: "Comment updated successfully!",
      },
      hidden: {
        vi: "**** (Bình luận đã bị ẩn vì tiêu cực)",
        en: "**** (Comment hidden due to negativity)",
      },
    };

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const user = await clerkClient.users.getUser(userId);
    const admin = user.privateMetadata?.role === "admin";

    // Only owner or admin
    if (comment.userId !== userId && !admin) {
      return res.json({
        success: false,
        message: "Not authorized",
      });
    }

    const sentiment = await classifyComment(content);
    const displayContent =
      sentiment === "negative" ? texts.hidden[lang] : content;

    comment.originalContent = content;
    comment.content = displayContent;
    comment.sentiment = sentiment;
    comment.rating = rating || comment.rating;

    if (imageUrl !== undefined) {
      comment.imageUrl = imageUrl; // 🔥 UPDATE 1 ẢNH
    }

    await comment.save();

    return res.json({ success: true, message: texts.updated[lang] });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

/* ======================================================
   📌 DELETE COMMENT
====================================================== */
export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    const { userId } = req.auth();
    const { lang = "vi" } = req.query;

    const texts = {
      deleted: {
        vi: "Xoá bình luận thành công!",
        en: "Comment deleted successfully!",
      },
    };

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    const user = await clerkClient.users.getUser(userId);
    const admin = user.privateMetadata?.role === "admin";

    if (comment.userId !== userId && !admin) {
      return res.json({ success: false, message: "Not authorized" });
    }

    await comment.deleteOne();

    return res.json({ success: true, message: texts.deleted[lang] });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

/* ======================================================
   📌 LIKE COMMENT
====================================================== */
export async function likeComment(req, res) {
  try {
    const { commentId } = req.params;
    const { userId } = req.auth();

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    comment.dislikes = comment.dislikes.filter((id) => id !== userId);

    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter((id) => id !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

/* ======================================================
   📌 DISLIKE COMMENT
====================================================== */
export async function dislikeComment(req, res) {
  try {
    const { commentId } = req.params;
    const { userId } = req.auth();

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ success: false });

    comment.likes = comment.likes.filter((id) => id !== userId);

    if (comment.dislikes.includes(userId)) {
      comment.dislikes = comment.dislikes.filter((id) => id !== userId);
    } else {
      comment.dislikes.push(userId);
    }

    await comment.save();
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}
