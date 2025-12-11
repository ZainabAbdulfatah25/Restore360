/*
  # Fix Security Issues - Part 2: RLS Policy Optimization

  ## Changes Applied

  1. **RLS Policy Optimization**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies to prevent re-evaluation
     - This significantly improves query performance at scale by evaluating auth once per query

  2. **Remove Duplicate Policies**
     - Drop duplicate permissive policies that overlap
     - Keep the most comprehensive policy for each operation

  ## Security Notes
  - All changes maintain existing security guarantees
  - Performance improvements through RLS optimization
  - Reduced policy complexity by eliminating duplicates
*/

-- ============================================================================
-- 1. DROP DUPLICATE POLICIES (Keep most comprehensive ones)
-- ============================================================================

-- activity_logs: Keep combined policy instead of separate ones
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;

-- cases: Remove duplicates, keep the comprehensive role-based policies
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Users can create cases" ON cases;
DROP POLICY IF EXISTS "Admins can delete any case" ON cases;
DROP POLICY IF EXISTS "Admins can update any case" ON cases;

-- referrals: Remove duplicates
DROP POLICY IF EXISTS "Users can view all referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can delete any referral" ON referrals;
DROP POLICY IF EXISTS "Admins can update any referral" ON referrals;

-- Keep staff policies for service tables (more comprehensive than user-specific)
DROP POLICY IF EXISTS "Users can view service history for their registrations" ON service_history;
DROP POLICY IF EXISTS "Users can view their service needs" ON service_needs;
DROP POLICY IF EXISTS "Users can view their followup records" ON durable_solutions_followup;

-- ============================================================================
-- 2. RECREATE OPTIMIZED RLS POLICIES
-- ============================================================================

-- -------------------- USERS TABLE --------------------

DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- -------------------- CASES TABLE --------------------

DROP POLICY IF EXISTS "Users can view cases based on role" ON cases;
CREATE POLICY "Users can view cases based on role"
  ON cases FOR SELECT
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR assigned_to = (select auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  );

DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
CREATE POLICY "Users can insert own cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own cases or admins can update" ON cases;
CREATE POLICY "Users can update own cases or admins can update"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  )
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  );

DROP POLICY IF EXISTS "Users can delete own cases or admins can delete" ON cases;
CREATE POLICY "Users can delete own cases or admins can delete"
  ON cases FOR DELETE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- -------------------- REFERRALS TABLE --------------------

DROP POLICY IF EXISTS "Users can view referrals based on role" ON referrals;
CREATE POLICY "Users can view referrals based on role"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  );

DROP POLICY IF EXISTS "Users can insert own referrals" ON referrals;
CREATE POLICY "Users can insert own referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own referrals or admins can update" ON referrals;
CREATE POLICY "Users can update own referrals or admins can update"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  )
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  );

DROP POLICY IF EXISTS "Users can delete own referrals or admins can delete" ON referrals;
CREATE POLICY "Users can delete own referrals or admins can delete"
  ON referrals FOR DELETE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- -------------------- ACTIVITY LOGS TABLE --------------------

CREATE POLICY "Users can view activity logs based on role"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create activity logs" ON activity_logs;
CREATE POLICY "Authenticated users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- -------------------- REGISTRATIONS TABLE --------------------

DROP POLICY IF EXISTS "Users can update registrations" ON registrations;
CREATE POLICY "Users can update registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  )
  WITH CHECK (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'organization')
    )
  );

DROP POLICY IF EXISTS "Users can delete registrations" ON registrations;
CREATE POLICY "Users can delete registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- -------------------- SERVICE HISTORY TABLE --------------------

DROP POLICY IF EXISTS "Staff can manage service history" ON service_history;
CREATE POLICY "Staff can manage service history"
  ON service_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager', 'field_worker')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager', 'field_worker')
    )
  );

-- -------------------- SERVICE NEEDS TABLE --------------------

DROP POLICY IF EXISTS "Staff can manage service needs" ON service_needs;
CREATE POLICY "Staff can manage service needs"
  ON service_needs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager', 'field_worker')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager', 'field_worker')
    )
  );

-- -------------------- DURABLE SOLUTIONS FOLLOWUP TABLE --------------------

DROP POLICY IF EXISTS "Staff can manage followup records" ON durable_solutions_followup;
CREATE POLICY "Staff can manage followup records"
  ON durable_solutions_followup FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager', 'field_worker')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager', 'field_worker')
    )
  );

-- -------------------- PROTECTION INCIDENTS TABLE --------------------

DROP POLICY IF EXISTS "Only protection staff can access incidents" ON protection_incidents;
CREATE POLICY "Only protection staff can access incidents"
  ON protection_incidents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'case_manager')
    )
  );