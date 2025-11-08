import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from '../config/supabaseClient.js';

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// Role-based access control
export const authorize = (role) => (req, res, next) => {
  if (req.user.user_metadata.role !== role) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach decoded info to request (id, email, role)
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}; 

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user info for later use
    next();
  } catch (error) {
    console.error("Invalid token:", error.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
