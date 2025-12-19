import express from "express";
import { requireAuth } from "@clerk/express";
import { 
  getMonthlySales,
  getCategoryStats,
  getChannelStats
} from "../controllers/adminChartController.js";

const router = express.Router();

router.get("/sales-monthly", requireAuth(), getMonthlySales);
router.get("/category", requireAuth(), getCategoryStats);
router.get("/channels", requireAuth(), getChannelStats);

export default router;
