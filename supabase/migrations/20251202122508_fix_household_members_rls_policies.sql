/*
  # Fix household_members RLS policies for public access

  ## Changes
  
  1. Drop existing policies
  2. Create new policies that allow:
     - Anyone (including anonymous) to insert household members
     - Authenticated users to view household members
     - Authenticated users to update/delete household members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view household members" ON household_members;
DROP POLICY IF EXISTS "Authenticated users can create household members" ON household_members;
DROP POLICY IF EXISTS "Authenticated users can update household members" ON household_members;
DROP POLICY IF EXISTS "Authenticated users can delete household members" ON household_members;

-- Create new policies

-- Allow anyone (including anonymous) to create household members
CREATE POLICY "Anyone can create household members"
  ON household_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can view all household members
CREATE POLICY "Authenticated users can view household members"
  ON household_members FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update household members
CREATE POLICY "Authenticated users can update household members"
  ON household_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete household members
CREATE POLICY "Authenticated users can delete household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (true);
