/*
  # Add Organizations and Update Users Table

  1. Updates to Existing Tables
    - `users`
      - Add `user_type` (text) - 'individual' or 'organization'
      - Add `organization_name` (text, nullable) - For organization accounts
      - Add `organization_type` (text, nullable) - Type of organization
      - Add `language` (text) - User's preferred language (default 'en')

  2. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text) - Organization name
      - `type` (text) - Organization type (NGO, Government, etc.)
      - `email` (text) - Contact email
      - `phone` (text, nullable) - Contact phone
      - `address` (text, nullable) - Organization address
      - `description` (text, nullable) - About the organization
      - `created_by` (uuid) - User who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on organizations table
    - Add policies for authenticated users

  4. Important Notes
    - Users can now be individuals or organizations
    - Language preference stored for each user
    - Organizations can be assigned to cases
*/

-- Add columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE users ADD COLUMN user_type text DEFAULT 'individual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE users ADD COLUMN organization_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'organization_type'
  ) THEN
    ALTER TABLE users ADD COLUMN organization_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'language'
  ) THEN
    ALTER TABLE users ADD COLUMN language text DEFAULT 'en';
  END IF;
END $$;

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add some default organizations/authorities
INSERT INTO organizations (name, type, email, description) VALUES
  ('Nigerian Red Cross', 'NGO', 'contact@redcross.ng', 'Humanitarian organization providing emergency relief and disaster response'),
  ('National Emergency Management Agency (NEMA)', 'Government', 'info@nema.gov.ng', 'Federal government agency responsible for disaster management'),
  ('State Emergency Management Agency (SEMA)', 'Government', 'contact@sema.gov.ng', 'State-level emergency management agency'),
  ('UNHCR Nigeria', 'International', 'nganr@unhcr.org', 'UN Refugee Agency protecting displaced persons'),
  ('International Committee of the Red Cross (ICRC)', 'International', 'icrc@icrc.org', 'International humanitarian organization'),
  ('Caritas Nigeria', 'NGO', 'info@caritasnigeria.org', 'Catholic relief and development organization'),
  ('World Food Programme (WFP)', 'International', 'wfp.nigeria@wfp.org', 'UN agency fighting hunger worldwide')
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
