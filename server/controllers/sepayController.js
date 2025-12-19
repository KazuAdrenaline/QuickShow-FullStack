// server/controllers/sepayController.js
import { SePayPgClient } from "sepay-pg-node";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";
/* ============================
   CONFIG
============================ */
const client = new SePayPgClient({
  env: "sandbox",
  merchant_id: "SP-TEST-KN476984",
  secret_key: "spsk_test_JVTTASDxxbKQQVDKGgeiNQAPctMkRTBr",
});

// URL NGROK – BACKEND PUBLIC
const BASE_URL = "https://leporine-semaj-unlimitedly.ngrok-free.dev";

// URL FRONTEND (browser của user)
const FRONTEND_URL = "http://localhost:5173";

/* ============================
   CREATE PAYMENT
============================ */
export const createSePayPayment = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { showId, selectedSeats } = req.body;

    const show = await Show.findById(showId).populate("movie");
    const amount = show.showPrice * selectedSeats.length;

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount,
      bookedSeats: selectedSeats,
      isPaid: false,
    });

    const invoice = "INV-" + booking._id;
    const checkoutURL = client.checkout.initCheckoutUrl();

    const fields = client.checkout.initOneTimePaymentFields({
      operation: "PURCHASE",
      payment_method: "BANK_TRANSFER",
      order_invoice_number: invoice,
      order_amount: amount,
      currency: "VND",
      order_description: `Booking ${booking._id}`,
      success_url: `${BASE_URL}/api/sepay/success`,
      error_url: `${BASE_URL}/api/sepay/error`,
      cancel_url: `${BASE_URL}/api/sepay/cancel`,
    });

    booking.paymentLink = invoice;
    await booking.save();

    res.json({
      success: true,
      checkoutURL,
      fields,
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};
/* ============================
   IPN (SePay gọi về)
============================ */
export const handleIPN = async (req, res) => {
  console.log("📌 IPN RECEIVED:", req.body);

  try {
    const data = req.body;

    if (data.notification_type !== "ORDER_PAID") {
      return res.json({ success: false });
    }

    const invoice = data.order.order_invoice_number;
    const bookingId = invoice.replace("INV-", "");

    await Booking.findByIdAndUpdate(bookingId, {
      isPaid: true,
    });

    console.log("✔ SePay Paid:", bookingId);

    // 🔥 SEND PAYMENT SUCCESS EMAIL
    await inngest.send({
      name: "app/show.paid",
      data: { bookingId },
    });

    return res.json({ success: true });
  } catch (err) {
    console.log("❌ IPN Error:", err);
    res.json({ success: false });
  }
};

export const autoCancelUnpaidBookings = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const bookings = await Booking.find({
      isPaid: false,
      createdAt: { $lte: tenMinutesAgo },
    });

    for (const booking of bookings) {
      console.log("❌ Auto-cancel booking:", booking._id);
      await Booking.findByIdAndDelete(booking._id);
    }
  } catch (err) {
    console.log("AUTO CANCEL ERROR:", err);
  }
};
/* ============================
   CALLBACK ROUTES (redirect to FE)
============================ */
export const paymentSuccess = (req, res) => {
  return res.redirect(`${FRONTEND_URL}/my-bookings?payment=success`);
};

export const paymentError = (req, res) => {
  return res.redirect(`${FRONTEND_URL}/my-bookings?payment=error`);
};

export const paymentCancel = (req, res) => {
  return res.redirect(`${FRONTEND_URL}/my-bookings?payment=cancel`);
};
