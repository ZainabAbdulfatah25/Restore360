/*
  # Fix Overlapping RLS Policies - Final Fix

  1. Problem
    - Multiple tables have policies with cmd='ALL' which overlap with cmd='SELECT'
    - This creates multiple permissive policies for the same action (SELECT)
    - ALL includes SELECT, INSERT, UPDATE, and DELETE operations

  2. Solution Strategy
    - Remove ALL policies
    - Create separate policies for INSERT, UPDATE, and DELETE
    - Keep existing SELECT policies for read access
    - This ensures no overlap between policies

  3. Affected Tables
    - durable_solutions_followup
    - service_history
    - service_needs

  4. Security Impact
    - Clearer, non-overlapping access control
    - Easier to audit and maintain
    - Same functional access, better organized

  5. Important Notes
    - Activity_logs already has separate policies so it's not modified
    - Each operation now has exactly one policy
    - All policies remain restrictive to authenticated staff/admin users
*/

-- Fix durable_solutions_followup policies
DROP POLICY IF EXISTS "Staff can manage followup records" ON durable_solutions_followup;
DROP POLICY IF EXISTS "Authenticated users can view followup records" ON durable_solutions_followup;

-- Create separate non-overlapping policies
CREATE POLICY "Authenticated users can view followup records"
  ON durable_solutions_followup
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff', 'organization')
    )
  );

CREATE POLICY "Staff can insert followup records"
  ON durable_solutions_followup
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Staff can update followup records"
  ON durable_solutions_followup
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Staff can delete followup records"
  ON durable_solutions_followup
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

-- Fix service_history policies
DROP POLICY IF EXISTS "Staff can manage service history" ON service_history;
DROP POLICY IF EXISTS "Authenticated users can view service history" ON service_history;

CREATE POLICY "Authenticated users can view service history"
  ON service_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff', 'organization')
    )
  );

CREATE POLICY "Staff can insert service history"
  ON service_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Staff can update service history"
  ON service_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Staff can delete service history"
  ON service_history
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

-- Fix service_needs policies
DROP POLICY IF EXISTS "Staff can manage service needs" ON service_needs;
DROP POLICY IF EXISTS "Authenticated users can view service needs" ON service_needs;

CREATE POLICY "Authenticated users can view service needs"
  ON service_needs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff', 'organization')
    )
  );

CREATE POLICY "Staff can insert service needs"
  ON service_needs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Staff can update service needs"
  ON service_needs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );

CREATE POLICY "Staff can delete service needs"
  ON service_needs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin', 'staff')
    )
  );
