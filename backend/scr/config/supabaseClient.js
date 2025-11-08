import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); 

// Ensure environment variables are set
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase credentials. Check .env file.");
  process.exit(1);
}

// ✅ Create a Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, 
  },
  global: {
    headers: {
      "x-application-name": "Lalita Backend",
    },
  },
});

console.log("Supabase client initialized successfully");

export default { supabase };
