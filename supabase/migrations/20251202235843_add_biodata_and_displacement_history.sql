/*
  # Add Bio Data and Displacement History Fields

  ## Description
  This migration extends the registrations and household_members tables to include comprehensive
  bio data and displacement history as per Restore 360 requirements.

  ## Changes to registrations table
  1. New Bio Data Fields:
    - nationality (text) - Country of origin
    - ethnicity (text) - Ethnic group
    - religion (text) - Religious affiliation
    - marital_status (text) - Marital status
    - education_level (text) - Highest education level
    - occupation (text) - Current or previous occupation
    - disabilities (text[]) - Array of disabilities/special needs
    - medical_conditions (text[]) - Array of medical conditions
    - emergency_contact_name (text) - Emergency contact person
    - emergency_contact_phone (text) - Emergency contact number
    - emergency_contact_relationship (text) - Relationship to emergency contact

  2. Displacement History Fields:
    - displacement_status (text) - Current displacement status
    - displacement_date (date) - Date of displacement
    - place_of_origin (text) - Original place of residence
    - place_of_origin_district (text) - District of origin
    - place_of_origin_region (text) - Region/state of origin
    - current_location (text) - Current place of residence
    - current_location_district (text) - Current district
    - current_location_region (text) - Current region/state
    - displacement_reason (text) - Reason for displacement
    - displacement_duration (text) - How long displaced
    - previous_displacements (jsonb) - History of previous displacements
    - shelter_type (text) - Type of current shelter
    - has_documentation (boolean) - Has identification documents
    - documentation_types (text[]) - Types of documents possessed

  3. Organization Assignment:
    - assigned_organization (text) - Organization assigned to handle case
    - organization_contact (text) - Contact person at organization
    - assignment_date (timestamptz) - When assigned to organization

  ## Changes to household_members table
  1. Extended Bio Data:
    - nationality (text)
    - ethnicity (text)
    - religion (text)
    - education_level (text)
    - occupation (text)
    - disabilities (text[])
    - medical_conditions (text[])
    - marital_status (text)

  ## Security
  - Maintains existing RLS policies
  - All new fields are nullable to support gradual data collection
*/

-- Add bio data fields to registrations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'nationality') THEN
    ALTER TABLE registrations ADD COLUMN nationality text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'ethnicity') THEN
    ALTER TABLE registrations ADD COLUMN ethnicity text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'religion') THEN
    ALTER TABLE registrations ADD COLUMN religion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'marital_status') THEN
    ALTER TABLE registrations ADD COLUMN marital_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'education_level') THEN
    ALTER TABLE registrations ADD COLUMN education_level text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'occupation') THEN
    ALTER TABLE registrations ADD COLUMN occupation text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'disabilities') THEN
    ALTER TABLE registrations ADD COLUMN disabilities text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'medical_conditions') THEN
    ALTER TABLE registrations ADD COLUMN medical_conditions text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'emergency_contact_name') THEN
    ALTER TABLE registrations ADD COLUMN emergency_contact_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'emergency_contact_phone') THEN
    ALTER TABLE registrations ADD COLUMN emergency_contact_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'emergency_contact_relationship') THEN
    ALTER TABLE registrations ADD COLUMN emergency_contact_relationship text;
  END IF;

  -- Displacement history fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'displacement_status') THEN
    ALTER TABLE registrations ADD COLUMN displacement_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'displacement_date') THEN
    ALTER TABLE registrations ADD COLUMN displacement_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'place_of_origin') THEN
    ALTER TABLE registrations ADD COLUMN place_of_origin text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'place_of_origin_district') THEN
    ALTER TABLE registrations ADD COLUMN place_of_origin_district text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'place_of_origin_region') THEN
    ALTER TABLE registrations ADD COLUMN place_of_origin_region text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'current_location') THEN
    ALTER TABLE registrations ADD COLUMN current_location text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'current_location_district') THEN
    ALTER TABLE registrations ADD COLUMN current_location_district text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'current_location_region') THEN
    ALTER TABLE registrations ADD COLUMN current_location_region text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'displacement_reason') THEN
    ALTER TABLE registrations ADD COLUMN displacement_reason text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'displacement_duration') THEN
    ALTER TABLE registrations ADD COLUMN displacement_duration text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'previous_displacements') THEN
    ALTER TABLE registrations ADD COLUMN previous_displacements jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'shelter_type') THEN
    ALTER TABLE registrations ADD COLUMN shelter_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'has_documentation') THEN
    ALTER TABLE registrations ADD COLUMN has_documentation boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'documentation_types') THEN
    ALTER TABLE registrations ADD COLUMN documentation_types text[];
  END IF;

  -- Organization assignment fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'assigned_organization') THEN
    ALTER TABLE registrations ADD COLUMN assigned_organization text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'organization_contact') THEN
    ALTER TABLE registrations ADD COLUMN organization_contact text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'assignment_date') THEN
    ALTER TABLE registrations ADD COLUMN assignment_date timestamptz;
  END IF;
END $$;

-- Add bio data fields to household_members
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'nationality') THEN
    ALTER TABLE household_members ADD COLUMN nationality text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'ethnicity') THEN
    ALTER TABLE household_members ADD COLUMN ethnicity text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'religion') THEN
    ALTER TABLE household_members ADD COLUMN religion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'education_level') THEN
    ALTER TABLE household_members ADD COLUMN education_level text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'occupation') THEN
    ALTER TABLE household_members ADD COLUMN occupation text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'disabilities') THEN
    ALTER TABLE household_members ADD COLUMN disabilities text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'medical_conditions') THEN
    ALTER TABLE household_members ADD COLUMN medical_conditions text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'marital_status') THEN
    ALTER TABLE household_members ADD COLUMN marital_status text;
  END IF;
END $$;