import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 🔐 Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ REGISTER USER
export const registerUser = async (req, res, next) => {
  try {
    const { full_name, email, password, role = "user" } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        { full_name, email, password: hashedPassword, role },
      ])
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(newUser);
    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ LOGIN USER
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};


// ✅ GET PROFILE
export const getUserProfile = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized. Token missing." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, language")
      .eq("id", decoded.id)
      .single();

    if (error || !user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// ✅ UPDATE PROFILE
export const updateUserProfile = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized. Token missing." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { full_name, language } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ full_name, language })
      .eq("id", decoded.id)
      .select("id, full_name, email, language, role")
      .single();

    if (error) throw error;

    res.json({ message: "Profile updated successfully", user: data });
  } catch (error) {
    next(error);
  }
};

// ✅ LOGOUT
export const logoutUser = async (req, res, next) => {
  try {
    // If using stateless JWTs, logout is frontend-handled (client just deletes token)
    // But you can also store blacklisted tokens or timestamps
    res.json({ message: "Logout successful. Please discard your token on client side." });
  } catch (error) {
    next(error);
  }
};