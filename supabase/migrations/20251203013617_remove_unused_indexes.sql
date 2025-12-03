/*
  # Remove Unused Indexes

  1. Purpose
    - Remove indexes that are not being used by the query optimizer
    - Reduces storage overhead and improves INSERT/UPDATE/DELETE performance
    - Unused indexes consume disk space and slow down write operations

  2. Indexes Being Removed
    - `idx_durable_solutions_followup_conducted_by` - Not used by queries
    - `idx_organizations_created_by` - Not used by queries
    - `idx_referrals_approved_by` - Not used by queries
    - `idx_cases_approved_by` - Not used by queries
    - `idx_registrations_approved_by` - Not used by queries
    - `idx_protection_incidents_reported_by` - Not used by queries

  3. Performance Impact
    - Faster INSERT/UPDATE/DELETE operations on affected tables
    - Reduced storage requirements
    - Lower maintenance overhead for index updates

  4. Important Notes
    - All indexes use IF EXISTS to prevent errors if already removed
    - These indexes were created but are not used by the query planner
    - If query patterns change and these become useful, they can be recreated
*/

-- Remove unused index on durable_solutions_followup.conducted_by
DROP INDEX IF EXISTS idx_durable_solutions_followup_conducted_by;

-- Remove unused index on organizations.created_by
DROP INDEX IF EXISTS idx_organizations_created_by;

-- Remove unused index on referrals.approved_by
DROP INDEX IF EXISTS idx_referrals_approved_by;

-- Remove unused index on cases.approved_by
DROP INDEX IF EXISTS idx_cases_approved_by;

-- Remove unused index on registrations.approved_by
DROP INDEX IF EXISTS idx_registrations_approved_by;

-- Remove unused index on protection_incidents.reported_by
DROP INDEX IF EXISTS idx_protection_incidents_reported_by;
