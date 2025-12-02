/*
  # Update assigned_to field in cases table

  ## Changes
  
  1. Drop foreign key constraint on assigned_to
  2. Change assigned_to from UUID to TEXT to support:
     - User IDs (UUIDs stored as text)
     - Organization names
     - Authority names
  
  3. Add assigned_to_type column to distinguish between user/organization assignments
*/

-- Drop the foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cases_assigned_to_fkey' AND table_name = 'cases'
  ) THEN
    ALTER TABLE cases DROP CONSTRAINT cases_assigned_to_fkey;
  END IF;
END $$;

-- Change assigned_to column from uuid to text
ALTER TABLE cases ALTER COLUMN assigned_to TYPE text USING assigned_to::text;

-- Add assigned_to_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'assigned_to_type'
  ) THEN
    ALTER TABLE cases ADD COLUMN assigned_to_type text DEFAULT 'organization';
  END IF;
END $$;
