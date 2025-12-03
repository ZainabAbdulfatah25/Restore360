/*
  # Add Description Field to Users Table

  ## Changes
  1. Add `description` column to the users table to store user bio/description
  
  ## Details
  - New column: `description` (text, nullable)
  - Allows admins to add notes or descriptions about users
*/

-- Add description column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'description'
  ) THEN
    ALTER TABLE users ADD COLUMN description TEXT;
  END IF;
END $$;