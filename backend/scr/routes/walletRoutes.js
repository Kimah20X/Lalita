import express from 'express';
import { deposit, withdraw, getBalance } from '../controllers/walletController.js';

const router = express.Router();

router.post('/deposit', async (req, res) => {
  try {
    const result = await deposit(req.body.userId, req.body.amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/withdraw', async (req, res) => {
  try {
    const result = await withdraw(req.body.userId, req.body.amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/balance/:userId', authenticate, async (req, res) => {
  const { data } = await supabase
    .from('savings')
    .select('amount')
    .eq('user_id', req.params.userId)
    .single();
  res.json(data);
});


export default router;
