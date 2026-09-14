import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://bnbzrpdvtuylqzaqwpan.supabase.co";

const supabaseAnonKey = "sb_publishable_t42Lf8FhQX1MjB0JXlLh-A_gMcpn8Dt";


export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);