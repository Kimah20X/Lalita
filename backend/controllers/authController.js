import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from '../config/supabaseClient.js';

// 🚨 GUARANTEED FIX: Hardcoded JWT secret
const JWT_SECRET = "lalita_jwt_secret_2024_secure_key_make_this_long";

// ✅ REGISTER USER
export const registerUser = async (req, res, next) => {
  try {
    const { full_name, email, password, phone_number } = req.body;

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
        {
          full_name,
          email,
          password: hashedPassword,
          phone_number,
          role: "user",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Generate token with hardcoded secret
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
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

    // Generate token with hardcoded secret
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ GET USER PROFILE
export const getUserProfile = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized. Token missing." });

    const decoded = jwt.verify(token, JWT_SECRET);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, language, phone_number")
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

    const decoded = jwt.verify(token, JWT_SECRET);
    const { full_name, language, phone_number } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ full_name, language, phone_number })
      .eq("id", decoded.id)
      .select("id, full_name, email, language, phone_number, role")
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
    res.json({
      message: "Logout successful. Please discard your token on the client side.",
    });
  } catch (error) {
    next(error);
  }
};