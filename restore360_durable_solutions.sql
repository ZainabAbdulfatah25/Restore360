/*
  RESTORE360 DURABLE SOLUTIONS MODULE
  
  This script creates the database structure for tracking Durable Solutions Assessments (Scorecards).
  
  INSTRUCTIONS:
  Run this script in the Supabase SQL Editor.
*/

-- Create the durable_solutions_assessments table
CREATE TABLE IF NOT EXISTS durable_solutions_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES registrations(id) NOT NULL,
  assessment_date date DEFAULT CURRENT_DATE,
  assessor_id uuid REFERENCES auth.users(id),
  
  -- Key Dimensions (Score 1-5)
  safety_score integer CHECK (safety_score BETWEEN 1 AND 5),
  housing_score integer CHECK (housing_score BETWEEN 1 AND 5),
  livelihood_score integer CHECK (livelihood_score BETWEEN 1 AND 5),
  social_cohesion_score integer CHECK (social_cohesion_score BETWEEN 1 AND 5),
  access_to_services_score integer CHECK (access_to_services_score BETWEEN 1 AND 5),
  
  notes text,
  next_followup_date date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE durable_solutions_assessments ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dsa_registration_id ON durable_solutions_assessments(registration_id);
CREATE INDEX IF NOT EXISTS idx_dsa_assessment_date ON durable_solutions_assessments(assessment_date DESC);

-- RLS Policies

-- Policies
DO $$
BEGIN
    -- Policy: Authenticated users can view assessments
    DROP POLICY IF EXISTS "Users can view all assessments" ON durable_solutions_assessments;
    CREATE POLICY "Users can view all assessments"
      ON durable_solutions_assessments FOR SELECT
      TO authenticated
      USING (true);

    -- Policy: Authenticated users can create assessments
    DROP POLICY IF EXISTS "Users can create assessments" ON durable_solutions_assessments;
    CREATE POLICY "Users can create assessments"
      ON durable_solutions_assessments FOR INSERT
      TO authenticated
      WITH CHECK (true);

    -- Policy: Users can update assessments
    DROP POLICY IF EXISTS "Users can update assessments" ON durable_solutions_assessments;
    CREATE POLICY "Users can update assessments"
      ON durable_solutions_assessments FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
END $$;
