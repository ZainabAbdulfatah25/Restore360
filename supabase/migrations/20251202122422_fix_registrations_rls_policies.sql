/*
  # Fix registrations RLS policies for public and authenticated access

  ## Changes
  
  1. Drop all existing conflicting policies
  2. Create simplified, clear policies:
     - Anonymous users can insert registrations (for public registration)
     - Authenticated users can view all registrations
     - Users can update their own registrations
     - Admins and organizations can update any registration
     - Users can delete their own registrations
     - Admins can delete any registration
*/

-- Drop all existing policies on registrations table
DROP POLICY IF EXISTS "Users can view registrations based on role" ON registrations;
DROP POLICY IF EXISTS "Users can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Users can update own registrations or admins can update" ON registrations;
DROP POLICY IF EXISTS "Admins can update any registration" ON registrations;
DROP POLICY IF EXISTS "Users can delete own registrations or admins can delete" ON registrations;
DROP POLICY IF EXISTS "Admins can delete any registration" ON registrations;

-- Create new, clear policies

-- Allow anyone (including anonymous) to create registrations
CREATE POLICY "Anyone can create registrations"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can view all registrations
CREATE POLICY "Authenticated users can view all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own registrations, admins and organizations can update any
CREATE POLICY "Users can update registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = created_by) OR 
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'organization')
    ))
  )
  WITH CHECK (
    (auth.uid() = created_by) OR 
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'organization')
    ))
  );

-- Users can delete their own registrations, admins can delete any
CREATE POLICY "Users can delete registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = created_by) OR 
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    ))
  );
