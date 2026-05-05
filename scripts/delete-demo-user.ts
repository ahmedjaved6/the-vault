import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const email = "demo@thevault.com";
  // Find user id
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    return;
  }
  const user = usersData?.users?.find((u) => u.email === email);
  if (!user) {
    console.log("Demo user not found, nothing to delete.");
    return;
  }
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Failed to delete demo user:", deleteError.message);
  } else {
    console.log("Demo user deleted.");
  }
}

run();
