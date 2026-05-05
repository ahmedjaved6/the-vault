import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from the project root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SQL_STATEMENTS = [
  // ─── 1. Create the collectibles table ───
  `CREATE TABLE IF NOT EXISTS collectibles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL,
    purchase_date date,
    cost_price numeric,
    current_value numeric,
    notes text,
    image_url text,
    gallery_urls jsonb DEFAULT '[]'::jsonb,
    properties jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );`,

  // ─── 2. Enable RLS on collectibles ───
  `ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;`,

  // ─── 3. RLS policy: users manage only their own items ───
  `DROP POLICY IF EXISTS "Users manage own collectibles" ON collectibles;`,
  `CREATE POLICY "Users manage own collectibles" ON collectibles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);`,

  // ─── 4. Create the profiles table ───
  `CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );`,

  // ─── 5. Enable RLS on profiles ───
  `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,

  // ─── 6. RLS policy: users read own profile ───
  `DROP POLICY IF EXISTS "Users read own profile" ON profiles;`,
  `CREATE POLICY "Users read own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);`,

  // ─── 7. RLS policy: users update own profile (cannot change role) ───
  `DROP POLICY IF EXISTS "Users update own profile" ON profiles;`,
  `CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));`,

  // ─── 8. Admin bypass policy: admins can read all profiles ───
  `DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;`,
  `CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );`,

  // ─── 9. Admin bypass policy: admins can update any profile ───
  `DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;`,
  `CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );`,

  // ─── 10. Trigger function: auto-create profile on signup ───
  `CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.raw_user_meta_data->>'avatar_url',
      'user'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  // ─── 11. Trigger: fire on new user creation ───
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();`,

  // ─── 12. GIN index for fast JSONB queries ───
  `CREATE INDEX IF NOT EXISTS idx_collectibles_properties ON collectibles USING GIN (properties);`,

  // ─── 13. Index on user_id for faster user-specific queries ───
  `CREATE INDEX IF NOT EXISTS idx_collectibles_user_id ON collectibles (user_id);`,

  // ─── 14. Index on category for filtering ───
  `CREATE INDEX IF NOT EXISTS idx_collectibles_category ON collectibles (category);`,
];

async function runSQL(sql: string): Promise<void> {
  const { error } = await supabase.rpc("exec_sql", { sql_text: sql }).maybeSingle();

  if (error) {
    // Fallback: try direct REST API call to the SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ sql_text: sql }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`❌ SQL execution failed: ${body.substring(0, 200)}`);
      console.error(`   SQL: ${sql.substring(0, 100)}...`);
      throw new Error(`SQL execution failed: ${body.substring(0, 100)}`);
    }
  }
}

async function checkExecSqlFunction(): Promise<boolean> {
  // Check if the exec_sql RPC function exists
  const { data, error } = await supabase.rpc("exec_sql", { sql_text: "SELECT 1;" }).maybeSingle();
  if (error) {
    console.log("⚠️  exec_sql RPC function not found. Creating it now...");
    return false;
  }
  return true;
}

async function createExecSqlFunction(): Promise<void> {
  // Create the exec_sql function via the management API
  // This function allows us to run arbitrary SQL via RPC
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_exec_sql_function`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    // If the management API approach fails, we'll use the direct SQL endpoint
    console.log("⚠️  Cannot create exec_sql via RPC. Will use the Supabase Management API via SQL endpoint.");
    console.log("   Make sure your service role key has FULL database access.");
    console.log("   Alternatively, run this script by pasting the SQL into the Supabase SQL Editor:");
    console.log("");
    console.log("===== COPY EVERYTHING BELOW AND PASTE INTO SUPABASE SQL EDITOR =====");
    console.log(SQL_STATEMENTS.join("\n\n"));
    console.log("===== END OF SQL =====");
    console.log("");
    throw new Error("Manual intervention required. See above SQL to run in Supabase Dashboard.");
  }
}

async function createBucket(): Promise<void> {
  console.log("\n🪣 Creating storage bucket 'collectible-images'...");

  // Check if bucket already exists
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Cannot list buckets:", listError.message);
    throw listError;
  }

  const bucketExists = existingBuckets?.some((b) => b.name === "collectible-images");

  if (bucketExists) {
    console.log("   Bucket 'collectible-images' already exists. Updating its settings...");
    const { data, error } = await supabase.storage.updateBucket("collectible-images", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      fileSizeLimit: 5242880, // 5 MB in bytes
    });

    if (error) {
      console.error("❌ Cannot update bucket:", error.message);
      throw error;
    }
    console.log("   ✅ Bucket updated successfully.");
  } else {
    const { data, error } = await supabase.storage.createBucket("collectible-images", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      fileSizeLimit: 5242880, // 5 MB
    });

    if (error) {
      console.error("❌ Cannot create bucket:", error.message);
      throw error;
    }
    console.log("   ✅ Bucket created successfully.");
  }
}

async function verifySetup(): Promise<void> {
  console.log("\n🔍 Verifying database setup...");

  // Check tables exist
  const { data: tables, error: tablesError } = await supabase
    .rpc("exec_sql", {
      sql_text: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('collectibles', 'profiles');",
    })
    .maybeSingle();

  if (tablesError) {
    console.log("   ⚠️  Could not verify tables via RPC. The setup may still be successful.");
    console.log("   Please verify in the Supabase Dashboard > SQL Editor > run: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
  } else {
    console.log("   ✅ Tables verified.");
  }

  // Check bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucket = buckets?.find((b) => b.name === "collectible-images");

  if (bucket) {
    console.log(`   ✅ Storage bucket 'collectible-images' exists (public: ${bucket.public}).`);
  } else {
    console.log("   ❌ Storage bucket 'collectible-images' not found!");
  }
}

async function main() {
  console.log("🚀 The Vault — Full Supabase Setup");
  console.log("====================================");
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log("====================================\n");

  // 1. Check if exec_sql function exists; create if not
  const execSqlExists = await checkExecSqlFunction();
  if (!execSqlExists) {
    try {
        await createExecSqlFunction();
    } catch (e) {
        // Just continue, we'll try running SQL anyway or show instructions
    }
  }

  // 2. Run all SQL statements
  console.log("\n📋 Creating database schema...");
  for (let i = 0; i < SQL_STATEMENTS.length; i++) {
    const sql = SQL_STATEMENTS[i];
    const label = sql.substring(0, 60).replace(/\n/g, " ").trim() + "...";
    process.stdout.write(`   [${i + 1}/${SQL_STATEMENTS.length}] ${label} `);
    try {
      await runSQL(sql);
      console.log("✅");
    } catch (err: any) {
      console.log("❌");
      console.error(`   Error: ${err.message}`);
      // Don't stop on DROP POLICY errors (policy might not exist)
      if (sql.trim().startsWith("DROP POLICY")) {
        console.log("   (Ignoring DROP POLICY error — policy may not exist yet)");
      } else if (sql.trim().startsWith("CREATE INDEX IF NOT EXISTS")) {
        console.log("   (Index creation error is non-fatal)");
      } else {
        throw err;
      }
    }
  }

  // 3. Create storage bucket
  await createBucket();

  // 4. Verify
  await verifySetup();

  console.log("\n====================================");
  console.log("✅ SUPABASE SETUP COMPLETE!");
  console.log("====================================");
  console.log("");
  console.log("Next steps:");
  console.log("1. Test authentication by signing up a user");
  console.log("2. Verify a profile row was auto-created for that user");
  console.log("3. Test adding a collectible via the app");
  console.log("4. Test image upload to the 'collectible-images' bucket");
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
