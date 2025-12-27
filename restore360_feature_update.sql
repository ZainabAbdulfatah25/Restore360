/*
  RESTORE360 FEATURE UPDATE SCRIPT
  
  This script applies database changes to support:
  1. Photo Uploads for Registrations (Household & Individual)
  2. Granular Notification Preferences for Users
  
  INSTRUCTIONS:
  1. Go to your Supabase Project Dashboard
  2. Open the SQL Editor
  3. Copy and paste the entire content of this file
  4. Run the script
*/

-- ============================================================================
-- PART 1: PHOTO UPLOAD SUPPORT
-- ============================================================================

-- Add photo_url to registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE registrations ADD COLUMN photo_url text;
  END IF;
END $$;

-- Create Storage Bucket for Photos if it doesn't exist
-- Note: This requires the storage schema extensions to be enabled
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Allow authenticated users to upload and view photos)
-- Storage Policies (Allow authenticated users to upload and view photos)
DO $$
BEGIN
    -- Policy: View Photos
    DROP POLICY IF EXISTS "Public photos access" ON storage.objects;
    CREATE POLICY "Public photos access"
      ON storage.objects FOR SELECT
      USING ( bucket_id = 'photos' );

    -- Policy: Upload Photos (Authenticated)
    DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
    CREATE POLICY "Authenticated users can upload photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK ( bucket_id = 'photos' );

    -- Policy: Update/Delete Own Photos
    DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
    CREATE POLICY "Users can update own photos"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING ( auth.uid() = owner )
      WITH CHECK ( bucket_id = 'photos' );
END $$;


-- ============================================================================
-- PART 2: GRANULAR NOTIFICATION PREFERENCES
-- ============================================================================

-- Add specific notification preference columns to users table
DO $$
BEGIN
  -- Case Updates Preference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_case_updates'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_case_updates boolean DEFAULT true;
  END IF;

  -- Referral Updates Preference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_referral_updates'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_referral_updates boolean DEFAULT true;
  END IF;

  -- System Updates Preference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_system_updates'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_system_updates boolean DEFAULT true;
  END IF;
END $$;
