import express from "express";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload.js";

import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
} from "../controllers/commentController.js";

import {
  replyComment,
  updateReply,
  deleteReply,
  likeReply,
  dislikeReply,
} from "../controllers/replyController.js";

const router = express.Router();

/* COMMENT */
router.post("/add", requireAuth(), upload.single("image"), addComment);
router.get("/:movieId", getComments);
router.put("/:commentId", requireAuth(), upload.single("image"), updateComment);
router.delete("/:commentId", requireAuth(), deleteComment);
router.post("/:commentId/like", requireAuth(), likeComment);
router.post("/:commentId/dislike", requireAuth(), dislikeComment);

/* REPLY */
router.post("/:commentId/reply", requireAuth(), upload.single("image"), replyComment);
router.put("/:commentId/reply/:replyId", requireAuth(), upload.single("image"), updateReply);
router.delete("/:commentId/reply/:replyId", requireAuth(), deleteReply);
router.post("/:commentId/reply/:replyId/like", requireAuth(), likeReply);
router.post("/:commentId/reply/:replyId/dislike", requireAuth(), dislikeReply);

export default router;
