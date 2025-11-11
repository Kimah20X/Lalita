import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUserProfile);
router.patch("/update", updateUserProfile);
router.post("/logout", logoutUser);

export default router;
