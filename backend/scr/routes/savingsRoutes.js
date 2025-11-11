import express from "express";
import {  depositFunds } from "../controllers/savingsController.js";
import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route for deposits
router.post("/deposit", authorize, depositFunds);

export default router;
