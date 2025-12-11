/*
  # Add Approval System and Update RLS Policies

  ## Changes
  
  1. Add approval fields to tables:
    - Add `approval_status` (pending, approved, rejected) to cases, registrations, and referrals
    - Add `approved_by` to track who approved/rejected
    - Add `approved_at` timestamp
    - Add `rejection_reason` for rejected items
  
  2. Update RLS Policies:
    - Users can only see their own data
    - Admins can see all data
    - Organizations can see all data from their organization and approve/reject
    - Add approval-related policies
  
  3. Security:
    - Only admins and organization users can approve/reject
    - Regular users can only view their own submissions
    - Approval history is tracked in activity_logs
*/

-- Add approval fields to cases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE cases ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    ALTER TABLE cases ADD COLUMN approved_by uuid REFERENCES auth.users(id);
    ALTER TABLE cases ADD COLUMN approved_at timestamptz;
    ALTER TABLE cases ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Add approval fields to registrations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE registrations ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    ALTER TABLE registrations ADD COLUMN approved_by uuid REFERENCES auth.users(id);
    ALTER TABLE registrations ADD COLUMN approved_at timestamptz;
    ALTER TABLE registrations ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Add approval fields to referrals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE referrals ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    ALTER TABLE referrals ADD COLUMN approved_by uuid REFERENCES auth.users(id);
    ALTER TABLE referrals ADD COLUMN approved_at timestamptz;
    ALTER TABLE referrals ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;

DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON registrations;

DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can delete own referrals" ON referrals;

-- Cases RLS Policies
CREATE POLICY "Users can view cases based on role"
  ON cases FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  );

CREATE POLICY "Users can insert own cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own cases or admins can update"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  );

CREATE POLICY "Users can delete own cases or admins can delete"
  ON cases FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Registrations RLS Policies
CREATE POLICY "Users can view registrations based on role"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  );

CREATE POLICY "Users can insert own registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own registrations or admins can update"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  );

CREATE POLICY "Users can delete own registrations or admins can delete"
  ON registrations FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Referrals RLS Policies
CREATE POLICY "Users can view referrals based on role"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  );

CREATE POLICY "Users can insert own referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own referrals or admins can update"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'organization')
    )
  );

CREATE POLICY "Users can delete own referrals or admins can delete"
  ON referrals FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_approval_status ON cases(approval_status);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_registrations_approval_status ON registrations(approval_status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_by ON registrations(created_by);
CREATE INDEX IF NOT EXISTS idx_referrals_approval_status ON referrals(approval_status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_by ON referrals(created_by);
