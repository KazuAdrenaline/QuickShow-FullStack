import express from "express";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload.js";

import {
  replyComment,
  updateReply,
  deleteReply,
  likeReply,
  dislikeReply
} from "../controllers/replyController.js";

const router = express.Router();

router.post(
  "/:commentId/reply",
  requireAuth(),
  upload.single("image"),   // ⭐ ONLY 1 IMAGE
  replyComment
);

router.put(
  "/:commentId/reply/:replyId",
  requireAuth(),
  upload.single("image"),
  updateReply
);

router.delete("/:commentId/reply/:replyId", requireAuth(), deleteReply);

router.post("/:commentId/reply/:replyId/like", requireAuth(), likeReply);
router.post("/:commentId/reply/:replyId/dislike", requireAuth(), dislikeReply);

export default router;
