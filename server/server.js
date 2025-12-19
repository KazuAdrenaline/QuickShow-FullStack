import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Routers
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import chatbotRouter from "./routes/chatbotRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Payment (SePay)
import sepayRoutes from "./routes/sepayRoutes.js";
import { handleIPN, autoCancelUnpaidBookings } from "./controllers/sepayController.js";

// Stripe
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// Chart Routes
import adminChartRoute from "./routes/adminChartRoute.js";               // Dashboard chart
import adminBookingChartRoute from "./routes/adminChartBookingRoute.js"; // ListBooking page chart

const app = express();
const port = 3000;

// -------------------- DATABASE --------------------
await connectDB();

// -------------------- STRIPE RAW BODY --------------------
app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// -------------------- SePay IPN --------------------
app.post("/api/sepay/ipn", express.json(), handleIPN);

// -------------------- BODY PARSER + CORS --------------------
app.use(express.json());
app.use(cors());

// -------------------- CLERK AUTH --------------------
app.use(clerkMiddleware());

// -------------------- INNGEST --------------------
app.use("/api/inngest", serve({ client: inngest, functions }));

// -------------------- ROUTES --------------------
app.get("/", (req, res) => res.send("Server is Live!"));

app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/comments", commentRouter);
app.use("/api/ai", aiRoutes);

// -------------------- SePay CREATE PAYMENT --------------------
app.use("/api/sepay", sepayRoutes);

// Auto cancel unpaid bookings
setInterval(() => {
  autoCancelUnpaidBookings();
}, 60 * 1000);

// -------------------- ADMIN CHART ROUTES --------------------
app.use("/api/admin/chart", adminChartRoute);                   // dashboard charts
app.use("/api/admin/bookings-chart", adminBookingChartRoute);   // list-bookings charts

// -------------------- START SERVER --------------------
app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
