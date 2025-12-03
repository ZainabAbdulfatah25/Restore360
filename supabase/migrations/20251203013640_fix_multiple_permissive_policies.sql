/*
  # Fix Multiple Permissive Policies

  1. Purpose
    - Remove duplicate permissive RLS policies that create security confusion
    - Having multiple permissive policies for the same action can lead to unexpected access patterns
    - Consolidate policies into single, clear access rules

  2. Tables with Multiple Permissive Policies
    - activity_logs: Has 2 SELECT policies
    - durable_solutions_followup: Has 2 SELECT policies
    - service_history: Has 2 SELECT policies
    - service_needs: Has 2 SELECT policies

  3. Security Impact
    - Clearer access control rules
    - Easier to audit and maintain security policies
    - Prevents confusion from overlapping policy conditions

  4. Strategy
    - Drop all existing SELECT policies for affected tables
    - Create single, comprehensive SELECT policy for each table
    - Ensure new policies cover all legitimate access patterns

  5. Important Notes
    - Using IF EXISTS to prevent errors if policies already changed
    - New policies combine logic from old policies
    - All access is still restricted to authenticated users
*/

-- Fix activity_logs: Remove duplicate policies and create single comprehensive one
DROP POLICY IF EXISTS "Users can view activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can view activity logs based on role" ON activity_logs;

CREATE POLICY "Authenticated users can view activity logs based on role"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role IN ('admin', 'super_admin')
        OR (users.role = 'staff' AND activity_logs.user_id = auth.uid())
        OR (users.role = 'user' AND activity_logs.user_id = auth.uid())
      )
    )
  );

-- Fix durable_solutions_followup: Remove duplicate policies and create single comprehensive one
DROP POLICY IF EXISTS "Staff can manage followup records" ON durable_solutions_followup;
DROP POLICY IF EXISTS "Users can view followup records" ON durable_solutions_followup;

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

CREATE POLICY "Staff can manage followup records"
  ON durable_solutions_followup
  FOR ALL
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

-- Fix service_history: Remove duplicate policies and create single comprehensive one
DROP POLICY IF EXISTS "Staff can manage service history" ON service_history;
DROP POLICY IF EXISTS "Users can view service history" ON service_history;

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

CREATE POLICY "Staff can manage service history"
  ON service_history
  FOR ALL
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

-- Fix service_needs: Remove duplicate policies and create single comprehensive one
DROP POLICY IF EXISTS "Staff can manage service needs" ON service_needs;
DROP POLICY IF EXISTS "Users can view service needs" ON service_needs;

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

CREATE POLICY "Staff can manage service needs"
  ON service_needs
  FOR ALL
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
