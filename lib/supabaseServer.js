// src/lib/supabaseServer.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Faltan SUPABASE env vars");
}

export function createSupabaseServerClient() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}