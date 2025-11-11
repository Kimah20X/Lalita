import monnify from "../config/monnify.js";
import { supabase } from "../config/supabaseClient.js";
import crypto from 'crypto';

// Calculate fees
const calculateFees = (amount) => {
  const platformFeePercentage = amount > 1000 ? 0.02 : 0;
  const platformFee = amount * platformFeePercentage;
  const netAmount = amount - platformFee;
  
  return {
    platformFee: Math.round(platformFee),
    netAmount: Math.round(netAmount)
  };
};

// Generate secure reference
const generateReference = (userId) => {
  return `DEP_${userId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
};

// Main deposit function
export const initiateDeposit = async (req, res) => {
  let paymentReference;
  
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name || 'Customer';

    // Generate reference
    paymentReference = generateReference(userId);

    // Calculate fees
    const { platformFee, netAmount } = calculateFees(amount);

    // Step 1: Save transaction as INITIATED
    const { error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: userId,
        type: "deposit",
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: "initiated",
        payment_reference: paymentReference,
        created_at: new Date().toISOString(),
      }]);

    if (txError) throw new Error(`Database error: ${txError.message}`);

    // Step 2: Initialize Monnify transaction
    const monnifyResponse = await monnify.initializeTransaction({
      amount: amount,
      customerName: userName,
      customerEmail: userEmail,
      paymentReference: paymentReference,
      paymentDescription: `Deposit - Ref: ${paymentReference}`,
    });

    // Step 3: Update transaction to PENDING
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        status: "pending", 
        checkout_url: monnifyResponse.checkoutUrl 
      })
      .eq("payment_reference", paymentReference);

    if (updateError) throw new Error(`Update error: ${updateError.message}`);

    // Step 4: Return checkout URL to frontend
    res.status(200).json({
      success: true,
      message: "Redirect to payment gateway",
      checkoutUrl: monnifyResponse.checkoutUrl,
      paymentReference: paymentReference,
      expiresIn: "30 minutes"
    });

  } catch (error) {
    console.error("Deposit error:", error.message);

    // Update transaction as failed if reference exists
    if (paymentReference) {
      await supabase
        .from("transactions")
        .update({ 
          status: "failed", 
          failed_reason: error.message 
        })
        .eq("payment_reference", paymentReference);
    }

    res.status(500).json({ 
      error: "Payment initialization failed. Please try again." 
    });
  }
};

// Webhook handler
export const handleMonnifyWebhook = async (req, res) => {
  try {
    const { eventType, eventData } = req.body;

    // In production, verify webhook signature here
    // const isValid = verifySignature(req);
    // if (!isValid) return res.status(401).send('Invalid signature');

    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      await handleSuccessfulPayment(eventData);
    }

    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Handle successful payments
const handleSuccessfulPayment = async (eventData) => {
  const { paymentReference, amountPaid } = eventData;

  // Find transaction
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("payment_reference", paymentReference)
    .single();

  if (error || !transaction) {
    console.error("Transaction not found:", paymentReference);
    return;
  }

  // Prevent duplicate processing
  if (transaction.status === 'success') {
    console.log("Duplicate webhook for:", paymentReference);
    return;
  }

  const userId = transaction.user_id;

  // Get or create wallet
  let { data: wallet } = await supabase
    .from("savings")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from("savings")
      .insert([{ user_id: userId, balance: 0 }])
      .select()
      .single();
    wallet = newWallet;
  }

  // Update balance
  const newBalance = (wallet.balance || 0) + transaction.net_amount;
  
  await supabase
    .from("savings")
    .update({ balance: newBalance })
    .eq("user_id", userId);

  // Update transaction status
  await supabase
    .from("transactions")
    .update({ 
      status: "success",
      completed_at: new Date().toISOString()
    })
    .eq("payment_reference", paymentReference);

  console.log(`✅ Payment completed: ${paymentReference}`);
};

// Verify payment status
export const verifyPayment = async (req, res) => {
  try {
    const { paymentReference } = req.params;
    const userId = req.user.id;

    const { data: transaction, error } = await supabase
      .from("transactions")
      .select("status, amount, net_amount, platform_fee")
      .eq("payment_reference", paymentReference)
      .eq("user_id", userId)
      .single();

    if (error || !transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      status: transaction.status,
      amount: transaction.amount,
      netAmount: transaction.net_amount,
      fee: transaction.platform_fee
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

// In your savingsController.js - TEMPORARY DEBUG VERSION
export const initiateDeposit1 = async (req, res) => {
  console.log('🎯 Deposit initiation started...');
  
  let paymentReference;
  
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name || 'Customer';

    console.log('📝 Request data:', { amount, userId, userEmail, userName });

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    // Generate reference
    paymentReference = `DEP_${userId}_${Date.now()}`;
    console.log('🔖 Generated reference:', paymentReference);

    // Calculate fees
    const platformFee = amount > 1000 ? amount * 0.02 : 0;
    const netAmount = amount - platformFee;

    console.log('💰 Fee calculation:', { amount, platformFee, netAmount });

    // Save transaction
    const { error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: userId,
        type: "deposit",
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: "initiated",
        payment_reference: paymentReference,
        created_at: new Date().toISOString(),
      }]);

    if (txError) {
      console.error('❌ Database error:', txError);
      throw new Error(`Database error: ${txError.message}`);
    }

    console.log('✅ Transaction saved to database');

    // Initialize Monnify transaction
    console.log('🔄 Calling Monnify...');
    const monnifyResponse = await monnify.initializeTransaction({
      amount: amount,
      customerName: userName,
      customerEmail: userEmail,
      paymentReference: paymentReference,
      paymentDescription: `Deposit - Ref: ${paymentReference}`,
    });

    console.log('🎉 Monnify response received:', monnifyResponse);

    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        status: "pending", 
        checkout_url: monnifyResponse.checkoutUrl 
      })
      .eq("payment_reference", paymentReference);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      throw new Error(`Update error: ${updateError.message}`);
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Redirect to payment gateway",
      checkoutUrl: monnifyResponse.checkoutUrl,
      paymentReference: paymentReference,
      expiresIn: "30 minutes"
    });

  } catch (error) {
    console.error("💥 DEPOSIT ERROR:", error.message);
    console.error("Full error:", error);

    // Update transaction as failed
    if (paymentReference) {
      await supabase
        .from("transactions")
        .update({ 
          status: "failed", 
          failed_reason: error.message 
        })
        .eq("payment_reference", paymentReference);
    }

    res.status(500).json({ 
      error: "Payment initialization failed. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};