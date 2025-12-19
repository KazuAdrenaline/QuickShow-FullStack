import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";


// API to check if user is admin
export const isAdmin = async (req, res) =>{
    res.json({success: true, isAdmin: true})
}

// API to get dashboard data
export const getDashboardData = async (req, res) =>{
    try {
        const bookings = await Booking.find({isPaid: true});
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie');

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({success: true, dashboardData})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all shows
export const getAllShows = async (req, res) =>{
    try {
        const shows = await Show.find({showDateTime: { $gte: new Date() }}).populate('movie').sort({ showDateTime: 1 })
        res.json({success: true, shows})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) =>{
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({ createdAt: -1 })
        res.json({success: true, bookings })
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}
export async function salesMonthly(req, res) {
  try {
    let result = Array(12).fill(0);

    const bookings = await Booking.find({ isPaid: true }).populate("show");

    bookings.forEach((b) => {
      const month = new Date(b.createdAt).getMonth(); // 0-11
      result[month] += b.amount;
    });

    const chartData = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ].map((name, i) => ({
      name,
      value: result[i]
    }));

    return res.json({ success: true, data: chartData });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}
export async function categoryStats(req, res) {
  try {
    const shows = await Show.find().populate("movie");

    const map = {};

    shows.forEach((s) => {
      const genre = s.movie.genres?.[0] || "Unknown";
      map[genre] = (map[genre] || 0) + s.showPrice;
    });

    const data = Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}
export async function salesByChannel(req, res) {
  try {
    const bookings = await Booking.find({ isPaid: true });

    const map = {};

    bookings.forEach((b) => {
      map[b.channel] = (map[b.channel] || 0) + b.amount;
    });

    const data = Object.keys(map).map(key => ({
      name: key,
      value: map[key]
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
}
