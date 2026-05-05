import { serviceClient } from "../src/lib/supabase/service";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = `
-- Create collectibles table
CREATE TABLE IF NOT EXISTS collectibles (
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
);

-- Enable RLS
ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;

-- Policy: users only see their own items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own collectibles') THEN
    CREATE POLICY "Users manage own collectibles" ON collectibles
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own profile') THEN
    CREATE POLICY "Users read own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- Users can update their own profile (but not role)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own profile') THEN
    CREATE POLICY "Users update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
  END IF;
END $$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_collectibles_properties ON collectibles USING GIN (properties);
`;

async function setup() {
  const supabase = serviceClient();

  console.log("🚀 Starting database setup...");

  // Step 2: Database Schema
  // Note: Supabase JS SDK doesn't support raw SQL execution directly.
  // We'll try to use the 'rpc' method if a helper function exists, 
  // but usually this needs to be run in the Supabase Dashboard SQL Editor.
  console.log("⚠️  Executing SQL (this requires a custom 'exec_sql' RPC or similar setup)...");
  
  const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (sqlError) {
    console.error("❌ Error executing SQL via RPC:", sqlError.message);
    console.log("👉 Please run the SQL manually in the Supabase Dashboard SQL Editor if the RPC is not set up.");
  } else {
    console.log("✅ SQL executed successfully.");
  }

  // Step 3: Storage Bucket
  console.log("📦 Creating storage bucket 'collectible-images'...");
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('collectible-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("ℹ️  Bucket 'collectible-images' already exists.");
    } else {
      console.error("❌ Error creating bucket:", bucketError.message);
    }
  } else {
    console.log("✅ Bucket 'collectible-images' created successfully.");
  }

  console.log("🏁 Setup process finished.");
}

setup();
