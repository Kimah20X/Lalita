import { createClient } from "@supabase/supabase-js";
import axios from "axios";

import dotenv from "dotenv";

dotenv.config(); 

// Ensure environment variables are set
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zyiqypoaebkujynsnznv.supabase.co';
const  SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aXF5cG9hZWJrdWp5bnNuem52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NzUwMTYsImV4cCI6MjA3NjM1MTAxNn0.cTqBPANDsXq7i44LwH1yxVGcPYjM9uMAwXcpEsgC3Kw';


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
