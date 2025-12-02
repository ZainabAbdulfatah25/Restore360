/*
  # Create household members table and QR code system

  ## New Tables
  
  1. household_members
    - Stores individual family member information
    - Links to main registration (household)
    - Includes relationship, age, gender, etc.
  
  ## Changes to registrations table
  
  1. Add household-related fields:
    - household_size (number of members)
    - qr_code (unique QR code identifier)
    - household_head (name of household head)
  
  ## Security
  
  - Enable RLS on household_members table
  - Add policies for authenticated users
*/

-- Add household fields to registrations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'household_size'
  ) THEN
    ALTER TABLE registrations ADD COLUMN household_size integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'qr_code'
  ) THEN
    ALTER TABLE registrations ADD COLUMN qr_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'household_head'
  ) THEN
    ALTER TABLE registrations ADD COLUMN household_head text;
  END IF;
END $$;

-- Create household_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  relationship text NOT NULL,
  gender text NOT NULL,
  date_of_birth date,
  age integer,
  id_number text,
  phone text,
  special_needs text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on household_members
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view household members" ON household_members;
  DROP POLICY IF EXISTS "Authenticated users can create household members" ON household_members;
  DROP POLICY IF EXISTS "Authenticated users can update household members" ON household_members;
  DROP POLICY IF EXISTS "Authenticated users can delete household members" ON household_members;
END $$;

-- Create policies for household_members
CREATE POLICY "Authenticated users can view household members"
  ON household_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create household members"
  ON household_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update household members"
  ON household_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete household members"
  ON household_members FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_household_members_registration_id 
  ON household_members(registration_id);

CREATE INDEX IF NOT EXISTS idx_registrations_qr_code 
  ON registrations(qr_code);
