import { createClient } from '@supabase/supabase-js';

const supeBaseUrl = 'https://kawdmbqsvrrmvhymflnx.supabase.co';
const supaBaseApiKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthd2RtYnFzdnJybXZoeW1mbG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNjQ2NDEsImV4cCI6MjA0OTc0MDY0MX0.wfcQk1sq6ft1ZqmfrtavRahgrb87nWP4pU9loYiNtjU';

const supabase = createClient(supeBaseUrl, supaBaseApiKey);

export default supabase;
