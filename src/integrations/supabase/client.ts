// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cshonfrvhdqpsheighta.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaG9uZnJ2aGRxcHNoZWlnaHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0Mzc0NjYsImV4cCI6MjA1NjAxMzQ2Nn0.vk_fzM2rhyzNMN2z9Euvrj9gqs-jNtkudkmRUHgE2-I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);