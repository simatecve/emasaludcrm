// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cgtykkvyywmyfmtsjoyl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndHlra3Z5eXdteWZtdHNqb3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjUwMTQsImV4cCI6MjA2NDc0MTAxNH0.k3dxnXXEf9EbLiUKK_AkGv9ru0b4KypanFEXfGQAZIM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});