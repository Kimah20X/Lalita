// ✅ Routes included:
// POST /wallet/create → Create a new wallet
// POST /wallet/deposit → Deposit funds (Monnify integration)
// POST /wallet/withdraw → Withdraw funds
// GET /wallet/balance/:userId → Get user balance
// POST /wallet/callback → Handle Monnify webhook callback

import axios from 'axios';
import { supabase } from '../config/supabaseClient.js';
import { logTransaction } from './transactionController.js';

// 🔐 ENV CONFIG
const MONNIFY_BASE = process.env.MONNIFY_BASE_URL;
const MONNIFY_CLIENT_ID = process.env.MONNIFY_CLIENT_ID;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

// 🧩 HELPER FUNCTIONS

// Get Monnify auth header
const getMonnifyAuthHeader = () => {
  const auth = Buffer.from(`${MONNIFY_CLIENT_ID}:${MONNIFY_API_KEY}`).toString('base64');
  return `Basic ${auth}`;
};

// Initiate payment with Monnify
async function initiatePayment(userId, amount) {
  const payload = {
    amount,
    customerName: 'User Name', // Ideally fetch from users table
    customerEmail: 'user@example.com',
    paymentReference: `TX-${Date.now()}-${userId}`,
    paymentDescription: 'Wallet Deposit',
    currencyCode: 'NGN',
    contractCode: MONNIFY_CONTRACT_CODE,
    redirectUrl: `${process.env.BASE_URL}/payment-success`,
  };

  const { data } = await axios.post(
    `${MONNIFY_BASE}/api/v1/merchant/transactions/initiate`,
    payload,
    {
      headers: {
        Authorization: getMonnifyAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );

  return data;
}

// 🏦 WALLET CONTROLLERS

// ✅ Create Wallet
export const createWallet = async (userId) => {
  const { data, error } = await supabase
    .from('savings')
    .insert({ user_id: userId, amount: 0, goal: 0 })
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// ✅ Deposit Funds
export const deposit = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (amount <= 0) throw new Error('Invalid deposit amount');

    const paymentData = await initiatePayment(userId, amount);

    await logTransaction(userId, amount, 'deposit', 'pending', paymentData.paymentReference);

    res.json({
      message: 'Payment initiated successfully',
      paymentUrl: paymentData.responseBody?.checkoutUrl,
      reference: paymentData.responseBody?.paymentReference,
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Withdraw Funds
export const withdraw = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (amount <= 0) throw new Error('Invalid withdrawal amount');

    const { data, error } = await supabase
      .from('savings')
      .select('amount')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new Error('Wallet not found');
    if (data.amount < amount) throw new Error('Insufficient balance');

    await supabase
      .from('savings')
      .update({ amount: data.amount - amount })
      .eq('user_id', userId);

    await logTransaction(userId, amount, 'withdrawal', 'success', `WD-${Date.now()}`);

    res.json({ message: 'Withdrawal successful', balance: data.amount - amount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get Wallet Balance
export const getBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('savings')
      .select('amount')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new Error('Wallet not found');

    res.json({ userId, balance: data.amount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Monnify Callback (Webhook)
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
