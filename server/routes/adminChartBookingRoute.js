import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// 📌 DAILY BOOKINGS (7 ngày gần nhất)
router.get("/daily", async (req, res) => {
  try {
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);

    const data = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last7 },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%m/%d", date: "$createdAt" },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// 📌 ORDER STATUS DISTRIBUTION (tính theo isPaid)
router.get("/status", async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $group: {
          _id: "$isPaid",
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = [
      { name: "Pending", value: data.find(x => x._id === false)?.count || 0 },
      { name: "Paid", value: data.find(x => x._id === true)?.count || 0 },
    ];

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

export default router;
