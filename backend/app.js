import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./scr/routes/authRoutes.js";
import adminRoutes from "./scr/routes/adminRoutes.js";
import translateRoute from "./scr/routes/translateRoute.js";
import supabase from "./scr/config/supabaseClient.js";
import { logger } from "./scr/middleware/logger.js";
import { errorHandler } from "./scr/middleware/errorHandler.js";
import { authMiddleware } from "./scr/middleware/authMiddleware.js";
import walletRoutes from './scr/routes/walletRoutes.js';
import mentorshipRoutes from './scr/routes/mentorshipRoutes.js';
import transactionRoutes from './scr/routes/transactionRoutes.js';

const PORT = process.env.PORT || 5050;

import events from "events";
events.EventEmitter.defaultMaxListeners = 20;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/translate", translateRoute);
app.use('/api/wallets', walletRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/transactions', transactionRoutes);


app.get("/api/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*").limit(1);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: "Supabase connected successfully ✅" });
});

app.use(errorHandler);

// Server
app.listen(PORT, () => {
  console.log(`Lalita backend running on port ${PORT}`);
});
  