import { serviceClient } from "../src/lib/supabase/service";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function disableEmailConfirm() {
  const supabase = serviceClient();
  console.log("Attempting to disable email confirmation...");
  
  const { error } = await supabase.rpc("exec_sql", { 
    sql_text: "ALTER SYSTEM SET auth.email.confirm_on_signup TO false; SELECT pg_reload_conf();" 
  });

  if (error) {
    console.error("❌ Failed to disable email confirmation:", error.message);
    process.exit(1);
  }
  
  console.log("✅ Email confirmation disabled.");
}

disableEmailConfirm();
