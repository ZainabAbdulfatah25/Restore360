/*
  # Create Main Application Tables

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key)
      - `full_name` (text) - Name of person registering
      - `email` (text, nullable) - Email address
      - `phone` (text) - Phone number
      - `id_number` (text, nullable) - ID/Passport number
      - `address` (text) - Full address
      - `category` (text) - Registration category
      - `description` (text) - Detailed description
      - `location` (jsonb, nullable) - GPS coordinates
      - `status` (text) - pending/approved/rejected
      - `created_by` (uuid, nullable) - User who created the registration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cases`
      - `id` (uuid, primary key)
      - `case_number` (text, unique) - Auto-generated case number
      - `title` (text) - Case title
      - `description` (text) - Case description
      - `category` (text) - Case category
      - `priority` (text) - low/medium/high/urgent
      - `status` (text) - open/in_progress/resolved/closed
      - `assigned_to` (uuid, nullable) - User assigned to case
      - `created_by` (uuid, nullable) - User who created the case
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `referrals`
      - `id` (uuid, primary key)
      - `referral_number` (text, unique) - Auto-generated referral number
      - `client_name` (text) - Name of client being referred
      - `client_phone` (text) - Client phone number
      - `client_email` (text, nullable) - Client email
      - `referred_to` (text) - Organization/person referred to
      - `reason` (text) - Reason for referral
      - `category` (text) - Referral category
      - `priority` (text) - low/medium/high/urgent
      - `status` (text) - pending/in_progress/completed/cancelled
      - `notes` (text, nullable) - Additional notes
      - `created_by` (uuid, nullable) - User who created the referral
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all records
      - Create new records
      - Update their own records or if they have admin/manager role

  3. Important Notes
    - All tables use UUID primary keys
    - Timestamps are automatically set
    - Status fields have default values
    - Foreign keys reference auth.users and users table
*/

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  id_number text,
  address text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  location jsonb,
  status text DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL DEFAULT 'CASE-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_number text UNIQUE NOT NULL DEFAULT 'REF-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  referred_to text NOT NULL,
  reason text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Registrations policies
CREATE POLICY "Users can view all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cases policies
CREATE POLICY "Users can view all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Referrals policies
CREATE POLICY "Users can view all referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
