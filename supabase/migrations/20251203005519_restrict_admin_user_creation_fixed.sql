/*
  # Restrict Admin User Creation

  ## Changes Applied

  1. **User Creation Restrictions**
     - Only admin users can create other admin users
     - Organization users can create regular users (field_worker, case_manager)
     - Regular users cannot create any users

  2. **User Read Permissions**
     - Admins can view all users
     - Organization users can view users in their organization
     - Regular users can only view their own profile

  3. **User Update Permissions**
     - Admins can update any user
     - Organization users can update users in their organization
     - Regular users can only update their own profile (but not their role)

  ## Security Notes
  - Prevents privilege escalation by restricting who can create admin users
  - Maintains data isolation between organizations
  - Ensures proper role-based access control
*/

-- ============================================================================
-- DROP OLD POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view based on role" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- ============================================================================
-- CREATE NEW ROLE-BASED POLICIES
-- ============================================================================

-- SELECT: Admins see all, orgs see their users, users see themselves
CREATE POLICY "Users can view based on role"
  ON users FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND (
        u.role = 'admin'
        OR (
          u.role = 'organization'
          AND u.organization_name IS NOT NULL
          AND u.organization_name = users.organization_name
        )
      )
    )
  );

-- INSERT: Only admins and organizations can create users
-- Admins can create any role, organizations can only create non-admin roles
CREATE POLICY "Authorized users can create new users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users creator
      WHERE creator.id = (select auth.uid())
      AND (
        -- Admins can create any user including other admins
        (creator.role = 'admin')
        OR
        -- Organizations can create non-admin users in their organization
        (
          creator.role = 'organization'
          AND users.role != 'admin'
          AND creator.organization_name IS NOT NULL
          AND users.organization_name = creator.organization_name
        )
      )
    )
  );

-- UPDATE: Users can update themselves (but not their role), admins can update anyone
CREATE POLICY "Users can update based on role"
  ON users FOR UPDATE
  TO authenticated
  USING (
    -- User updating themselves
    (
      id = (select auth.uid())
    )
    OR
    -- Admin updating anyone
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'admin'
    )
    OR
    -- Organization updating their users (non-admins)
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'organization'
      AND u.organization_name IS NOT NULL
      AND u.organization_name = users.organization_name
      AND users.role != 'admin'
    )
  )
  WITH CHECK (
    -- When users update themselves, they cannot change their role
    (
      id = (select auth.uid())
      AND role = (SELECT role FROM users WHERE id = (select auth.uid()))
    )
    OR
    -- Admins can change anything
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'admin'
    )
    OR
    -- Organizations can update non-admin users in their org (but not make them admin)
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'organization'
      AND u.organization_name IS NOT NULL
      AND u.organization_name = users.organization_name
      AND users.role != 'admin'
    )
  );

-- DELETE: Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'admin'
    )
  );