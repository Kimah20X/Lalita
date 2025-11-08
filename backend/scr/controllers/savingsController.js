import moniepoint from "../config/moniePoint.js";
import { supabase } from "../config/supabaseClient.js";

export const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Step 1: Call Moniepoint API
    const response = await moniepoint.post("/transactions/deposit", {
      amount,
      userId,
    });

    // Step 2: Update Supabase balance
    const { data, error } = await supabase
      .from("savings")
      .update({ balance: supabase.raw(`balance + ${amount}`) })
      .eq("user_id", userId)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "Deposit successful",
      moniepointResponse: response.data,
      newBalance: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * Deposit Funds with Subscription Fee
 */
export const depositFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" });
    }

    // Define fee percentage
    let feePercentage = 0;
    if (amount >= 5000 && amount < 10000) feePercentage = 3;
    else if (amount >= 10000) feePercentage = 5;

    const fee = (amount * feePercentage) / 100;
    const finalAmount = amount - fee;

    // Get current wallet
    const { data: wallet, error: walletErr } = await supabase
      .from("savings")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletErr && walletErr.code !== "PGRST116") {
      return res.status(400).json({ error: walletErr.message });
    }

    const currentBalance = wallet ? wallet.balance : 0;
    const newBalance = currentBalance + finalAmount;

    // Update or insert savings balance
    const { error: upsertErr } = await supabase.from("savings").upsert([
      {
        user_id: userId,
        balance: newBalance,
        updated_at: new Date(),
      },
    ]);

    if (upsertErr) return res.status(400).json({ error: upsertErr.message });

    // Log transaction
    const { error: txErr } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        type: "deposit",
        amount,
        fee,
        net_amount: finalAmount,
        created_at: new Date(),
      },
    ]);

    if (txErr) return res.status(400).json({ error: txErr.message });

    // Track platform fee
    await supabase.from("platform_earnings").insert([
      {
        user_id: userId,
        amount: fee,
        created_at: new Date(),
      },
    ]);

    res.status(200).json({
      message: "Deposit successful",
      total_deposit: amount,
      fee,
      finalAmount,
      balance: newBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
