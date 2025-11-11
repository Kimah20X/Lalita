import { supabase } from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import { logTransaction } from './transactionController.js';
import axios from 'axios';

// ENV
const MONNIFY_BASE = process.env.MONNIFY_BASE_URL;
const MONNIFY_CLIENT_ID = process.env.MONNIFY_CLIENT_ID;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const BASE_URL = process.env.BASE_URL;

// Helper: Monnify Auth Header
const getMonnifyAuthHeader = () => {
  const auth = Buffer.from(`${MONNIFY_CLIENT_ID}:${MONNIFY_API_KEY}`).toString('base64');
  return `Basic ${auth}`;
};

// ---------------------- WALLET CONTROLLERS ----------------------

// Create wallet for new user
export const createWallet = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized. Token missing.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { data: existingWallet } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingWallet) return res.status(400).json({ message: 'Wallet already exists' });

    const { data, error } = await supabase
      .from('savings')
      .insert({ user_id: userId, amount: 0, goal: 0 })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Wallet created', wallet: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deposit money (initiates Monnify payment)
export const deposit = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized. Token missing.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) throw new Error('Invalid deposit amount');

    // Initiate Monnify payment
    const payload = {
      amount,
      customerName: 'User', // optionally fetch from users table
      customerEmail: 'user@example.com', // optionally fetch from users table
      paymentReference: `TX-${Date.now()}-${userId}`,
      paymentDescription: 'Wallet Deposit',
      currencyCode: 'NGN',
      contractCode: MONNIFY_CONTRACT_CODE,
      redirectUrl: `${BASE_URL}/payment-success`,
    };

    const { data: paymentData } = await axios.post(
      `${MONNIFY_BASE}/api/v1/merchant/transactions/initiate`,
      payload,
      { headers: { Authorization: getMonnifyAuthHeader(), 'Content-Type': 'application/json' } }
    );

    // Log transaction as pending
    await logTransaction(userId, amount, 'deposit', 'pending', payload.paymentReference);

    res.json({
      message: 'Payment initiated',
      paymentUrl: paymentData.responseBody?.checkoutUrl,
      reference: payload.paymentReference,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Withdraw funds
export const withdraw = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized. Token missing.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) throw new Error('Invalid withdrawal amount');

    const { data: wallet, error } = await supabase
      .from('savings')
      .select('amount')
      .eq('user_id', userId)
      .single();

    if (error || !wallet) throw new Error('Wallet not found');
    if (wallet.amount < amount) throw new Error('Insufficient balance');

    await supabase.from('savings')
      .update({ amount: wallet.amount - amount })
      .eq('user_id', userId);

    await logTransaction(userId, amount, 'withdrawal', 'success', `WD-${Date.now()}`);

    res.json({ message: 'Withdrawal successful', balance: wallet.amount - amount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get wallet balance
export const getBalance = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized. Token missing.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { data: wallet, error } = await supabase
      .from('savings')
      .select('amount, goal')
      .eq('user_id', userId)
      .single();

    if (error || !wallet) throw new Error('Wallet not found');

    res.json({ balance: wallet.amount, goal: wallet.goal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Monnify webhook callback
export const monnifyCallback = async (req, res) => {
  try {
    const { paymentReference, paymentStatus, amountPaid } = req.body;

    const { data: tx } = await supabase
      .from('transactions')
      .select('user_id')
      .eq('reference', paymentReference)
      .single();

    if (!tx) throw new Error('Transaction not found');

    if (paymentStatus === 'PAID') {
      await supabase.rpc('increment_wallet_balance', { user_id: tx.user_id, amt: amountPaid });

      await supabase
        .from('transactions')
        .update({ status: 'success' })
        .eq('reference', paymentReference);
    } else {
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('reference', paymentReference);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Monnify callback error:', err);
    res.status(500).send('Error processing callback');
  }
};
