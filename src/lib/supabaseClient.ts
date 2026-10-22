import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!rawUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase Environment Variables! Check that your .env file exists in the pomo/ root folder and contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

// Normalize URL by stripping trailing /rest/v1 if included
const supabaseUrl = rawUrl
  ? rawUrl.replace(/\/rest\/v1\/?$/, "")
  : "https://placeholder-project.supabase.co";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "placeholder-anon-key"
);
