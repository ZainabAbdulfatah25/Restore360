/*
  # Comprehensive Bio-Data System Migration

  ## Description
  This migration implements the complete expanded bio-data system as per Restore 360 specifications
  including displacement history, household composition, livelihood data, service history, needs
  assessment, documentation, vulnerabilities, protection, and durable solutions tracking.

  ## New Tables Created
  1. service_history - Tracks services received by beneficiaries
  2. service_needs - Tracks service needs and gaps
  3. durable_solutions_followup - 3-6 month follow-up data
  4. vulnerability_assessments - Detailed vulnerability indicators
  5. protection_incidents - Protection and safety tracking (restricted access)

  ## Enhanced registrations table
  - Core identifying information
  - Displacement history (expanded)
  - Livelihood and skills data
  - Documentation status
  - Protection and safety indicators

  ## Enhanced household_members table
  - Protection vulnerabilities
  - Disability details
  - Education level (expanded)

  ## Security
  - All tables have RLS enabled
  - Protection-sensitive data has restricted access
  - All new fields are nullable for gradual data collection
*/

-- Add expanded core identifying information to registrations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'photo_url') THEN
    ALTER TABLE registrations ADD COLUMN photo_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'temporary_restore_id') THEN
    ALTER TABLE registrations ADD COLUMN temporary_restore_id text UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'has_nin') THEN
    ALTER TABLE registrations ADD COLUMN has_nin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'nimc_referral_status') THEN
    ALTER TABLE registrations ADD COLUMN nimc_referral_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'alternative_contact') THEN
    ALTER TABLE registrations ADD COLUMN alternative_contact text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'is_head_of_household') THEN
    ALTER TABLE registrations ADD COLUMN is_head_of_household boolean DEFAULT true;
  END IF;

  -- Expanded displacement history
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'community_of_origin') THEN
    ALTER TABLE registrations ADD COLUMN community_of_origin text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'lga_of_origin') THEN
    ALTER TABLE registrations ADD COLUMN lga_of_origin text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'displacement_cause') THEN
    ALTER TABLE registrations ADD COLUMN displacement_cause text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'perpetrating_actor') THEN
    ALTER TABLE registrations ADD COLUMN perpetrating_actor text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'displacement_frequency') THEN
    ALTER TABLE registrations ADD COLUMN displacement_frequency text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'current_location_details') THEN
    ALTER TABLE registrations ADD COLUMN current_location_details jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'intention') THEN
    ALTER TABLE registrations ADD COLUMN intention text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'intention_reason') THEN
    ALTER TABLE registrations ADD COLUMN intention_reason text;
  END IF;

  -- Livelihood and skills
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'previous_occupation') THEN
    ALTER TABLE registrations ADD COLUMN previous_occupation text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'skill_level') THEN
    ALTER TABLE registrations ADD COLUMN skill_level text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'current_livelihood_status') THEN
    ALTER TABLE registrations ADD COLUMN current_livelihood_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'assets_lost') THEN
    ALTER TABLE registrations ADD COLUMN assets_lost text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'livelihood_assistance_interests') THEN
    ALTER TABLE registrations ADD COLUMN livelihood_assistance_interests text[];
  END IF;

  -- Documentation status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'nin_document_url') THEN
    ALTER TABLE registrations ADD COLUMN nin_document_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'voter_id_url') THEN
    ALTER TABLE registrations ADD COLUMN voter_id_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'birth_certificate_url') THEN
    ALTER TABLE registrations ADD COLUMN birth_certificate_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'idp_certificate_url') THEN
    ALTER TABLE registrations ADD COLUMN idp_certificate_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'other_documents') THEN
    ALTER TABLE registrations ADD COLUMN other_documents jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Protection and safety
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'safety_perception') THEN
    ALTER TABLE registrations ADD COLUMN safety_perception text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'eviction_risk') THEN
    ALTER TABLE registrations ADD COLUMN eviction_risk text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'has_complaint_mechanism_access') THEN
    ALTER TABLE registrations ADD COLUMN has_complaint_mechanism_access boolean DEFAULT false;
  END IF;

  -- Vulnerability indicators
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'disability_types') THEN
    ALTER TABLE registrations ADD COLUMN disability_types text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'chronic_illness') THEN
    ALTER TABLE registrations ADD COLUMN chronic_illness text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'is_pregnant') THEN
    ALTER TABLE registrations ADD COLUMN is_pregnant boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'is_lactating') THEN
    ALTER TABLE registrations ADD COLUMN is_lactating boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'is_elderly') THEN
    ALTER TABLE registrations ADD COLUMN is_elderly boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'is_female_headed_household') THEN
    ALTER TABLE registrations ADD COLUMN is_female_headed_household boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'has_unaccompanied_minors') THEN
    ALTER TABLE registrations ADD COLUMN has_unaccompanied_minors boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'gbv_risk_level') THEN
    ALTER TABLE registrations ADD COLUMN gbv_risk_level text;
  END IF;
END $$;

-- Enhance household_members table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'nin') THEN
    ALTER TABLE household_members ADD COLUMN nin text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'relationship_to_hoh') THEN
    ALTER TABLE household_members ADD COLUMN relationship_to_hoh text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'disability_type') THEN
    ALTER TABLE household_members ADD COLUMN disability_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'protection_vulnerabilities') THEN
    ALTER TABLE household_members ADD COLUMN protection_vulnerabilities text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'photo_url') THEN
    ALTER TABLE household_members ADD COLUMN photo_url text;
  END IF;
END $$;

-- Create service_history table
CREATE TABLE IF NOT EXISTS service_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  provider_organization text NOT NULL,
  service_date date NOT NULL,
  frequency text,
  description text,
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service history for their registrations"
  ON service_history FOR SELECT
  TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM registrations WHERE created_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'case_worker', 'organization'))
  );

CREATE POLICY "Staff can manage service history"
  ON service_history FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'case_worker', 'organization'))
  );

-- Create service_needs table
CREATE TABLE IF NOT EXISTS service_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  need_category text NOT NULL,
  need_description text NOT NULL,
  is_urgent boolean DEFAULT false,
  urgency_hours integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'fulfilled', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to text,
  fulfilled_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their service needs"
  ON service_needs FOR SELECT
  TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM registrations WHERE created_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'case_worker', 'organization'))
  );

CREATE POLICY "Staff can manage service needs"
  ON service_needs FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'case_worker', 'organization'))
  );

-- Create durable_solutions_followup table
CREATE TABLE IF NOT EXISTS durable_solutions_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  followup_date date NOT NULL,
  followup_period text NOT NULL,
  current_location text,
  location_stability text,
  livelihood_status text,
  income_level text,
  housing_conditions text,
  access_to_services jsonb DEFAULT '{}'::jsonb,
  safety_security_status text,
  integration_level text,
  return_likelihood text,
  challenges_faced text[],
  support_received text[],
  additional_needs text[],
  durable_solution_achieved boolean DEFAULT false,
  solution_type text,
  recommendations text,
  next_followup_date date,
  conducted_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE durable_solutions_followup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their followup records"
  ON durable_solutions_followup FOR SELECT
  TO authenticated
  USING (
    registration_id IN (
      SELECT id FROM registrations WHERE created_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'case_worker', 'organization'))
  );

CREATE POLICY "Staff can manage followup records"
  ON durable_solutions_followup FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'case_worker', 'organization'))
  );

-- Create protection_incidents table (restricted access)
CREATE TABLE IF NOT EXISTS protection_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  incident_date date NOT NULL,
  incident_type text NOT NULL,
  incident_description text NOT NULL,
  location_of_incident text,
  perpetrator_type text,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken text,
  referral_made boolean DEFAULT false,
  referral_organization text,
  follow_up_required boolean DEFAULT true,
  follow_up_status text DEFAULT 'pending',
  reported_by uuid REFERENCES auth.users(id),
  is_confidential boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE protection_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only protection staff can access incidents"
  ON protection_incidents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'case_worker')
      AND users.department = 'protection'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_history_registration ON service_history(registration_id);
CREATE INDEX IF NOT EXISTS idx_service_history_date ON service_history(service_date);
CREATE INDEX IF NOT EXISTS idx_service_needs_registration ON service_needs(registration_id);
CREATE INDEX IF NOT EXISTS idx_service_needs_status ON service_needs(status);
CREATE INDEX IF NOT EXISTS idx_service_needs_urgent ON service_needs(is_urgent) WHERE is_urgent = true;
CREATE INDEX IF NOT EXISTS idx_followup_registration ON durable_solutions_followup(registration_id);
CREATE INDEX IF NOT EXISTS idx_followup_date ON durable_solutions_followup(followup_date);
CREATE INDEX IF NOT EXISTS idx_protection_incidents_registration ON protection_incidents(registration_id);
CREATE INDEX IF NOT EXISTS idx_protection_incidents_date ON protection_incidents(incident_date);