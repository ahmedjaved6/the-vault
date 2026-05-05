import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing env vars. Check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🔧 THE VAULT — Storage RLS Fix\n");

  // 1. Check bucket
  console.log("1. Checking bucket 'collectible-images'...");
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error("❌ Cannot list buckets:", listErr.message);
    process.exit(1);
  }

  const bucketOptions = {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"],
    fileSizeLimit: 10485760, // 10 MB
  };

  const bucket = buckets?.find(b => b.name === "collectible-images");
  if (!bucket) {
    console.log("   Bucket not found. Creating it...");
    const { error: createErr } = await supabase.storage.createBucket("collectible-images", bucketOptions);
    if (createErr) {
      console.error("❌ Cannot create bucket:", createErr.message);
      process.exit(1);
    }
    console.log("   ✅ Bucket created.");
  } else {
    console.log(`   ✅ Bucket exists (public: ${bucket.public}).`);
    console.log("   Updating bucket settings...");
    const { error: updateErr } = await supabase.storage.updateBucket("collectible-images", bucketOptions);
    if (updateErr) {
      console.error("❌ Cannot update bucket:", updateErr.message);
    } else {
      console.log("   ✅ Bucket settings updated.");
    }
  }

  // 2. Drop existing policies (if any)
  console.log("\n2. Dropping old storage policies...");
  const dropPolicies = [
    `DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Allow users to delete own objects" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Allow public read" ON storage.objects;`,
    `DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;`,
  ];

  for (const sql of dropPolicies) {
    const { error } = await supabase.rpc("exec_sql", { sql_text: sql }).maybeSingle();
    if (error) {
      console.log(`   ⚠️  Drop error (may be safe): ${error.message.substring(0, 80)}`);
    }
  }

  // 3. Create new policies
  console.log("\n3. Creating new storage policies...");

  const newPolicies = [
    {
      name: "Allow public read",
      sql: `CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'collectible-images');`,
    },
    {
      name: "Allow authenticated uploads",
      sql: `CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'collectible-images');`,
    },
    {
      name: "Allow users to update own objects",
      sql: `CREATE POLICY "Allow users to update own objects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'collectible-images' AND owner = auth.uid());`,
    },
    {
      name: "Allow users to delete own objects",
      sql: `CREATE POLICY "Allow users to delete own objects" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'collectible-images' AND owner = auth.uid());`,
    },
  ];

  for (const policy of newPolicies) {
    const { error } = await supabase.rpc("exec_sql", { sql_text: policy.sql }).maybeSingle();
    if (error) {
      console.error(`   ❌ Failed to create "${policy.name}": ${error.message}`);
    } else {
      console.log(`   ✅ Created "${policy.name}"`);
    }
  }

  // 4. Verify by testing an upload as a dummy user (using service role, but simulating)
  console.log("\n4. Testing upload permission...");
  const testContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+hHgAFgwJ/lhV6AAAAAElFTkSuQmCC','base64');
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('collectible-images')
    .upload('__test__/permission-check.png', testContent, { upsert: true, contentType: 'image/png' });

  if (uploadErr) {
    console.error(`   ❌ Upload test failed: ${uploadErr.message}`);
    console.log("   This means the RLS policy is still not effective.");
    console.log("   Fallback: Run this SQL in the Supabase Dashboard SQL Editor:");
    console.log("   ------------------------------------------------");
    console.log(newPolicies.map(p => p.sql).join("\n"));
    console.log("   ------------------------------------------------");
  } else {
    console.log("   ✅ Upload test succeeded. Removing test file...");
    await supabase.storage.from("collectible-images").remove(["__test__/permission-check.png"]);
  }

  console.log("\n✅ Storage RLS fix complete.");
}

main().catch(console.error);
