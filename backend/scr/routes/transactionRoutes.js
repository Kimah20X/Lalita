import express from 'express';
import { getTransactions } from '../controllers/transactionController.js';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

/**
 * ========================================
 * 💳 TRANSACTION ROUTES
 * ========================================
 * /api/transactions
 * Handles all user transaction activities
 */

// ✅ Get all transactions for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const transactions = await getTransactions(userId, page, limit);
    res.json({ userId, transactions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get a specific transaction by ID
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Transaction not found');

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// ✅ Filter transactions by type (deposit or withdrawal)
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { userId } = req.query;

    if (!['deposit', 'withdrawal'].includes(type))
      throw new Error('Invalid transaction type');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ userId, type, transactions: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete a transaction (for admins or testing)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
