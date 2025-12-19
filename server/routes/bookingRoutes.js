import express from "express";
import { createBooking, getOccupiedSeats, checkPurchased } from "../controllers/bookingController.js";
import { requireAuth } from "@clerk/express";

const bookingRouter = express.Router();

// Tạo vé
bookingRouter.post("/create", requireAuth(), createBooking);

// Lấy ghế đã đặt
bookingRouter.get("/seats/:showId", getOccupiedSeats);

// 🔥 Kiểm tra user đã mua vé của movie chưa
bookingRouter.get("/check/:movieId", requireAuth(), checkPurchased);

export default bookingRouter;
