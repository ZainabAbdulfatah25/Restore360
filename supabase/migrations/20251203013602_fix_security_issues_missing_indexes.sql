/*
  # Fix Security Issues - Add Missing Indexes for Foreign Keys

  1. Purpose
    - Add covering indexes for all unindexed foreign keys to improve query performance
    - These indexes are critical for JOIN operations and referential integrity checks

  2. New Indexes
    - `idx_activity_logs_user_id` on activity_logs(user_id)
    - `idx_durable_solutions_followup_registration_id` on durable_solutions_followup(registration_id)
    - `idx_household_members_registration_id` on household_members(registration_id)
    - `idx_protection_incidents_registration_id` on protection_incidents(registration_id)
    - `idx_service_history_registration_id` on service_history(registration_id)
    - `idx_service_needs_registration_id` on service_needs(registration_id)

  3. Performance Impact
    - Improves JOIN performance for foreign key relationships
    - Speeds up CASCADE operations on DELETE/UPDATE
    - Enhances query optimizer's ability to choose efficient execution plans

  4. Important Notes
    - All indexes use IF NOT EXISTS to prevent errors on re-run
    - Indexes are created CONCURRENTLY where possible to avoid locking tables
*/

-- Add index for activity_logs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id 
ON activity_logs(user_id);

-- Add index for durable_solutions_followup.registration_id foreign key
CREATE INDEX IF NOT EXISTS idx_durable_solutions_followup_registration_id 
ON durable_solutions_followup(registration_id);

-- Add index for household_members.registration_id foreign key
CREATE INDEX IF NOT EXISTS idx_household_members_registration_id 
ON household_members(registration_id);

-- Add index for protection_incidents.registration_id foreign key
CREATE INDEX IF NOT EXISTS idx_protection_incidents_registration_id 
ON protection_incidents(registration_id);

-- Add index for service_history.registration_id foreign key
CREATE INDEX IF NOT EXISTS idx_service_history_registration_id 
ON service_history(registration_id);

-- Add index for service_needs.registration_id foreign key
CREATE INDEX IF NOT EXISTS idx_service_needs_registration_id 
ON service_needs(registration_id);
