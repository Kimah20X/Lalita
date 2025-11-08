import { supabase } from '../config/supabaseClient.js';

// Log transaction
export const logTransaction = async (userId, amount, type, status = 'pending') => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id: userId, amount, type, status })
    .select();

  if (error) throw error;
  return data[0];
};

// Get transaction history
export const getTransactions = async (userId, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data;
};
