/*
  # Fix Security Issues - Part 1: Foreign Key Indexes

  ## Changes Applied

  1. **Foreign Key Indexes**
     - Add indexes for all unindexed foreign keys to improve query performance:
       - cases.approved_by
       - durable_solutions_followup.conducted_by
       - organizations.created_by
       - protection_incidents.reported_by
       - referrals.approved_by
       - registrations.approved_by

  2. **Drop Unused Indexes**
     - Remove indexes that are not being used by queries to reduce maintenance overhead

  ## Security Notes
  - Performance improvements through proper indexing
  - Reduced database maintenance overhead
*/

-- ============================================================================
-- 1. CREATE FOREIGN KEY INDEXES
-- ============================================================================

-- Index for cases.approved_by
CREATE INDEX IF NOT EXISTS idx_cases_approved_by ON cases(approved_by);

-- Index for durable_solutions_followup.conducted_by
CREATE INDEX IF NOT EXISTS idx_durable_solutions_followup_conducted_by 
  ON durable_solutions_followup(conducted_by);

-- Index for organizations.created_by
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- Index for protection_incidents.reported_by
CREATE INDEX IF NOT EXISTS idx_protection_incidents_reported_by 
  ON protection_incidents(reported_by);

-- Index for referrals.approved_by
CREATE INDEX IF NOT EXISTS idx_referrals_approved_by ON referrals(approved_by);

-- Index for registrations.approved_by
CREATE INDEX IF NOT EXISTS idx_registrations_approved_by ON registrations(approved_by);

-- ============================================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_followup_registration;
DROP INDEX IF EXISTS idx_followup_date;
DROP INDEX IF EXISTS idx_users_language;
DROP INDEX IF EXISTS idx_organizations_type;
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_created_at;
DROP INDEX IF EXISTS idx_activity_logs_resource;
DROP INDEX IF EXISTS idx_referrals_approval_status;
DROP INDEX IF EXISTS idx_referrals_status;
DROP INDEX IF EXISTS idx_cases_approval_status;
DROP INDEX IF EXISTS idx_cases_status;
DROP INDEX IF EXISTS idx_registrations_approval_status;
DROP INDEX IF EXISTS idx_registrations_qr_code;
DROP INDEX IF EXISTS idx_registrations_status;
DROP INDEX IF EXISTS idx_registrations_created_at;
DROP INDEX IF EXISTS idx_household_members_registration_id;
DROP INDEX IF EXISTS idx_service_history_registration;
DROP INDEX IF EXISTS idx_service_history_date;
DROP INDEX IF EXISTS idx_service_needs_registration;
DROP INDEX IF EXISTS idx_service_needs_status;
DROP INDEX IF EXISTS idx_service_needs_urgent;
DROP INDEX IF EXISTS idx_protection_incidents_registration;
DROP INDEX IF EXISTS idx_protection_incidents_date;