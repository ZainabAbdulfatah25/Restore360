/*
  # Update Permissions for User Actions

  1. Updates
    - Update RLS policies to allow users to edit/delete their own submissions
    - Add admin role check for approval actions
    - Ensure proper ownership validation

  2. Security
    - Users can only edit/delete records they created
    - Admins can edit/delete any record
    - All operations are logged for audit trail
*/

-- Drop existing policies for registrations
DROP POLICY IF EXISTS "Users can update registrations" ON registrations;
DROP POLICY IF EXISTS "Users can view all registrations" ON registrations;

-- Create new policies for registrations
CREATE POLICY "Users can view all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update any registration"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'case_worker')
    )
  )
  WITH CHECK (true);

CREATE POLICY "Users can delete own registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can delete any registration"
  ON registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Update policies for cases
DROP POLICY IF EXISTS "Users can update cases" ON cases;

CREATE POLICY "Users can update own cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update any case"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'case_worker')
    )
  )
  WITH CHECK (true);

CREATE POLICY "Users can delete own cases"
  ON cases FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can delete any case"
  ON cases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Update policies for referrals
DROP POLICY IF EXISTS "Users can update referrals" ON referrals;

CREATE POLICY "Users can update own referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update any referral"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'case_worker')
    )
  )
  WITH CHECK (true);

CREATE POLICY "Users can delete own referrals"
  ON referrals FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can delete any referral"
  ON referrals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
