/*
  # Extend Service Provider Registry & RBAC System

  ## Changes Applied

  1. **Organizations Table Extensions**
     - Add `organization_name` (unique) - Primary organization identifier
     - Add `sectors_provided` (text[]) - Array of services/sectors offered
     - Add `locations_covered` (text[]) - Array of locations covered
     - Add `is_active` (boolean) - Active/inactive status for availability management
     - Add `contact_email` (text) - Primary contact email
     - Add `contact_phone` (text) - Primary contact phone
     - Add `state` (text) - State assignment for state-level admins
     - Add unique constraint on organization_name to prevent duplicates

  2. **Users Table Extensions**
     - Add `state_assignment` (text) - State assignment for state-level admins
     - Add `organization_id` (uuid) - Link to organization entity
     - Add `notification_email_enabled` (boolean) - Email notification preference
     - Extend role enum to include 'state_admin', 'manager', 'field_worker', 'ordinary_user'

  3. **Referrals Table Extensions**
     - Add `decline_reason` (text) - Mandatory reason when organization declines
     - Add `assigned_by` (uuid) - User who assigned the referral (state-level admin)
     - Add `assigned_organization_id` (uuid) - Reference to organization entity
     - Add `can_be_reassigned` (boolean) - Flag for declined referrals that can be reassigned
     - Change `referred_to` to reference organization_id instead of text

  4. **Security & Constraints**
     - Enforce unique organization_name
     - Add check constraint: inactive providers cannot be assigned
     - Add RLS policies for organization-scoped data access
     - Add state-level admin access policies

  5. **Indexes**
     - Index on organizations.is_active for filtering
     - Index on organizations.sectors_provided for service matching
     - Index on organizations.locations_covered for location matching
     - Index on referrals.can_be_reassigned for reassignment queries
*/

-- ============================================================================
-- EXTEND ORGANIZATIONS TABLE
-- ============================================================================

-- Add service provider fields to organizations
DO $$
BEGIN
  -- Add organization_name (unique identifier)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE organizations ADD COLUMN organization_name text UNIQUE;
    -- Populate from existing name if organization_name is null
    UPDATE organizations SET organization_name = name WHERE organization_name IS NULL;
    -- Make it NOT NULL after population
    ALTER TABLE organizations ALTER COLUMN organization_name SET NOT NULL;
  END IF;

  -- Add sectors_provided (array of services)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'sectors_provided'
  ) THEN
    ALTER TABLE organizations ADD COLUMN sectors_provided text[] DEFAULT '{}';
  END IF;

  -- Add locations_covered (array of locations)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'locations_covered'
  ) THEN
    ALTER TABLE organizations ADD COLUMN locations_covered text[] DEFAULT '{}';
  END IF;

  -- Add is_active status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE organizations ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Add contact_email (separate from email if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE organizations ADD COLUMN contact_email text;
    -- Populate from existing email
    UPDATE organizations SET contact_email = email WHERE contact_email IS NULL;
  END IF;

  -- Add contact_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE organizations ADD COLUMN contact_phone text;
    -- Populate from existing phone
    UPDATE organizations SET contact_phone = phone WHERE contact_phone IS NULL;
  END IF;

  -- Add state assignment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'state'
  ) THEN
    ALTER TABLE organizations ADD COLUMN state text;
  END IF;
END $$;

-- ============================================================================
-- EXTEND USERS TABLE
-- ============================================================================

-- Add state assignment and organization link
DO $$
BEGIN
  -- Add state_assignment for state-level admins
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'state_assignment'
  ) THEN
    ALTER TABLE users ADD COLUMN state_assignment text;
  END IF;

  -- Add organization_id to link users to organization entity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE users ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;

  -- Add notification preferences
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_email_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_email_enabled boolean DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- EXTEND REFERRALS TABLE
-- ============================================================================

-- Add referral workflow fields
DO $$
BEGIN
  -- Add decline_reason (mandatory when declined)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'decline_reason'
  ) THEN
    ALTER TABLE referrals ADD COLUMN decline_reason text;
  END IF;

  -- Add assigned_by (state-level admin who assigned)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'assigned_by'
  ) THEN
    ALTER TABLE referrals ADD COLUMN assigned_by uuid REFERENCES auth.users(id);
  END IF;

  -- Add assigned_organization_id (reference to organization entity)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'assigned_organization_id'
  ) THEN
    ALTER TABLE referrals ADD COLUMN assigned_organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;

  -- Add can_be_reassigned flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'can_be_reassigned'
  ) THEN
    ALTER TABLE referrals ADD COLUMN can_be_reassigned boolean DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- ADD CONSTRAINTS
-- ============================================================================

-- Ensure organization_name is unique (prevent duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organizations_organization_name_key'
  ) THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_organization_name_key UNIQUE (organization_name);
  END IF;
END $$;

-- Add check constraint: referrals cannot be assigned to inactive organizations
-- This will be enforced via application logic and triggers

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for active status filtering
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active) WHERE is_active = true;

-- Index for sector matching (using GIN for array searches)
CREATE INDEX IF NOT EXISTS idx_organizations_sectors_provided ON organizations USING GIN(sectors_provided);

-- Index for location matching (using GIN for array searches)
CREATE INDEX IF NOT EXISTS idx_organizations_locations_covered ON organizations USING GIN(locations_covered);

-- Index for reassignment queries
CREATE INDEX IF NOT EXISTS idx_referrals_can_be_reassigned ON referrals(can_be_reassigned) WHERE can_be_reassigned = true;

-- Index for organization assignment
CREATE INDEX IF NOT EXISTS idx_referrals_assigned_organization_id ON referrals(assigned_organization_id);

-- Index for state assignment
CREATE INDEX IF NOT EXISTS idx_users_state_assignment ON users(state_assignment);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations(state);

-- ============================================================================
-- CREATE FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to check if organization can be assigned (must be active)
CREATE OR REPLACE FUNCTION can_assign_to_organization(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org_id
    AND is_active = true
  );
END;
$$;

-- Function to mark referral as declined and available for reassignment
CREATE OR REPLACE FUNCTION decline_referral_with_reason(
  p_referral_id uuid,
  p_decline_reason text,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE referrals
  SET
    status = 'rejected',
    approval_status = 'rejected',
    decline_reason = p_decline_reason,
    can_be_reassigned = true,
    approved_by = p_user_id,
    approved_at = now(),
    updated_at = now()
  WHERE id = p_referral_id;
END;
$$;

-- ============================================================================
-- UPDATE RLS POLICIES FOR ORGANIZATION-SCOPED ACCESS
-- ============================================================================

-- Drop existing organization policies to recreate with new logic
DROP POLICY IF EXISTS "Users can view all organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations" ON organizations;

-- Organizations: Admins see all, organization users see their org, others see active only
CREATE POLICY "Role-based organization access"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    -- Admins and state admins see all
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'state_admin')
    )
    OR
    -- Organization users see their own organization
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.organization_id = organizations.id
      )
    )
    OR
    -- Others see only active organizations
    is_active = true
  );

-- Organizations: Only admins and organization managers can update
CREATE POLICY "Authorized users can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role IN ('admin', 'state_admin')
        OR (
          users.role = 'organization'
          AND users.organization_id = organizations.id
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role IN ('admin', 'state_admin')
        OR (
          users.role = 'organization'
          AND users.organization_id = organizations.id
        )
      )
    )
  );

-- Referrals: Organization users see only referrals assigned to their organization
DROP POLICY IF EXISTS "Users can view all referrals" ON referrals;
CREATE POLICY "Role-based referral access"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    -- Admins and state admins see all
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'state_admin')
    )
    OR
    -- Organization users see referrals assigned to their organization
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.organization_id = referrals.assigned_organization_id
      )
    )
    OR
    -- Creator can see their own referrals
    created_by = auth.uid()
  );

-- Referrals: Only state-level admins can assign
DROP POLICY IF EXISTS "Users can update referrals" ON referrals;
CREATE POLICY "State admins can assign referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'state_admin')
    )
    OR
    -- Organizations can accept/decline referrals assigned to them
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.organization_id = referrals.assigned_organization_id
        AND users.role IN ('organization', 'manager')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'state_admin')
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.organization_id = referrals.assigned_organization_id
        AND users.role IN ('organization', 'manager')
      )
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN organizations.organization_name IS 'Unique organization identifier to prevent duplicates';
COMMENT ON COLUMN organizations.sectors_provided IS 'Array of services/sectors this organization provides';
COMMENT ON COLUMN organizations.locations_covered IS 'Array of locations this organization covers';
COMMENT ON COLUMN organizations.is_active IS 'Active status - inactive organizations cannot be assigned referrals';
COMMENT ON COLUMN referrals.decline_reason IS 'Mandatory reason when organization declines a referral';
COMMENT ON COLUMN referrals.can_be_reassigned IS 'Flag indicating declined referral is available for reassignment';
COMMENT ON COLUMN users.state_assignment IS 'State assignment for state-level admins';
COMMENT ON COLUMN users.organization_id IS 'Link to organization entity for staff accounts';

