/*
  # Fix Security Issues - Part 3: Function Search Path

  ## Changes Applied

  1. **Function Security**
     - Fix search_path for update_updated_at_column function to prevent search_path manipulation attacks
     - Set search_path to 'public' to ensure the function only accesses objects in the public schema

  ## Security Notes
  - Prevents potential security issues from mutable search_path
  - Function behavior remains the same but is now more secure
*/

-- ============================================================================
-- FIX FUNCTION SEARCH PATH
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;