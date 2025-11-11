import express from "express";
import {
  createWallet,
  deposit,
  withdraw,
  getBalance,
  monnifyCallback,
} from "../controllers/walletController.js";

const router = express.Router();

router.post("/create", createWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.get("balance/:userId", getBalance);
router.post("/callback", monnifyCallback);

export default router;
