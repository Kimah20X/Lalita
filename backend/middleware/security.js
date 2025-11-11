import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiting (replace with Redis in production)
const rateLimitMap = new Map();

export const validateTransactionLimits = (req, res, next) => {
  const { amount } = req.body;
  
  const limits = {
    minDeposit: 100,    // ₦100 minimum
    maxDeposit: 5000,   // ₦5,000 maximum for safety
  };

  if (!amount || amount < limits.minDeposit) {
    return res.status(400).json({
      error: `Minimum deposit is ₦${limits.minDeposit}`
    });
  }

  if (amount > limits.maxDeposit) {
    return res.status(400).json({
      error: `Maximum deposit per transaction is ₦${limits.maxDeposit}`
    });
  }

  next();
};

export const rateLimiter = (req, res, next) => {
  const userId = req.user.id;
  const key = `deposit:${userId}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const userRateLimit = rateLimitMap.get(key) || { count: 0, lastReset: now };

  // Reset counter if window has passed
  if (now - userRateLimit.lastReset > windowMs) {
    userRateLimit.count = 0;
    userRateLimit.lastReset = now;
  }

  // Check if over limit
  if (userRateLimit.count >= maxAttempts) {
    return res.status(429).json({
      error: "Too many deposit attempts. Please wait 15 minutes."
    });
  }

  // Increment counter
  userRateLimit.count++;
  rateLimitMap.set(key, userRateLimit);

  next();
};