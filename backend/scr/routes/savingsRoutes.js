import express from "express";
import {  depositFunds } from "../controllers/savingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route for deposits
router.post("/deposit", protect, depositFunds);

export default router;
