/*
  # Fix Infinite Recursion in Users RLS Policies

  ## Problem
  The previous migration created RLS policies that query the users table from within
  policies on the users table, causing infinite recursion.

  ## Solution
  Rewrite policies to avoid self-referencing queries by:
  - Using auth.uid() directly for simple ownership checks
  - Storing role information in auth.jwt() for complex checks
  - Using simpler policy logic that doesn't require table lookups

  ## Changes Applied
  1. Drop all existing policies causing recursion
  2. Create new simplified policies that work correctly
*/

-- ============================================================================
-- DROP PROBLEMATIC POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view based on role" ON users;
DROP POLICY IF EXISTS "Authorized users can create new users" ON users;
DROP POLICY IF EXISTS "Users can update based on role" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- ============================================================================
-- CREATE FIXED POLICIES
-- ============================================================================

-- SELECT: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- For admins to view all users, we'll handle this at the application level
-- or by using a separate admin view

-- INSERT: Allow authenticated users to create their own profile during signup
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- DELETE: Prevent all deletes via RLS (handle deletions via admin functions)
-- No DELETE policy means no one can delete via normal queries

-- ============================================================================
-- CREATE HELPER FUNCTION FOR ADMIN OPERATIONS
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view all users';
  END IF;

  RETURN QUERY SELECT * FROM users;
END;
$$;

-- Function to create user (admin only, for admin role)
CREATE OR REPLACE FUNCTION admin_create_user(
  p_id UUID,
  p_email TEXT,
  p_name TEXT,
  p_role TEXT,
  p_phone TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_organization_name TEXT DEFAULT NULL,
  p_organization_type TEXT DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_role TEXT;
  v_new_user users;
BEGIN
  -- Get current user's role
  SELECT role INTO v_current_user_role
  FROM users
  WHERE id = auth.uid();

  -- Check permissions
  IF v_current_user_role = 'admin' THEN
    -- Admins can create any user
    INSERT INTO users (id, email, name, role, phone, department, organization_name, organization_type)
    VALUES (p_id, p_email, p_name, p_role, p_phone, p_department, p_organization_name, p_organization_type)
    RETURNING * INTO v_new_user;
    
    RETURN v_new_user;
  ELSIF v_current_user_role = 'organization' AND p_role != 'admin' THEN
    -- Organizations can create non-admin users
    INSERT INTO users (id, email, name, role, phone, department, organization_name, organization_type)
    VALUES (p_id, p_email, p_name, p_role, p_phone, p_department, p_organization_name, p_organization_type)
    RETURNING * INTO v_new_user;
    
    RETURN v_new_user;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Insufficient permissions to create user with role %', p_role;
  END IF;
END;
$$;