import express from "express";
import {
  createSePayPayment,
  handleIPN,
  paymentSuccess,
  paymentError,
  paymentCancel
} from "../controllers/sepayController.js";

const router = express.Router();

router.post("/create", createSePayPayment);
router.post("/ipn", handleIPN);
router.get("/success", paymentSuccess);
router.get("/error", paymentError);
router.get("/cancel", paymentCancel);

export default router;
