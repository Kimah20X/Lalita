import express from "express";
import { initiatePayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/deposit", initiatePayment);

// Monnify callback (handles payment success/failure)
router.post("/callback/monnify", async (req, res) => {
  try {
    console.log("MONNIFY CALLBACK:", req.body);

    const { paymentReference, paymentStatus, amountPaid } = req.body;

    if (paymentStatus === "PAID") {
      console.log(`✅ Payment Successful for ${paymentReference}: ₦${amountPaid}`);
      // TODO: Update wallet/savings table in Supabase here
    } else {
      console.log(`❌ Payment Failed for ${paymentReference}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Callback processing failed" });
  }
});

export default router;
