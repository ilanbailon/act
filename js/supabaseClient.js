import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://wbzxbfqowlfmmkwqeyam.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndienhiZnFvd2xmbW1rd3FleWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODUwMDQsImV4cCI6MjA3MjU2MTAwNH0.mJJ7yID73tUerWE_aiNw3ZE4o-Q9YrT39YN-iS2CksA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
