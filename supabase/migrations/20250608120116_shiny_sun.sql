/*
  # Add site column to problems table

  1. Changes
    - Add `site` column to problems table to store the platform (LeetCode, Codeforces, etc.)
    - Add check constraint for valid sites
    - Update existing problems to have null site (optional)

  2. Security
    - No changes to RLS policies needed
*/

-- Add site column to problems table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'problems' AND column_name = 'site'
  ) THEN
    ALTER TABLE problems ADD COLUMN site text;
  END IF;
END $$;

-- Add check constraint for valid sites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'problems_site_check'
  ) THEN
    ALTER TABLE problems ADD CONSTRAINT problems_site_check 
    CHECK (site IS NULL OR site = ANY (ARRAY[
      'LeetCode'::text, 
      'Codeforces'::text, 
      'HackerRank'::text, 
      'AtCoder'::text, 
      'CodeChef'::text, 
      'TopCoder'::text,
      'SPOJ'::text,
      'GeeksforGeeks'::text,
      'InterviewBit'::text,
      'Custom'::text
    ]));
  END IF;
END $$;