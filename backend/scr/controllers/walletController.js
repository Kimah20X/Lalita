import axios from 'axios';
import { supabase } from '../supabaseClient.js';
import { logTransaction } from './transactionController.js';


const MONNIFY_BASE = process.env.MONNIFY_BASE_URL; // e.g., sandbox URL
const MONNIFY_CLIENT_ID = process.env.MONNIFY_CLIENT_ID;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;

async function initiatePayment(userId, amount) {
  // 1. Create payment request with Monnify
  const payload = {
    amount: amount,
    customerName: 'User Name or fetch from DB',
    customerEmail: 'user@example.com',
    currencyCode: 'NGN',
    contractCode: process.env.MONNIFY_CONTRACT_CODE,
    // optional fields: paymentReference, redirectURL, etc.
  };
  
  const auth = Buffer.from(`${MONNIFY_CLIENT_ID}:${MONNIFY_API_KEY}`).toString('base64');
  
  const { data } = await axios.post(
    `${MONNIFY_BASE}/api/v1/merchant/transactions/initiate`,
    payload,
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return data; // contains paymentReference, paymentURL etc.
}

// Create wallet for a new user
export const createWallet = async (userId) => {
  const { data, error } = await supabase
    .from('savings')
    .insert({ user_id: userId, amount: 0, goal: 0 })
    .select();

  if (error) throw error;
  return data[0];
};

// Deposit money

export const deposit = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (amount <= 0) throw new Error('Invalid deposit amount');
    
    // 1. create payment request
    const paymentData = await initiatePayment(userId, amount);

    // 2. respond to frontend with paymentData.paymentURL
    // frontend can redirect user to payment flow or show QR etc.
    res.json({ paymentUrl: paymentData.paymentUrl, reference: paymentData.paymentReference });
    
    // 3. We log the transaction in “pending” state
    await logTransaction(userId, amount, 'deposit', 'pending', paymentData.paymentReference);
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// routes/paymentCallback.js
router.post('/monnify/callback', async (req, res) => {
  try {
    const { paymentReference, status, amount, customerEmail, ...rest } = req.body;

    // Validate signature if Monnify provides one
    // Then:
    if (status === 'PAID') {
      // update your savings table: add amount to user’s savings
      const userId = await getUserIdByPaymentReference(paymentReference); // implement lookup
      await supabase.from('savings')
        .update({ amount: supabase.raw('amount + ?', [amount]) })
        .eq('user_id', userId);
      
      // Update transaction to success
      await supabase.from('transactions')
        .update({ status: 'success' })
        .eq('reference', paymentReference);
    } else {
      // mark failed
      await supabase.from('transactions')
        .update({ status: 'failed' })
        .eq('reference', paymentReference);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error', err);
    res.status(500).send('Error');
  }
});


// export const withdraw = async (userId, amount) => {
//   if (amount <= 0) throw new Error('Invalid withdrawal amount');

//   // 1️⃣ Get current balance
//   const { data: wallet, error: fetchError } = await supabase
//     .from('savings')
//     .select('amount')
//     .eq('user_id', userId)
//     .single();

//   if (fetchError) throw fetchError;
//   if (wallet.amount < amount) throw new Error('Insufficient balance');

//   // 2️⃣ Mock payout API
//   const payoutSuccess = true; // Replace with real API call
//   if (!payoutSuccess) throw new Error('Payout failed');

//   // 3️⃣ Update savings
//   const { data: updatedWallet, error } = await supabase
//     .from('savings')
//     .update({ amount: supabase.raw('amount - ?', [amount]) })
//     .eq('user_id', userId)
//     .select();

//   if (error) throw error;

//   // 4️⃣ Log transaction
//   await logTransaction(userId, amount, 'withdrawal', 'success');

//   return updatedWallet[0];
// };

// // Get wallet balance
// export const getBalance = async (userId) => {
//   const { data, error } = await supabase
//     .from('savings')
//     .select('amount, goal')
//     .eq('user_id', userId)
//     .single();

//   if (error) throw error;
//   return data;
// };
