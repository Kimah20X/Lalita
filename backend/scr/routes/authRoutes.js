import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    const data = await signup(email, password, fullName, role);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await login(email, password);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
