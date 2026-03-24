-- BSU International Portal — Run in Supabase SQL Editor. Safe to re-run.

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT, full_name TEXT, country TEXT, major TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_read"  ON profiles;
  DROP POLICY IF EXISTS "profiles_write" ON profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "profiles_read"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write" ON profiles FOR ALL    USING (auth.uid() = id);

-- STUDENT LISTINGS
CREATE TABLE IF NOT EXISTS student_listings (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name    TEXT, title TEXT NOT NULL, location TEXT NOT NULL,
  price        INTEGER NOT NULL, type TEXT DEFAULT 'Off-Campus',
  beds         INTEGER DEFAULT 1, description TEXT, image_url TEXT,
  availability TEXT DEFAULT 'Available', created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE student_listings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS "listings_read"   ON student_listings;
  DROP POLICY IF EXISTS "listings_insert" ON student_listings;
  DROP POLICY IF EXISTS "listings_update" ON student_listings;
  DROP POLICY IF EXISTS "listings_delete" ON student_listings;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "listings_read"   ON student_listings FOR SELECT USING (true);
CREATE POLICY "listings_insert" ON student_listings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "listings_update" ON student_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings_delete" ON student_listings FOR DELETE USING (auth.uid() = user_id);

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('housing-images','housing-images',true) ON CONFLICT DO NOTHING;
DO $$ BEGIN
  DROP POLICY IF EXISTS "images_read"   ON storage.objects;
  DROP POLICY IF EXISTS "images_upload" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "images_read"   ON storage.objects FOR SELECT USING (bucket_id='housing-images');
CREATE POLICY "images_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id='housing-images' AND auth.uid() IS NOT NULL);

SELECT 'BSU Portal schema ready ✅' AS status;
