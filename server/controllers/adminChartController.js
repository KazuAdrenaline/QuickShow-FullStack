import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// 🔥 1) Monthly Sales
export const getMonthlySales = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = result.map(r => ({
      name: "Tháng " + r._id,
      value: r.total
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};

// 🔥 2) Category Stats
export const getCategoryStats = async (req, res) => {
  try {
    const result = await Show.aggregate([
      {
        $group: {
          _id: "$movie.genre",
          value: { $sum: 1 }
        }
      }
    ]);

    const formatted = result.map(r => ({
      name: r._id,
      value: r.value
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.json({ success: false });
  }
};

// 🔥 3) Revenue by Channel (dummy nếu mày chưa có)
export const getChannelStats = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        { name: "Website", value: 45000 },
        { name: "Mobile App", value: 35000 },
        { name: "Social Media", value: 15000 }
      ]
    });
  } catch (err) {
    res.json({ success: false });
  }
};
