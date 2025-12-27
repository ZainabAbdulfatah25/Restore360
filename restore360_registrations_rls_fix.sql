/*
  Fix Registrations RLS Policies
  
  This script ensures that:
  1. Authenticated users can INSERT into registrations.
  2. Authenticated users can SELECT registrations.
  3. Proper policies exist for UPDATE/DELETE based on role/ownership.
*/

-- First, drop conflicting policies to ensure a clean slate for this table
DROP POLICY IF EXISTS "Anyone can create registrations" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Users can update registrations" ON registrations;
DROP POLICY IF EXISTS "Users can delete registrations" ON registrations;
DROP POLICY IF EXISTS "Users can view registrations based on role" ON registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON registrations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON registrations;

-- 1. INSERT: Allow any authenticated user (or anon if public reg is needed)
-- Assuming we want at least authenticated users to verify they are logged in.
-- If public registration is a feature, we add 'anon'.
CREATE POLICY "Enable insert for authenticated users only"
ON registrations FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. SELECT: Allow authenticated users to view all
CREATE POLICY "Enable select for authenticated users"
ON registrations FOR SELECT
TO authenticated
USING (true);

-- 3. UPDATE: Users can update their own, Admins/Orgs can update others
CREATE POLICY "Enable update for owners and admins"
ON registrations FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'state_admin', 'organization', 'manager')
  )
)
WITH CHECK (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'state_admin', 'organization', 'manager')
  )
);

-- 4. DELETE: Admins only (or owners if allowed)
CREATE POLICY "Enable delete for admins"
ON registrations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'state_admin')
  )
);
