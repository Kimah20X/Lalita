import express from "express";
import { 
  initiateDeposit, 
  handleMonnifyWebhook, 
  verifyPayment 
} from "../controllers/savingsController.js";
import { authorize } from "../middleware/authMiddleware.js";
import { validateTransactionLimits, rateLimiter } from "../middleware/security.js";

const router = express.Router();

// Protected deposit routes with security middleware
router.post(
  "/deposit/initiate", 
  authorize, 
  validateTransactionLimits, 
  rateLimiter, 
  initiateDeposit
);

router.get(
  "/payment/verify/:paymentReference", 
  authorize, 
  verifyPayment
);

// Webhook route (no authentication - Monnify calls this)
router.post(
  "/webhook/monnify", 
  handleMonnifyWebhook
);

export default router;