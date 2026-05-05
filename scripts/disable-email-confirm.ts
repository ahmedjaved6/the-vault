import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Disabling email confirmations...");
  const { error } = await supabase.rpc("exec_sql", {
    query: "UPDATE auth.config SET enable_confirmations = false;"
  });

  if (error) {
    console.error("Error (RPC might not exist, trying different approach):", error.message);
    // Alternatively just use the rest api or log that it needs to be done in dashboard if rpc fails
  } else {
    console.log("Successfully disabled email confirmations.");
  }
}

run();
