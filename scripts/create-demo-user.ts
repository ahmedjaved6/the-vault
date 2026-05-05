import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createDemoUser() {
  const demoEmail = "demo@thevault.com";
  console.log(`Checking if user ${demoEmail} exists...`);

  let userId: string | undefined;

  // Try to create the user
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: demoEmail,
    password: "Demo123!",
    email_confirm: true,
    user_metadata: { username: "DemoCollector", full_name: "Demo Collector" },
  });

  if (createError) {
    if (createError.message.includes("already exists") || createError.message.includes("User already registered")) {
      console.log(`User ${demoEmail} already exists. Fetching user ID...`);
      // List users to find the ID (admin API)
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError && usersData.users) {
        const user = usersData.users.find((u) => u.email === demoEmail);
        if (user) {
          userId = user.id;
        }
      }
    } else {
      console.error("Failed to create user:", createError.message);
      return;
    }
  } else if (userData?.user) {
    console.log(`Successfully created user ${demoEmail}`);
    userId = userData.user.id;
  }

  if (userId) {
    console.log(`Promoting user ${userId} to admin...`);
    // Upsert into profiles just in case the trigger failed or we need to update it
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        role: "admin",
        full_name: "Demo Collector",
        username: "DemoCollector",
      });

    if (profileError) {
      console.error("Failed to promote user to admin:", profileError.message);
    } else {
      console.log("Successfully promoted user to admin.");
    }
  } else {
    console.error("Could not determine user ID to promote.");
  }
}

createDemoUser();
