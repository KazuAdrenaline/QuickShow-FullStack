import express from "express";
import { requireAuth } from "@clerk/express";

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
router.post("/add", requireAuth(), addComment);
router.get("/:movieId", getComments);
router.put("/:commentId", requireAuth(), updateComment);
router.delete("/:commentId", requireAuth(), deleteComment);
router.post("/:commentId/like", requireAuth(), likeComment);
router.post("/:commentId/dislike", requireAuth(), dislikeComment);

/* REPLY */
router.post("/:commentId/reply", requireAuth(), replyComment);
router.put("/:commentId/reply/:replyId", requireAuth(), updateReply);
router.delete("/:commentId/reply/:replyId", requireAuth(), deleteReply);
router.post("/:commentId/reply/:replyId/like", requireAuth(), likeReply);
router.post("/:commentId/reply/:replyId/dislike", requireAuth(), dislikeReply);

export default router;
