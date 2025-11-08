import express from "express";
import {
  deposit,
  withdraw,
  getBalance,
  createWallet,
  monnifyCallback
} from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes below
router.use(verifyToken);

router.post("/create", createWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.get("/balance", getBalance);
// ✅ Monnify payment callback (webhook)
router.post('/monnify/callback', monnifyCallback);

export default router;
