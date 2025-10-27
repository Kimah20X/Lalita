import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// USER SIGNUP
export const signup = async (email, password, fullName, role = 'user') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullName, role } },
  });
  if (error) throw error;
  return data;
};

// USER LOGIN
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// GET CURRENT USER (from token)
export const getUser = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
};

// // ✅ Register
// export const registerUser = async (req, res, next) => {
//   try {
//     const { full_name, email, password, role } = req.body;

//     if (!full_name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if email already exists
//     const { data: existingUser } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert into Supabase
//     const { data: newUser, error } = await supabase.from("users").insert([
//       { full_name, email, password: hashedPassword, role: role || "user" },
//     ]).select().single();

//     if (error) throw error;

//     const token = generateToken(newUser);
//     res.status(201).json({
//       message: "User registered successfully",
//       user: { id: newUser.id, email: newUser.email },
//       token,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ✅ Login
// export const loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const { data: user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (error || !user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = generateToken(user);
//     res.json({
//       message: "Login successful",
//       user: { id: user.id, email: user.email, role: user.role },
//       token,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
