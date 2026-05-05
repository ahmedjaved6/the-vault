import { createClient } from "@supabase/supabase-js";

export const serviceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null as any;
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
