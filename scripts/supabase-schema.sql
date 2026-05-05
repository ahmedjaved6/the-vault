-- ─── 0. Create exec_sql helper function ───
CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 1. Create the collectibles table ───
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

-- ─── 2. Enable RLS on collectibles ───
ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;

-- ─── 3. RLS policy: users manage only their own items ───
DROP POLICY IF EXISTS "Users manage own collectibles" ON collectibles;
CREATE POLICY "Users manage own collectibles" ON collectibles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 4. Create the profiles table ───
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── 5. Enable RLS on profiles ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS policy: users read own profile ───
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- ─── 7. RLS policy: users update own profile (cannot change role) ───
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- ─── 8. Admin bypass policy: admins can read all profiles ───
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── 9. Admin bypass policy: admins can update any profile ───
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── 10. Trigger function: auto-create profile on signup ───
CREATE OR REPLACE FUNCTION handle_new_user()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 11. Trigger: fire on new user creation ───
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 12. GIN index for fast JSONB queries ───
CREATE INDEX IF NOT EXISTS idx_collectibles_properties ON collectibles USING GIN (properties);

-- ─── 13. Index on user_id for faster user-specific queries ───
CREATE INDEX IF NOT EXISTS idx_collectibles_user_id ON collectibles (user_id);

-- ─── 14. Index on category for filtering ───
CREATE INDEX IF NOT EXISTS idx_collectibles_category ON collectibles (category);
