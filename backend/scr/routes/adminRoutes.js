import express from "express";
import {
  getAllUsers,
  getAllSavings,
  addMentorshipVideo,
  deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/savings", getAllSavings);
router.post("/mentorship", addMentorshipVideo);
router.delete("/users/:id", deleteUser);

export default router;
