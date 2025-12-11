/*
  # Add referred_from field to referrals table

  ## Changes
  
  1. Add referred_from column to referrals table
    - This field stores who/which organization is making the referral
  
  2. Make it optional as existing records won't have this data
*/

-- Add referred_from field to referrals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'referred_from'
  ) THEN
    ALTER TABLE referrals ADD COLUMN referred_from text;
  END IF;
END $$;
